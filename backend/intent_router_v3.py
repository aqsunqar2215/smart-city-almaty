"""
Intent Router V3 (Local-only, CPU-first)

Model:
- TfidfVectorizer
- LinearSVC
- CalibratedClassifierCV for probability-like confidence

Trains from local datasets and external local JSON datasets.
No cloud services, no LLM usage.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from collections import Counter
from typing import Dict, List, Tuple

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from almaty_dataset import ALMATY_DATASET
from conversation_dataset import CONVERSATION_DATASET
from website_knowledge_dataset import WEBSITE_KNOWLEDGE_DATASET
from external_data_loader import load_external_datasets


_OVERRIDE_RULES: List[Tuple[str, Tuple[str, ...]]] = [
    ("emergency", ("ambulance", "police", "fire", "accident", "emergency", "112", "101", "102", "103")),
    ("transport", ("metro", "bus", "route", "traffic", "road", "airport", "taxi")),
    ("weather_eco", ("weather", "forecast", "temperature", "aqi", "air quality", "pollution", "smog", "pm2.5", "pm25")),
]


def _normalize_intent(category: str) -> str:
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


def _build_training_rows() -> Tuple[List[str], List[str]]:
    rows: List[str] = []
    labels: List[str] = []

    def add_row(text: str, category: str) -> None:
        text = (text or "").strip()
        if not text:
            return
        rows.append(text)
        labels.append(_normalize_intent(category))

    base_datasets = [
        ALMATY_DATASET,
        [x for x in CONVERSATION_DATASET if x.get("language", "en") == "en"],
        WEBSITE_KNOWLEDGE_DATASET,
    ]
    for dataset in base_datasets:
        for item in dataset:
            add_row(item.get("pattern", ""), item.get("category", "unknown"))
            add_row(item.get("response", ""), item.get("category", "unknown"))

    for item in load_external_datasets(limit_per_file=3000):
        add_row(item.get("pattern", ""), item.get("category", "unknown"))
        add_row(item.get("response", ""), item.get("category", "unknown"))

    # Add explicit conversational anchors for routing stability.
    seed_examples: Dict[str, List[str]] = {
        "greeting": [
            "hello",
            "hi there",
            "good morning",
            "hey",
        ],
        "farewell": [
            "bye",
            "goodbye",
            "see you later",
        ],
        "thanks": [
            "thanks",
            "thank you",
            "appreciate it",
        ],
        "help": [
            "help",
            "what can you do",
            "i need assistance",
        ],
        "philosophy": [
            "meaning of life",
            "how to be happy",
            "life purpose",
        ],
        "emergency": [
            "i need ambulance",
            "fire emergency",
            "call police now",
        ],
        "transport": [
            "how to go by bus",
            "metro schedule",
            "traffic on roads",
        ],
        "weather_eco": [
            "what is the aqi",
            "air pollution level",
            "weather forecast",
        ],
    }
    for intent, texts in seed_examples.items():
        for text in texts:
            rows.append(text)
            labels.append(intent)

    # Remove unknown training labels because they hurt decision boundaries.
    filtered = [(r, l) for r, l in zip(rows, labels) if l != "unknown"]
    counts = Counter(label for _, label in filtered)
    filtered = [(r, l) for r, l in filtered if counts[l] >= 2]
    if not filtered:
        return [], []
    rows, labels = zip(*filtered)
    return list(rows), list(labels)


@dataclass
class IntentPrediction:
    intent: str
    confidence: float
    margin: float
    top2: List[Tuple[str, float]]
    routing_reason: str


class IntentRouterV3:
    def __init__(self) -> None:
        self._pipeline: Pipeline = Pipeline(
            steps=[
                (
                    "tfidf",
                    TfidfVectorizer(
                        lowercase=True,
                        strip_accents="unicode",
                        ngram_range=(1, 2),
                        min_df=1,
                        sublinear_tf=True,
                    ),
                ),
                (
                    "clf",
                    CalibratedClassifierCV(
                        estimator=LinearSVC(),
                        method="sigmoid",
                        cv=2,
                    ),
                ),
            ]
        )
        self._fallback_pipeline: Pipeline | None = None
        self._fitted = False
        self._classes: List[str] = []
        self._probabilistic = True

    def fit(self) -> None:
        if self._fitted:
            return
        x, y = _build_training_rows()
        if not x or not y:
            self._fitted = False
            return
        try:
            self._pipeline.fit(x, y)
            self._classes = list(self._pipeline.named_steps["clf"].classes_)
            self._probabilistic = True
        except ValueError:
            # Fallback to non-calibrated LinearSVC if calibration split fails on rare classes.
            self._fallback_pipeline = Pipeline(
                steps=[
                    (
                        "tfidf",
                        TfidfVectorizer(
                            lowercase=True,
                            strip_accents="unicode",
                            ngram_range=(1, 2),
                            min_df=1,
                            sublinear_tf=True,
                        ),
                    ),
                    ("clf", LinearSVC()),
                ]
            )
            self._fallback_pipeline.fit(x, y)
            self._classes = list(self._fallback_pipeline.named_steps["clf"].classes_)
            self._probabilistic = False
        self._fitted = True

    def predict(self, text: str) -> IntentPrediction:
        if not self._fitted:
            self.fit()
        if not self._fitted:
            return IntentPrediction(
                intent="unknown",
                confidence=0.0,
                margin=0.0,
                top2=[("unknown", 0.0)],
                routing_reason="router_unavailable",
            )

        if self._probabilistic:
            probs = self._pipeline.predict_proba([text])[0]
        else:
            assert self._fallback_pipeline is not None
            decision = self._fallback_pipeline.decision_function([text])[0]
            if isinstance(decision, np.ndarray):
                if decision.ndim == 0:
                    score = float(decision)
                    decision = np.array([-score, score], dtype=float)
                else:
                    decision = decision.astype(float)
            else:
                score = float(decision)
                decision = np.array([-score, score], dtype=float)
            # Stable softmax over decision scores for probability-like outputs.
            shifted = decision - np.max(decision)
            exp_scores = np.exp(shifted)
            probs = exp_scores / np.sum(exp_scores)
        ranked_idx = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
        top_idx = ranked_idx[0]
        top_prob = float(probs[top_idx])
        top_intent = self._classes[top_idx]
        second_prob = float(probs[ranked_idx[1]]) if len(ranked_idx) > 1 else 0.0
        margin = max(0.0, top_prob - second_prob)
        top2 = [(self._classes[i], float(probs[i])) for i in ranked_idx[:2]]
        reason = "high_confidence" if (top_prob >= 0.55 and margin >= 0.12) else "ambiguous"
        override_intent = self._lexical_override(text, top_intent, top_prob, margin)
        if override_intent:
            override_confidence = max(0.62, top_prob)
            return IntentPrediction(
                intent=override_intent,
                confidence=override_confidence,
                margin=max(0.14, margin),
                top2=[(override_intent, override_confidence)] + top2[:1],
                routing_reason="lexical_override",
            )
        return IntentPrediction(
            intent=top_intent,
            confidence=top_prob,
            margin=margin,
            top2=top2,
            routing_reason=reason,
        )

    def _lexical_override(
        self,
        text: str,
        predicted_intent: str,
        confidence: float,
        margin: float,
    ) -> str:
        normalized = (text or "").lower()
        if not normalized:
            return ""

        blocked_predicted = {"chat", "greeting", "thanks", "farewell", "help", "unknown"}
        should_consider_override = (
            predicted_intent in blocked_predicted
            or confidence < 0.64
            or margin < 0.16
        )
        if not should_consider_override:
            return ""

        for intent, terms in _OVERRIDE_RULES:
            if any(term in normalized for term in terms):
                return intent
        return ""


@lru_cache(maxsize=1)
def get_intent_router() -> IntentRouterV3:
    router = IntentRouterV3()
    router.fit()
    return router
