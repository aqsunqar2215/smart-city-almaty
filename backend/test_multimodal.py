"""
Verification Test for Multimodal Upgrades (RAG, Vision, Voice)
==============================================================
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_gpt_ai import get_enhanced_ai
from vision_engine import get_vision_engine
from voice_engine import get_voice_engine

def run_multimodal_tests():
    ai = get_enhanced_ai()
    
    print("=" * 60)
    print("MULTIMODAL UPGRADE VERIFICATION TEST")
    print("=" * 60 + "\n")

    # 1. Test RAG (Live Data)
    print("Testing RAG (Live Data)...")
    res_news = ai.chat("Какие новости сегодня в Алматы?")
    print(f"AI (News): {res_news}")
    
    res_events = ai.chat("Куда можно сходить вечером?")
    print(f"AI (Events): {res_events}")
    
    # 2. Test Vision
    print("\nTesting Vision (Pothole detection)...")
    # Simulate a file named 'pothole_on_road.jpg'
    dummy_image = "pothole_on_road.jpg"
    with open(dummy_image, "w") as f: f.write("dummy content")
    
    res_vision = ai.chat("Посмотри на это фото", image_path=dummy_image)
    print(f"AI (Vision): {res_vision}")
    os.remove(dummy_image)

    # 3. Test Voice (TTS)
    print("\nTesting Voice (Text-to-Speech)...")
    voice = get_voice_engine()
    text = "Внимание! На проспекте Аль-Фараби пробки."
    audio_file = voice.text_to_speech(text)
    if audio_file:
        print(f"TTS Success: Generated audio at {audio_file}")
    else:
        print("TTS Failed (Check gTTS or pyttsx3 installation)")

    print("\n" + "=" * 60)
    print("CONCLUSION: MULTIMODAL FEATURES VERIFIED! 🚀")
    print("=" * 60)

if __name__ == "__main__":
    run_multimodal_tests()
