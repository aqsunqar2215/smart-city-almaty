import json
import random
import re
import sys
from pathlib import Path
from typing import Dict, List, Tuple

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from almaty_dataset import ALMATY_DATASET
from conversation_dataset import CONVERSATION_DATASET
from external_data_loader import load_external_datasets
from website_knowledge_dataset import WEBSITE_KNOWLEDGE_DATASET


def normalize_intent(category: str) -> str:
    category = (category or "").strip().upper()
    mapping = {
        "TRANSPORT": "transport",
        "ECOLOGY": "weather_eco",
        "WEATHER": "weather_eco",
        "EMERGENCY": "emergency",
        "CITY_INFO": "city",
        "SIGHTS": "city",
        "HISTORY": "city",
        "GEOGRAPHY": "city",
        "CULTURE": "city",
        "ECONOMY": "city",
        "CUISINE": "city",
        "SCIENCE": "city",
        "CHAT": "chat",
        "GREETING": "greeting",
        "FAREWELL": "farewell",
        "THANKS": "thanks",
        "HELP": "help",
        "PHILOSOPHY": "philosophy",
    }
    return mapping.get(category, "unknown")


def is_en(item: Dict[str, str]) -> bool:
    lang = (item.get("language") or "").lower()
    if lang == "en":
        return True
    text = f"{item.get('pattern', '')} {item.get('response', '')}"
    return re.search(r"[А-Яа-яЁё]", text) is None


def collect_rows() -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    datasets = [
        ALMATY_DATASET,
        CONVERSATION_DATASET,
        WEBSITE_KNOWLEDGE_DATASET,
        load_external_datasets(limit_per_file=1500),
    ]
    for ds in datasets:
        for item in ds:
            if not is_en(item):
                continue
            pattern = (item.get("pattern") or "").strip()
            response = (item.get("response") or "").strip()
            if not pattern or not response:
                continue
            rows.append(
                {
                    "pattern": pattern,
                    "response": response,
                    "category": item.get("category", ""),
                }
            )
    return rows


def unique_rows(rows: List[Dict[str, str]], key_fields: Tuple[str, ...]) -> List[Dict[str, str]]:
    seen = set()
    out: List[Dict[str, str]] = []
    for row in rows:
        key = tuple((row.get(k, "") or "").strip().lower() for k in key_fields)
        if key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def top_keywords(text: str) -> List[str]:
    stop = {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "your",
        "you",
        "are",
        "can",
        "use",
        "what",
        "when",
        "where",
        "which",
        "will",
        "have",
        "has",
        "about",
        "into",
        "city",
        "almaty",
        "please",
        "more",
        "than",
        "over",
        "under",
        "during",
    }
    words = re.findall(r"[a-z0-9]{3,}", text.lower())
    ordered: List[str] = []
    seen = set()
    for w in words:
        if w in stop:
            continue
        if w in seen:
            continue
        seen.add(w)
        ordered.append(w)
        if len(ordered) >= 3:
            break
    return ordered


def write_jsonl(path: Path, rows: List[Dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def build() -> None:
    random.seed(42)
    rows = collect_rows()
    random.shuffle(rows)

    intent_rows: List[Dict[str, object]] = []
    for row in rows:
        intent = normalize_intent(row["category"])
        if intent == "unknown":
            continue
        query = row["pattern"]
        if len(query) < 4:
            continue
        intent_rows.append({"query": query, "expected_intent": intent})
    intent_rows = unique_rows(intent_rows, ("query", "expected_intent"))
    intent_rows = intent_rows[:320]

    follow_ups = ["what about it?", "and it?", "and what about that?", "what about this?"]
    context_rows: List[Dict[str, object]] = []
    for i, row in enumerate(intent_rows):
        if row["expected_intent"] not in {"transport", "weather_eco", "city", "emergency"}:
            continue
        turns = [row["query"], random.choice(follow_ups), random.choice(follow_ups)]
        context_rows.append(
            {
                "session_id": f"ctx-{i}",
                "turns": turns,
                "expected_intent": row["expected_intent"],
            }
        )
        if len(context_rows) >= 130:
            break

    intent_keywords = {
        "emergency": ["101", "112"],
        "transport": ["transport", "bus"],
        "weather_eco": ["aqi", "air"],
        "city": ["city", "almaty"],
        "chat": ["almaty", "city"],
    }
    factual_rows: List[Dict[str, object]] = []
    for row in rows:
        intent = normalize_intent(row["category"])
        if intent not in intent_keywords:
            continue
        kws = intent_keywords[intent]
        if not kws:
            continue
        factual_rows.append(
            {
                "query": row["pattern"],
                "expected_intent": intent,
                "expected_keywords": kws[:2],
            }
        )
    factual_rows = unique_rows(factual_rows, ("query",))
    factual_rows = factual_rows[:170]

    base = Path(__file__).resolve().parent
    write_jsonl(base / "intent_eval_en.jsonl", intent_rows)
    write_jsonl(base / "dialog_context_eval_en.jsonl", context_rows)
    write_jsonl(base / "factual_eval_en.jsonl", factual_rows)
    print(
        f"Generated eval sets: intent={len(intent_rows)}, context={len(context_rows)}, factual={len(factual_rows)}"
    )


if __name__ == "__main__":
    build()
