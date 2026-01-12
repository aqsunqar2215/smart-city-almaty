"""
Long-term Memory Module
=======================
Handles persistent user preferences, interests, and context across sessions.
Saves data to a local JSON file for continuity.
"""

import json
import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class LongTermMemory:
    def __init__(self, storage_path: str = "user_memory.json"):
        self.storage_path = storage_path
        self.memory: Dict[str, Dict[str, Any]] = self._load()

    def _load(self) -> Dict:
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading memory: {e}")
        return {}

    def _save(self):
        try:
            with open(self.storage_path, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error saving memory: {e}")

    def update_user_info(self, user_id: str, key: str, value: Any):
        if user_id not in self.memory:
            self.memory[user_id] = {"preferences": {}, "facts": [], "last_seen": ""}
        
        self.memory[user_id]["preferences"][key] = value
        self.memory[user_id]["last_seen"] = datetime.now().isoformat()
        self._save()

    def add_fact(self, user_id: str, fact: str):
        """Add a fact learned about the user (e.g., 'Likes hiking')"""
        if user_id not in self.memory:
            self.memory[user_id] = {"preferences": {}, "facts": [], "last_seen": ""}
        
        if fact not in self.memory[user_id]["facts"]:
            self.memory[user_id]["facts"].append(fact)
            self._save()

    def get_user_context(self, user_id: str) -> str:
        """Returns a string describing what we know about the user"""
        if user_id not in self.memory:
            return ""
        
        data = self.memory[user_id]
        context_parts = []
        
        if data.get("preferences"):
            prefs = ", ".join([f"{k}: {v}" for k, v in data["preferences"].items()])
            context_parts.append(f"Предпочтения: {prefs}")
            
        if data.get("facts"):
            facts = ". ".join(data["facts"])
            context_parts.append(f"Известные факты: {facts}")
            
        return " | ".join(context_parts)

    def extract_preferences(self, user_id: str, text: str):
        """Simple pattern matching to learn about the user from text"""
        text_lower = text.lower()
        
        # Name detection
        name_match = None
        if "меня зовут " in text_lower:
            name_match = text_lower.split("меня зовут ")[1].split()[0]
        elif "мое имя " in text_lower:
            name_match = text_lower.split("мое имя ")[1].split()[0]
            
        if name_match:
            name = name_match.replace(",", "").replace(".", "").strip().capitalize()
            self.update_user_info(user_id, "name", name)
            
        # Interest detection
        interests = {
            "экологи": "экология",
            "гор": "горы/хайкинг",
            "велосипед": "велосипеды",
            "авто": "автомобили",
            "метро": "общественный транспорт"
        }
        
        for kw, interest in interests.items():
            if kw in text_lower:
                self.add_fact(user_id, f"Интересуется темой: {interest}")

_memory_instance = None

def get_long_term_memory():
    global _memory_instance
    if _memory_instance is None:
        _memory_instance = LongTermMemory()
    return _memory_instance
