import argparse
import json
import pathlib
import statistics
import sys
from dataclasses import dataclass
from typing import Dict, List
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))

from enhanced_gpt_ai import get_enhanced_ai


BASE_DIR = pathlib.Path(__file__).resolve().parent
INTENT_FILE = BASE_DIR / "intent_eval_en.jsonl"
CONTEXT_FILE = BASE_DIR / "dialog_context_eval_en.jsonl"
FACTUAL_FILE = BASE_DIR / "factual_eval_en.jsonl"

TARGETS = {
    "context_pass_rate": 0.85,
    "factual_pass_rate": 0.80,
    "p95_latency_ms": 2000.0,
    "fallback_rate": 0.15,
    "llm_calls": 0,
}


@dataclass
class EvalStats:
    total: int = 0
    passed: int = 0

    @property
    def rate(self) -> float:
        return (self.passed / self.total) if self.total else 0.0


def load_jsonl(path: pathlib.Path) -> List[Dict]:
    rows: List[Dict] = []
    with path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def p95(values: List[float]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = int(0.95 * (len(ordered) - 1))
    return float(ordered[idx])


def evaluate(strict: bool = True) -> Dict[str, float]:
    ai = get_enhanced_ai()
    intent_rows = load_jsonl(INTENT_FILE)
    context_rows = load_jsonl(CONTEXT_FILE)
    factual_rows = load_jsonl(FACTUAL_FILE)

    latencies: List[float] = []
    fallback_count = 0
    total_responses = 0
    intent_stats = EvalStats()
    context_stats = EvalStats()
    factual_stats = EvalStats()
    llm_call_counter = {"count": 0}

    def forbidden_llm(*args, **kwargs):
        llm_call_counter["count"] += 1
        raise RuntimeError("LLM runtime is forbidden in V4.1")

    with patch("llm_engine.get_llm", side_effect=forbidden_llm):
        for i, row in enumerate(intent_rows):
            resp = ai.get_full_response(row["query"], session_id=f"intent-{i}")
            total_responses += 1
            latencies.append(float(resp.processing_time_ms))
            if resp.source == "controlled_fallback":
                fallback_count += 1
            intent_stats.total += 1
            if resp.intent == row["expected_intent"]:
                intent_stats.passed += 1

        for row in context_rows:
            session_id = row.get("session_id") or f"ctx-{context_stats.total}"
            final_resp = None
            for turn in row.get("turns", []):
                final_resp = ai.get_full_response(turn, session_id=session_id)
                total_responses += 1
                latencies.append(float(final_resp.processing_time_ms))
                if final_resp.source == "controlled_fallback":
                    fallback_count += 1
            if final_resp is None:
                continue
            context_stats.total += 1
            if final_resp.intent == row.get("expected_intent"):
                context_stats.passed += 1

        for i, row in enumerate(factual_rows):
            resp = ai.get_full_response(row["query"], session_id=f"factual-{i}")
            total_responses += 1
            latencies.append(float(resp.processing_time_ms))
            if resp.source == "controlled_fallback":
                fallback_count += 1
            factual_stats.total += 1
            text = (resp.text or "").lower()
            expected_keywords = [k.lower() for k in row.get("expected_keywords", [])]
            expected_intent = row.get("expected_intent", "")
            keyword_pass = any(k in text for k in expected_keywords) if expected_keywords else False
            intent_pass = bool(expected_intent) and resp.intent == expected_intent
            if keyword_pass or intent_pass:
                factual_stats.passed += 1

    results = {
        "intent_acc": intent_stats.rate,
        "context_pass_rate": context_stats.rate,
        "factual_pass_rate": factual_stats.rate,
        "fallback_rate": (fallback_count / total_responses) if total_responses else 0.0,
        "p95_latency_ms": p95(latencies),
        "llm_calls": float(llm_call_counter["count"]),
        "latency_mean_ms": float(statistics.mean(latencies)) if latencies else 0.0,
        "samples_total": float(total_responses),
    }

    print("=== V4.1 Eval Results ===")
    for k, v in results.items():
        if isinstance(v, float):
            print(f"{k}: {v:.4f}")
        else:
            print(f"{k}: {v}")

    violations = []
    if results["context_pass_rate"] < TARGETS["context_pass_rate"]:
        violations.append("context_pass_rate")
    if results["factual_pass_rate"] < TARGETS["factual_pass_rate"]:
        violations.append("factual_pass_rate")
    if results["p95_latency_ms"] > TARGETS["p95_latency_ms"]:
        violations.append("p95_latency_ms")
    if results["fallback_rate"] > TARGETS["fallback_rate"]:
        violations.append("fallback_rate")
    if int(results["llm_calls"]) != TARGETS["llm_calls"]:
        violations.append("llm_calls")

    if violations:
        print("Eval gate FAILED:", ", ".join(violations))
        if strict:
            raise SystemExit(1)
    else:
        print("Eval gate PASSED")

    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-strict", action="store_true", help="Do not fail with non-zero exit code on KPI misses")
    args = parser.parse_args()
    evaluate(strict=not args.no_strict)


if __name__ == "__main__":
    main()
