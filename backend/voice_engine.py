"""
Voice Engine for STT (Speech-to-Text) and TTS (Text-to-Speech)
=============================================================
Provides capabilities for voice interaction, essential for accessibility 
and hands-free usage (e.g., for drivers).
"""

import os
import hashlib
from typing import Optional

class VoiceEngine:
    def __init__(self, cache_dir: str = "voice_cache"):
        self.cache_dir = cache_dir
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
        
        # Check for available TTS engines
        try:
            import pyttsx3
            self.tts_engine = pyttsx3.init()
            # Slow down speech for better clarity
            self.tts_engine.setProperty('rate', 150) 
        except ImportError:
            self.tts_engine = None

    def text_to_speech(self, text: str, lang: str = "ru") -> Optional[str]:
        """
        Converts text to speech and returns path to the audio file.
        Uses a local cache to avoid regenerating common phrases.
        """
        file_hash = hashlib.md5(f"{text}_{lang}".encode()).hexdigest()
        file_path = os.path.join(self.cache_dir, f"{file_hash}.mp3")
        
        if os.path.exists(file_path):
            return file_path

        # If we have gTTS (better quality)
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang=lang)
            tts.save(file_path)
            return file_path
        except ImportError:
            # Fallback to pyttsx3 if possible (saves as wav usually)
            if self.tts_engine:
                wav_path = file_path.replace(".mp3", ".wav")
                self.tts_engine.save_to_file(text, wav_path)
                self.tts_engine.runAndWait()
                return wav_path
            
        return None

    def speech_to_text(self, audio_path: str) -> Optional[str]:
        """
        Converts audio file to text.
        In reality, would use OpenAI Whisper or Google Speech Recognition.
        """
        try:
            import speech_recognition as sr
            r = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                audio = r.record(source)
                return r.recognize_google(audio, language="ru-RU")
        except Exception:
            # For simulation during dev
            return "[Распознанный голос: Пользователь спрашивает о пробках на Аль-Фараби]"

_voice_engine = None

def get_voice_engine():
    global _voice_engine
    if _voice_engine is None:
        _voice_engine = VoiceEngine()
    return _voice_engine
