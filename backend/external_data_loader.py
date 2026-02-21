import json
import os
import random
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

# Mapping from external JSON categories to AI Engine tags
CATEGORY_MAP = {
    "food": "CULTURE",
    "housing": "CITY_INFO",
    "ecology": "ECOLOGY",
    "traffic": "TRANSPORT",
    "emergency": "EMERGENCY",
    "tourism": "SIGHTS",
    "finance": "ECONOMY",
    "education": "SCIENCE",
}


def _is_english_text(text: str) -> bool:
    if not text:
        return False
    return re.search(r"[А-Яа-яЁё]", text) is None


def _resolve_path(base_dir: Path, raw_path: str) -> Path:
    p = Path(raw_path)
    if p.is_absolute():
        return p
    return base_dir / p


def _safe_read_json(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        return []
    except Exception:
        return []


def _build_record(category: str, pattern: str, response: str) -> Optional[Dict[str, str]]:
    pattern = (pattern or "").strip()
    response = (response or "").strip()
    if not pattern or not response:
        return None
    if not (_is_english_text(pattern) and _is_english_text(response)):
        return None
    return {
        "category": category,
        "language": "en",
        "pattern": pattern,
        "response": response,
    }


def _load_site_knowledge() -> List[Dict[str, str]]:
    site_urls_raw = os.getenv("EXTERNAL_SITE_URLS", "").strip()
    if not site_urls_raw:
        return []

    try:
        from web_search_engine import get_internet_engine
    except Exception:
        return []

    max_pages = int(os.getenv("EXTERNAL_SITE_MAX_PAGES", "30"))
    max_records = int(os.getenv("EXTERNAL_SITE_MAX_RECORDS", "3000"))
    max_pages = max(1, max_pages)
    max_records = max(1, max_records)

    engine = get_internet_engine()
    urls = [u.strip() for u in site_urls_raw.split(",") if u.strip()]
    records: List[Dict[str, str]] = []

    for site_url in urls:
        docs = engine.crawl_site(site_url, max_pages=max_pages, max_chars_per_page=3000)
        for doc in docs:
            title = doc.get("title", "").strip() or doc.get("url", "")
            content = doc.get("content", "").strip()
            if not content:
                continue
            record = _build_record(
                category="CITY_INFO",
                pattern=f"{title} {doc.get('url', '')}".strip(),
                response=content[:1200],
            )
            if record:
                records.append(record)
            if len(records) >= max_records:
                return records

    return records


def load_external_datasets(limit_per_file: int = 3000) -> List[Dict[str, str]]:
    """
    Load external english datasets for training:
    - Smart city json dataset
    - General chat json dataset
    - Optional full website crawl via EXTERNAL_SITE_URLS
    """
    script_dir = Path(__file__).resolve().parent
    base_dir = Path(os.getenv("EXTERNAL_DATA_DIR", str(script_dir / "datasets")))

    smart_file = os.getenv("EXTERNAL_SMART_CITY_FILE", "almaty_smart_city_english.json")
    chat_file = os.getenv("EXTERNAL_CHAT_FILE", "general_chat_english_10k.json")

    smart_city_path = _resolve_path(base_dir, smart_file)
    chat_10k_path = _resolve_path(base_dir, chat_file)

    external_patterns: List[Dict[str, str]] = []

    # 1. Smart City dataset
    smart_data = _safe_read_json(smart_city_path)
    random.shuffle(smart_data)
    for item in smart_data[:limit_per_file]:
        ext_cat = str(item.get("category", "")).strip().lower()
        target_cat = CATEGORY_MAP.get(ext_cat, "CITY_INFO")
        record = _build_record(
            category=target_cat,
            pattern=str(item.get("instruction", "")),
            response=str(item.get("output", "")),
        )
        if record:
            external_patterns.append(record)

    # 2. General chat dataset
    chat_data = _safe_read_json(chat_10k_path)
    random.shuffle(chat_data)
    for item in chat_data[:limit_per_file]:
        record = _build_record(
            category="CHAT",
            pattern=str(item.get("instruction", "")),
            response=str(item.get("output", "")),
        )
        if record:
            external_patterns.append(record)

    # 3. Optional full-site knowledge ingestion
    site_records = _load_site_knowledge()
    external_patterns.extend(site_records)

    random.shuffle(external_patterns)
    return external_patterns


if __name__ == "__main__":
    patterns = load_external_datasets()
    print(f"Loaded {len(patterns)} external patterns.")
    if patterns:
        print(f"First pattern: {patterns[0]}")
