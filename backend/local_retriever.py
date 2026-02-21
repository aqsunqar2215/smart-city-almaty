"""
Local retrieval pipeline:
- BM25 top-k
- Fuzzy top-k
- Context-aware rerank
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List

from rapidfuzz import fuzz
from rank_bm25 import BM25Okapi

from almaty_dataset import ALMATY_DATASET
from conversation_dataset import CONVERSATION_DATASET
from external_data_loader import load_external_datasets
from website_knowledge_dataset import WEBSITE_KNOWLEDGE_DATASET

try:
    from database import AIKnowledge, SessionLocal

    HAS_DB = True
except Exception:
    HAS_DB = False


def _tok(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z0-9]{2,}", (text or "").lower())


@dataclass
class RetrievalCandidate:
    text: str
    source: str
    category: str
    score: float


@dataclass
class _Doc:
    text: str
    source: str
    category: str
    reliability_weight: float


class LocalRetriever:
    def __init__(self) -> None:
        self.docs: List[_Doc] = []
        self._bm25: BM25Okapi | None = None
        self._tokenized_docs: List[List[str]] = []
        self._build_index()

    def _append_doc(self, text: str, source: str, category: str, weight: float = 1.0) -> None:
        text = (text or "").strip()
        if not text:
            return
        self.docs.append(
            _Doc(
                text=text[:1200],
                source=source,
                category=(category or "GENERAL").upper(),
                reliability_weight=weight,
            )
        )

    def _load_from_db(self) -> None:
        if not HAS_DB:
            return
        try:
            session = SessionLocal()
            rows = session.query(AIKnowledge).all()
            for row in rows:
                self._append_doc(row.response, "db_ai_knowledge", row.category, 1.1)
            session.close()
        except Exception:
            pass

    def _load_from_datasets(self) -> None:
        datasets = [
            ("almaty_dataset", ALMATY_DATASET, 1.0),
            ("conversation_dataset", CONVERSATION_DATASET, 0.9),
            ("website_knowledge_dataset", WEBSITE_KNOWLEDGE_DATASET, 1.0),
            ("external_dataset", load_external_datasets(limit_per_file=1500), 0.85),
        ]
        for source, dataset, weight in datasets:
            for item in dataset:
                self._append_doc(item.get("response", ""), source, item.get("category", "GENERAL"), weight)

    def _build_index(self) -> None:
        self._load_from_db()
        self._load_from_datasets()
        # Deduplicate by text.
        seen = set()
        dedup_docs: List[_Doc] = []
        for d in self.docs:
            key = d.text.lower()
            if key in seen:
                continue
            seen.add(key)
            dedup_docs.append(d)
        self.docs = dedup_docs
        self._tokenized_docs = [_tok(d.text) for d in self.docs]
        self._bm25 = BM25Okapi(self._tokenized_docs) if self._tokenized_docs else None

    def _context_boost(self, category: str, context_topic: str) -> float:
        if not context_topic:
            return 0.0
        cat = category.upper()
        topic = context_topic.lower()
        if topic == "transport" and cat == "TRANSPORT":
            return 0.20
        if topic == "weather" and cat in {"ECOLOGY", "WEATHER"}:
            return 0.20
        if topic == "city" and cat in {"CITY_INFO", "SIGHTS", "CULTURE", "HISTORY"}:
            return 0.15
        if topic == "emergency" and cat == "EMERGENCY":
            return 0.20
        return 0.0

    def retrieve(self, query: str, context_topic: str = "", top_k: int = 3) -> List[RetrievalCandidate]:
        if not self.docs or not self._bm25:
            return []
        q_tokens = _tok(query)
        if not q_tokens:
            return []

        bm25_scores = self._bm25.get_scores(q_tokens)
        bm25_idx = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:20]

        fuzzy_pairs = []
        for idx, d in enumerate(self.docs):
            fuzzy_score = fuzz.token_set_ratio(query, d.text) / 100.0
            if fuzzy_score > 0.15:
                fuzzy_pairs.append((idx, fuzzy_score))
        fuzzy_pairs.sort(key=lambda x: x[1], reverse=True)
        fuzzy_idx = [idx for idx, _ in fuzzy_pairs[:10]]

        candidate_idx = list(dict.fromkeys(bm25_idx + fuzzy_idx))
        if not candidate_idx:
            return []

        bm25_max = max((bm25_scores[i] for i in candidate_idx), default=1.0) or 1.0
        merged: List[RetrievalCandidate] = []
        for idx in candidate_idx:
            doc = self.docs[idx]
            bm25_norm = float(bm25_scores[idx] / bm25_max)
            fuzzy_norm = float(fuzz.token_set_ratio(query, doc.text) / 100.0)
            ctx = self._context_boost(doc.category, context_topic)
            final_score = (0.55 * bm25_norm) + (0.25 * fuzzy_norm) + (0.20 * ctx)
            final_score *= doc.reliability_weight
            merged.append(
                RetrievalCandidate(
                    text=doc.text,
                    source=doc.source,
                    category=doc.category,
                    score=round(final_score, 5),
                )
            )

        merged.sort(key=lambda c: c.score, reverse=True)
        return merged[:top_k]


@lru_cache(maxsize=1)
def get_local_retriever() -> LocalRetriever:
    return LocalRetriever()

