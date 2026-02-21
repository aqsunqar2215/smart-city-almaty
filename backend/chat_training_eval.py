"""
Quick conversation evaluation for the Smart City AI model.
Runs a multi-turn english dialogue and prints source/confidence metadata.
"""

from enhanced_gpt_ai import get_enhanced_ai


def _safe_print(text: str) -> None:
    # Windows console can fail on some emoji when cp1251 is active.
    print(text.encode("cp1251", errors="replace").decode("cp1251", errors="replace"))


TEST_DIALOGUE = [
    "Hello! Can you help me learn better every day?",
    "I feel stressed before interviews. Give me a practical routine.",
    "What is the AQI and why does it matter for health?",
    "How does Almaty Metro schedule work?",
    "Explain quantum entanglement in simple terms.",
    "I don't know what to do with my time this evening in Almaty.",
    "Thanks, now suggest a 2-hour study plan.",
]


def run_eval() -> None:
    ai = get_enhanced_ai()
    ai.config.enable_web_fallback = True

    session_id = "train_eval_session"
    print("=" * 72)
    _safe_print("SMART CITY AI - MULTI TURN EVALUATION")
    print("=" * 72)
    for i, user_msg in enumerate(TEST_DIALOGUE, 1):
        response_text = ai.chat(user_msg, session_id=session_id)
        full = ai.get_full_response(user_msg, session_id=session_id)

        _safe_print(f"\n[{i}] USER: {user_msg}")
        _safe_print(f"[{i}] AI  : {response_text}")
        _safe_print(
            f"[{i}] META: source={full.source}, confidence={full.confidence:.2f}, "
            f"sources={len(full.sources)}"
        )
        if full.sources:
            _safe_print(f"[{i}] WEB : {full.sources[:3]}")

    print("\nDone.")


if __name__ == "__main__":
    run_eval()
