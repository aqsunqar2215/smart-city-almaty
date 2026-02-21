"""
Dialogue State Layer for context retention across turns.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List

from intent_router_v3 import IntentPrediction


FOLLOW_UP_TOKENS = {
    "it",
    "that",
    "this",
    "there",
    "and",
    "also",
    "then",
    "what",
    "about",
    "again",
    "more",
    "same",
    "continue",
    "details",
    "else",
    "another",
    "too",
    "them",
    "those",
    "these",
    "why",
    "how",
    "when",
    "where",
}


@dataclass
class SessionState:
    last_intent: str = "unknown"
    last_entities: Dict[str, str] = field(default_factory=dict)
    last_topic: str = "general"
    open_slot: str = ""
    last_user_goal: str = ""
    turn_summary: str = ""
    turn_count: int = 0
    recent_user_turns: List[str] = field(default_factory=list)
    topic_hints: List[str] = field(default_factory=list)
    updated_at: datetime = field(default_factory=datetime.utcnow)


class DialogueStateManager:
    def __init__(self, ttl_minutes: int = 30) -> None:
        self._ttl = timedelta(minutes=ttl_minutes)
        self._sessions: Dict[str, SessionState] = {}

    def _is_expired(self, state: SessionState) -> bool:
        return datetime.utcnow() - state.updated_at > self._ttl

    def _touch(self, state: SessionState) -> None:
        state.updated_at = datetime.utcnow()

    def get(self, session_id: str) -> SessionState:
        state = self._sessions.get(session_id)
        if state is None or self._is_expired(state):
            state = SessionState()
            self._sessions[session_id] = state
        self._touch(state)
        return state

    def observe_user_turn(self, session_id: str, message: str) -> SessionState:
        state = self.get(session_id)
        clean_message = (message or "").strip()
        state.turn_count += 1
        state.last_user_goal = clean_message[:256]
        if clean_message:
            state.recent_user_turns.append(clean_message[:256])
            state.recent_user_turns = state.recent_user_turns[-8:]
        if "?" in clean_message:
            state.open_slot = clean_message[:120]
        state.topic_hints = self._extract_topic_hints(clean_message)
        self._touch(state)
        return state

    def observe_assistant_turn(self, session_id: str, response: str) -> None:
        state = self.get(session_id)
        short = (response or "").strip().replace("\n", " ")
        state.turn_summary = short[:256]
        if state.open_slot and short:
            state.open_slot = ""
        self._touch(state)

    def update_intent(self, session_id: str, intent: str) -> None:
        state = self.get(session_id)
        state.last_intent = intent or "unknown"
        topic_map = {
            "transport": "transport",
            "weather_eco": "weather",
            "city": "city",
            "emergency": "emergency",
            "chat": "chat",
        }
        state.last_topic = topic_map.get(state.last_intent, state.last_topic)
        self._touch(state)

    def _extract_topic_hints(self, text: str) -> List[str]:
        t = (text or "").lower()
        if not t:
            return []
        hints: List[str] = []
        keyword_map = {
            "transport": ["bus", "metro", "road", "traffic", "route", "airport", "taxi"],
            "weather": ["weather", "aqi", "air", "smog", "pollution", "temperature", "rain"],
            "city": ["district", "park", "museum", "almaty", "history", "landmark", "service"],
            "emergency": ["emergency", "ambulance", "police", "fire", "accident", "112", "101", "102", "103"],
        }
        for topic, words in keyword_map.items():
            if any(w in t for w in words):
                hints.append(topic)
        return hints

    def is_follow_up(self, text: str) -> bool:
        words = [w.strip(".,!?;:").lower() for w in (text or "").split()]
        if not words:
            return False
        short = len(words) <= 8
        starts_like_follow_up = " ".join(words[:3]) in {
            "what about it",
            "and what about",
            "how about it",
            "and how about",
        }
        has_token = any(w in FOLLOW_UP_TOKENS for w in words)
        has_pronoun = any(w in {"it", "that", "this", "there"} for w in words)
        return starts_like_follow_up or (short and (has_token or has_pronoun))

    def build_contextual_query(self, session_id: str, text: str, current_intent: str) -> str:
        state = self.get(session_id)
        message = (text or "").strip()
        if not message:
            return message
        if state.last_intent == "unknown":
            return message
        if not self.is_follow_up(message):
            return message

        context_parts: List[str] = []
        if state.last_intent:
            context_parts.append(f"previous intent {state.last_intent}")
        if state.last_topic and state.last_topic != "general":
            context_parts.append(f"topic {state.last_topic}")
        if state.last_user_goal and state.last_user_goal.lower() != message.lower():
            context_parts.append(f"previous user request {state.last_user_goal}")
        if state.turn_summary:
            context_parts.append(f"assistant said {state.turn_summary[:100]}")
        if state.topic_hints:
            context_parts.append(f"hints {' '.join(state.topic_hints[:2])}")

        if not context_parts:
            return message
        return f"{message}. Follow-up context: " + "; ".join(context_parts) + "."

    def clarification_hint(self, session_id: str) -> str:
        state = self.get(session_id)
        if state.last_intent in {"transport", "weather_eco", "city", "emergency"}:
            return f"If you want to continue the previous topic ({state.last_intent}), mention one detail (e.g. district, route, or timeframe)."
        return ""

    def contextualize_prediction(self, session_id: str, text: str, pred: IntentPrediction) -> IntentPrediction:
        state = self.get(session_id)
        if state.last_intent == "unknown":
            return pred

        if self.is_follow_up(text) and pred.intent != "emergency":
            should_anchor = pred.intent == "unknown" or pred.confidence < 0.72 or pred.margin < 0.20
            if not should_anchor:
                return pred
            # Prefer intent continuity for ambiguous short follow-up turns.
            boosted = min(0.92, max(pred.confidence + 0.20, 0.60))
            return IntentPrediction(
                intent=state.last_intent,
                confidence=boosted,
                margin=max(pred.margin, 0.12),
                top2=[(state.last_intent, boosted)] + pred.top2[:1],
                routing_reason="followup_context_boost",
            )
        return pred

    def as_debug(self, session_id: str) -> Dict[str, str]:
        s = self.get(session_id)
        return {
            "last_intent": s.last_intent,
            "last_topic": s.last_topic,
            "turn_count": str(s.turn_count),
            "open_slot": s.open_slot,
        }
