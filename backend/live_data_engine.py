"""
Live Data Engine for RAG (Retrieval-Augmented Generation)
=========================================================
This module manages "hot" knowledge that changes daily or hourly.
It simulates fetching data from Almaty open portals, news feeds, and social media.
"""

import json
import random
from datetime import datetime
from typing import List, Dict, Any, Optional

class LiveDataEngine:
    def __init__(self):
        # In a real scenario, this would be a Vector DB or a Redis cache
        self.hot_facts = {
            "news": [
                {"date": "2026-01-07", "text": "В Алматы открылся новый коворкинг-центр в районе КБТУ."},
                {"date": "2026-01-07", "text": "Сегодня на Медеу проходит фестиваль зимних видов спорта."},
                {"date": "2026-01-07", "text": "Движение по проспекту Аль-Фараби временно ограничено из-за ремонтных работ."}
            ],
            "weather_alerts": [
                {"level": "yellow", "text": "Усиление ветра до 15 м/с в предгорьях."}
            ],
            "events": [
                {"name": "Концерт в Филармонии", "time": "19:00", "location": "ул. Калдаякова"},
                {"name": "Выставка современного искусства", "location": "Музей Кастеева"}
            ]
        }
        self.last_sync = datetime.now()

    def sync(self):
        """Simulate syncing with external APIs"""
        self.last_sync = datetime.now()
        # Here you would call real APIs (OpenData Almaty, RSS feeds, etc.)
        return True

    def get_context(self, query: str) -> str:
        """Extract relevant live facts for the query"""
        query_lower = query.lower()
        context_parts = []
        
        # Simple keyword matching for 'live' context
        if any(w in query_lower for w in ["новост", "что нового", "случилось", "произошло"]):
            for n in self.hot_facts["news"]:
                context_parts.append(f"Новость ({n['date']}): {n['text']}")
        
        if any(w in query_lower for w in ["мероприят", "куда пойти", "события", "афиша"]):
            for e in self.hot_facts["events"]:
                context_parts.append(f"Событие: {e['name']} в {e.get('time', 'весь день')} ({e['location']})")
                
        if any(w in query_lower for w in ["опасн", "предупрежд", "ветер", "внимани"]):
            for a in self.hot_facts["weather_alerts"]:
                context_parts.append(f"⚠️ ПРЕДУПРЕЖДЕНИЕ: {a['text']}")

        if not context_parts:
            # Random 'did you know' from live database if no specific match
            all_facts = [f["text"] for f in self.hot_facts["news"]] + \
                        [f"{e['name']} в {e['location']}" for e in self.hot_facts["events"]]
            context_parts.append(f"Кстати, актуальное на сегодня: {random.choice(all_facts)}")

        return "\n".join(context_parts)

_live_engine = None

def get_live_engine():
    global _live_engine
    if _live_engine is None:
        _live_engine = LiveDataEngine()
    return _live_engine
