"""
Proactive Intelligence Engine for Smart City Almaty
===================================================
Anticipates user needs based on urban context (weather, time, air quality).
Generates suggestions and warnings without being explicitly asked.
"""

import random
from datetime import datetime
from typing import List, Dict, Any, Optional

class ProactiveEngine:
    def __init__(self):
        self.last_suggestion_time = None
        self.cooldown = 300 # 5 minutes cooldown between proactive suggestions
        
    def get_suggestions(self, context: Dict[str, Any], lang: str = "en") -> List[str]:
        """
        Analyze context and return a list of relevant suggestions.
        """
        suggestions = []
        now = datetime.now()
        hour = now.hour
        
        # 1. Weather/Ecology based logic
        weather = context.get("weather", {})
        air = context.get("air", {})
        
        temp = weather.get("temperature", 20)
        aqi = air.get("aqi", 0)
        
        if aqi > 150:
            if lang == "ru":
                suggestions.append("⚠️ Загрязнение воздуха высокое. Рекомендую надеть маску N95.")
            else:
                suggestions.append("⚠️ Air pollution is high. I recommend wearing an N95 mask.")
                
        if temp < -10:
            if lang == "ru":
                suggestions.append("❄️ На улице мороз! Не забудьте одеться потеплее и выпить горячего чая.")
            else:
                suggestions.append("❄️ It's freezing outside! Remember to dress warmly.")
        elif temp > 30:
            if lang == "ru":
                suggestions.append("🔥 Сегодня жарко. Пейте больше воды и старайтесь быть в тени.")
            else:
                suggestions.append("🔥 It's hot today. Stay hydrated and try to stay in the shade.")

        # 2. Time-based logic
        if 7 <= hour <= 9: # Morning rush hour
            traffic_hint = "🚌 Утренний час пик. Автобусы могут задерживаться." if lang == "ru" else "🚌 Morning rush hour. Buses might be delayed."
            suggestions.append(traffic_hint)
        elif 18 <= hour <= 20: # Evening rush hour
            traffic_hint = "🚗 Вечерние пробки. В центре города заторы 7-8 баллов." if lang == "ru" else "🚗 Evening traffic. Expect delays in the city center."
            suggestions.append(traffic_hint)
            
        # 3. Weekend/Culture logic
        if now.weekday() >= 5: # Saturday/Sunday
            if lang == "ru":
                suggestions.append("🏔️ Выходные! Отличное время, чтобы съездить на Медеу или в горы.")
            else:
                suggestions.append("🏔️ It's the weekend! Great time to visit Medeu or the mountains.")
        
        return suggestions

    def get_brain_intro(self, lang: str = "en") -> str:
        """Greeting based on time of day"""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return "Good morning!" if lang == "en" else "Доброе утро!"
        elif 12 <= hour < 18:
            return "Good afternoon!" if lang == "en" else "Добрый день!"
        else:
            return "Good evening!" if lang == "en" else "Добрый вечер!"

_proactive_engine = None

def get_proactive_engine():
    global _proactive_engine
    if _proactive_engine is None:
        _proactive_engine = ProactiveEngine()
    return _proactive_engine
