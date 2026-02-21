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
        state.turn_count += 1
        state.last_user_goal = (message or "").strip()[:256]
        self._touch(state)
        return state

    def observe_assistant_turn(self, session_id: str, response: str) -> None:
        state = self.get(session_id)
        state.turn_summary = (response or "").strip()[:256]
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

    def is_follow_up(self, text: str) -> bool:
        words = [w.strip(".,!?;:").lower() for w in (text or "").split()]
        if not words:
            return False
        short = len(words) <= 5
        has_token = any(w in FOLLOW_UP_TOKENS for w in words)
        has_pronoun = any(w in {"it", "that", "this", "there"} for w in words)
        return short and (has_token or has_pronoun)

    def contextualize_prediction(self, session_id: str, text: str, pred: IntentPrediction) -> IntentPrediction:
        state = self.get(session_id)
        if state.last_intent == "unknown":
            return pred

        if self.is_follow_up(text) and pred.intent != "emergency":
            # Follow-up turns should strongly prefer prior intent continuity.
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
        }
