"""
Web and Wikipedia retrieval for Smart City AI.

Features:
- Live external search fallback (Wikipedia + web snippets)
- Basic full-site crawler (same-domain BFS)
- English-first text extraction
"""

from __future__ import annotations

import logging
import os
import re
from collections import deque
from dataclasses import dataclass
from html import unescape
from html.parser import HTMLParser
from typing import Any, Dict, List, Optional
from urllib.parse import quote, urldefrag, urljoin, urlparse

import requests

logger = logging.getLogger(__name__)


class _HTMLTextExtractor(HTMLParser):
    """Very small HTML to plain-text extractor."""

    def __init__(self) -> None:
        super().__init__()
        self._skip_stack: List[str] = []
        self._chunks: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[tuple]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript"}:
            self._skip_stack.append(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if self._skip_stack and self._skip_stack[-1] == tag:
            self._skip_stack.pop()

    def handle_data(self, data: str) -> None:
        if self._skip_stack:
            return
        text = data.strip()
        if text:
            self._chunks.append(text)

    def get_text(self) -> str:
        return " ".join(self._chunks)


@dataclass
class SearchEvidence:
    source: str
    snippet: str


def _clean_text(text: str) -> str:
    text = unescape(text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _is_english_text(text: str) -> bool:
    if not text:
        return False
    # Keep it simple: reject Cyrillic-heavy text for this english-only assistant.
    return re.search(r"[А-Яа-яЁё]", text) is None


_STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "this",
    "to",
    "what",
    "when",
    "where",
    "which",
    "who",
    "why",
    "with",
    "you",
    "about",
    "after",
    "before",
    "better",
    "day",
    "every",
    "give",
    "help",
    "learn",
    "simple",
    "terms",
    "time",
}


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z]{3,}", (text or "").lower())


def _query_terms(query: str) -> set[str]:
    return {tok for tok in _tokenize(query) if tok not in _STOPWORDS}


def _is_relevant(query_terms: set[str], snippet: str) -> bool:
    if not query_terms:
        return True
    snippet_terms = set(_tokenize(snippet))
    if not snippet_terms:
        return False
    overlap = query_terms & snippet_terms
    return bool(overlap)


def _relevance_score(query_terms: set[str], snippet: str) -> float:
    if not query_terms:
        return 0.0
    snippet_terms = set(_tokenize(snippet))
    if not snippet_terms:
        return 0.0
    overlap = len(query_terms & snippet_terms)
    return overlap / max(1, min(len(query_terms), 8))


class InternetKnowledgeEngine:
    """Search and crawl external web knowledge."""

    def __init__(self, timeout: float = 8.0) -> None:
        self.timeout = timeout
        self.enabled = os.getenv("ENABLE_INTERNET_SEARCH", "true").strip().lower() not in {
            "0",
            "false",
            "no",
        }
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": os.getenv(
                    "SMARTCITY_WEB_USER_AGENT",
                    "SmartCityAlmatyAI/1.0 (+http://localhost)",
                )
            }
        )

    def _get_json(self, url: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        try:
            resp = self.session.get(url, params=params, timeout=self.timeout)
            if resp.status_code != 200:
                return None
            return resp.json()
        except Exception as exc:  # pragma: no cover
            logger.debug(f"Web JSON request failed: {exc}")
            return None

    def search_wikipedia(self, query: str, max_results: int = 2) -> List[SearchEvidence]:
        if not query.strip():
            return []

        search_data = self._get_json(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query,
                "srlimit": max_results,
                "format": "json",
                "utf8": 1,
            },
        )
        if not search_data:
            return []

        hits = search_data.get("query", {}).get("search", [])
        evidences: List[SearchEvidence] = []
        for hit in hits:
            title = hit.get("title", "").strip()
            if not title:
                continue

            summary = self._get_json(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(title)}"
            )
            if not summary:
                continue
            snippet = _clean_text(summary.get("extract", ""))
            if not snippet or not _is_english_text(snippet):
                continue
            evidences.append(
                SearchEvidence(
                    source=f"Wikipedia: {title}",
                    snippet=snippet,
                )
            )
        return evidences

    def search_web(self, query: str, max_results: int = 2) -> List[SearchEvidence]:
        if not query.strip():
            return []

        # DuckDuckGo Instant Answer API (no key required)
        data = self._get_json(
            "https://api.duckduckgo.com/",
            params={
                "q": query,
                "format": "json",
                "no_html": 1,
                "skip_disambig": 1,
            },
        )
        if not data:
            return []

        evidences: List[SearchEvidence] = []

        abstract = _clean_text(data.get("AbstractText", ""))
        abstract_url = data.get("AbstractURL", "")
        if abstract and _is_english_text(abstract):
            src = abstract_url or data.get("Heading", "DuckDuckGo")
            evidences.append(SearchEvidence(source=src, snippet=abstract))

        if len(evidences) < max_results:
            for item in data.get("RelatedTopics", []):
                if isinstance(item, dict) and "Text" in item:
                    snippet = _clean_text(item.get("Text", ""))
                    first_url = item.get("FirstURL", "")
                    if snippet and _is_english_text(snippet):
                        evidences.append(SearchEvidence(source=first_url or "DuckDuckGo", snippet=snippet))
                        if len(evidences) >= max_results:
                            break
                elif isinstance(item, dict) and "Topics" in item:
                    for sub in item.get("Topics", []):
                        snippet = _clean_text(sub.get("Text", ""))
                        first_url = sub.get("FirstURL", "")
                        if snippet and _is_english_text(snippet):
                            evidences.append(SearchEvidence(source=first_url or "DuckDuckGo", snippet=snippet))
                            if len(evidences) >= max_results:
                                break
                if len(evidences) >= max_results:
                    break

        return evidences[:max_results]

    def search(self, query: str, max_results: int = 3) -> Dict[str, Any]:
        """
        Returns:
        {
            "answer": "...",
            "sources": ["...", "..."],
            "confidence": 0.0..1.0
        }
        """
        if not self.enabled:
            return {"answer": "", "sources": [], "confidence": 0.0}

        if not query.strip():
            return {"answer": "", "sources": [], "confidence": 0.0}

        evidences = self.search_wikipedia(query, max_results=max_results)
        if len(evidences) < max_results:
            evidences.extend(self.search_web(query, max_results=max_results - len(evidences)))

        # Deduplicate
        uniq: List[SearchEvidence] = []
        seen = set()
        for ev in evidences:
            key = (ev.source, ev.snippet)
            if key in seen:
                continue
            seen.add(key)
            uniq.append(ev)

        query_terms = _query_terms(query)
        relevant = [ev for ev in uniq if _is_relevant(query_terms, ev.snippet)]
        if relevant:
            uniq = relevant

        if not uniq:
            return {"answer": "", "sources": [], "confidence": 0.0}

        ranked = sorted(
            uniq,
            key=lambda ev: _relevance_score(query_terms, ev.snippet),
            reverse=True,
        )
        top = ranked[:max_results]
        lines = [f"{idx + 1}. {ev.snippet}" for idx, ev in enumerate(top)]
        answer = "I found this from external sources:\n" + "\n".join(lines)
        sources = [ev.source for ev in top if ev.source]
        avg_relevance = sum(_relevance_score(query_terms, ev.snippet) for ev in top) / max(1, len(top))
        confidence = min(0.9, 0.35 + 0.45 * avg_relevance + 0.05 * len(top))
        confidence = max(0.35, confidence)

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
        }

    def fetch_page_text(self, url: str, max_chars: int = 8000) -> Optional[Dict[str, str]]:
        try:
            resp = self.session.get(url, timeout=self.timeout)
            if resp.status_code != 200:
                return None

            content_type = (resp.headers.get("Content-Type") or "").lower()
            if "html" not in content_type:
                return None

            html = resp.text
            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
            title = _clean_text(title_match.group(1) if title_match else "")

            parser = _HTMLTextExtractor()
            parser.feed(html)
            text = _clean_text(parser.get_text())
            if not text:
                return None

            text = text[:max_chars]
            return {
                "url": resp.url,
                "title": title or resp.url,
                "content": text,
            }
        except Exception as exc:  # pragma: no cover
            logger.debug(f"Page fetch failed for {url}: {exc}")
            return None

    def crawl_site(
        self,
        start_url: str,
        max_pages: int = 20,
        max_chars_per_page: int = 4000,
    ) -> List[Dict[str, str]]:
        """
        BFS crawl for internal links on same domain.
        This is intended for dataset ingestion, not heavy crawling.
        """
        parsed_start = urlparse(start_url)
        if not parsed_start.scheme or not parsed_start.netloc:
            return []

        domain = parsed_start.netloc.lower()
        queue: deque[str] = deque([start_url])
        visited = set()
        docs: List[Dict[str, str]] = []

        while queue and len(docs) < max_pages:
            current = queue.popleft()
            current, _ = urldefrag(current)
            if current in visited:
                continue
            visited.add(current)

            page = self.fetch_page_text(current, max_chars=max_chars_per_page)
            if not page:
                continue
            docs.append(page)

            try:
                resp = self.session.get(current, timeout=self.timeout)
                if resp.status_code != 200:
                    continue
                html = resp.text
                for href in re.findall(r'href=["\']([^"\']+)["\']', html, flags=re.IGNORECASE):
                    href = href.strip()
                    if not href or href.startswith(("mailto:", "javascript:", "#")):
                        continue
                    abs_url = urljoin(current, href)
                    abs_url, _ = urldefrag(abs_url)
                    parsed = urlparse(abs_url)
                    if parsed.netloc.lower() != domain:
                        continue
                    if abs_url not in visited and abs_url not in queue:
                        queue.append(abs_url)
            except Exception:
                # Crawling should not break the app
                continue

        return docs


_internet_engine: Optional[InternetKnowledgeEngine] = None


def get_internet_engine() -> InternetKnowledgeEngine:
    global _internet_engine
    if _internet_engine is None:
        _internet_engine = InternetKnowledgeEngine()
    return _internet_engine
