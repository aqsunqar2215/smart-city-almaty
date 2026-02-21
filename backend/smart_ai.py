"""
Smart City Almaty — Hybrid AI Engine (Option C)
Runs completely locally, no external APIs required.
Enhanced with GPT-like response generation and 10,000+ word vocabulary.
"""

import re
import json
import random
import os
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal, AIKnowledge

try:
    from enhanced_gpt_ai import get_enhanced_ai, GPTConfig
    HAS_ENHANCED_AI = True
except ImportError:
    HAS_ENHANCED_AI = False

# Import extended databases for GPT-like capabilities
try:
    from conversation_database import (
        VOCABULARY, ECOLOGY_SENTENCES, WEATHER_SENTENCES, 
        TRAFFIC_SENTENCES, SMALL_TALK_SENTENCES, RESPONSE_TEMPLATES,
        MARKOV_PATTERNS, get_random_sentence, build_complex_response,
        get_thinking_phrase, get_transition, get_conclusion, get_empathy
    )
    from extended_dataset import EXTENDED_DATASET, get_extended_dataset
    HAS_EXTENDED_DB = True
except ImportError:
    HAS_EXTENDED_DB = False
    VOCABULARY = {}
    EXTENDED_DATASET = []

# V4.1: LLM runtime is intentionally disabled.
HAS_LLM = False


# ============================================
# ALMATY KNOWLEDGE BASE
# ============================================

ALMATY_KNOWLEDGE = {
    # Emergency Services
    "emergency": {
        "fire": {
            "number": "101",
            "name": "Fire Department",
            "emoji": "🔥",
            "instructions": "State exact address, floor, what is burning, and if there are casualties."
        },
        "police": {
            "number": "102", 
            "name": "Police",
            "emoji": "👮",
            "instructions": "State address, situation description, number and description of suspects."
        },
        "ambulance": {
            "number": "103",
            "name": "Ambulance", 
            "emoji": "🚑",
            "instructions": "State address, age of patient, symptoms, and current condition."
        },
        "gas": {
            "number": "104",
            "name": "Gas Emergency",
            "emoji": "⚠️",
            "instructions": "Do not turn on lights, open windows, and leave the premises immediately."
        },
        "catastrophe": {
            "number": "112",
            "name": "Unified Rescue Service",
            "emoji": "🆘",
            "instructions": "Universal number for any emergency or disaster."
        }
    },
    
    # Transport
    "transport": {
        "buses": ["12 (Medeu)", "32", "63", "79 (Airport)", "92 (Airport)", "121", "201 (Tole Bi)"],
        "metro_stations": [
            "Raiymbek Batyr", "Zhibek Zholy", "Almaly", "Abay", 
            "Baikonur", "Auezov Theater", "Alatau", "Sairan",
            "Moskva", "Saryarka", "Dostyk", "Kalkaman (under construction)"
        ],
        "taxi_apps": ["Yandex Go", "inDriver", "Uber"],
        "airport": {
            "name": "Almaty International Airport",
            "code": "ALA",
            "buses_to": ["79", "92", "79E"],
            "location": "Turksib District"
        },
        "railway": {
            "almaty_1": "Northern part of the city, Turksib District",
            "almaty_2": "City center, Ablai Khan Ave"
        }
    },
    
    # City Information
    "city_info": {
        "population": "2.2 million people",
        "area": "682 km²",
        "elevation": "700-900 m above sea level",
        "districts": [
            "Almaly", "Auezov", "Bostandyk", 
            "Zhetysu", "Medeu", "Nauryzbay",
            "Turksib", "Alatau"
        ],
        "landmarks": [
            "Kok-Tobe (TV tower and park)", 
            "Medeu (high-altitude ice rink)", 
            "Shymbulak (ski resort)", 
            "28 Panfilov Heroes Park",
            "Zenkov Cathedral (wooden)", 
            "BAO (Big Almaty Lake)",
            "Arbat (pedestrian zone on Zhibek Zholy)"
        ],
        "education": {
            "universities": ["Al-Farabi KazNU", "KBTU", "Satbayev University", "KIMEP", "IITU"],
            "schools": ["NIS", "RFMSH", "BINOM (upcoming)"]
        }
    },
    
    # Air Quality
    "air_quality": {
        "levels": {
            "good": {"range": "0-50", "emoji": "🟢", "advice": "Air quality is excellent. Perfect for outdoor activities and sports.", "ru": "Качество воздуха отличное. Идеально для спорта и прогулок."},
            "moderate": {"range": "51-100", "emoji": "🟡", "advice": "Acceptable. Sensitive groups should limit prolonged outdoor exertion.", "ru": "Приемлемо. Чувствительным группам стоит ограничить долгие нагрузки на улице."},
            "unhealthy_sensitive": {"range": "101-150", "emoji": "🟠", "advice": "Unhealthy for sensitive groups (children, elderly, asthmatics).", "ru": "Вредно для чувствительных групп."},
            "unhealthy": {"range": "151-200", "emoji": "🔴", "advice": "Unhealthy for everyone. Windows should be closed, air purifiers recommended.", "ru": "Вредно для всех. Закройте окна, включите очистители воздуха."},
            "very_unhealthy": {"range": "201-300", "emoji": "🟣", "advice": "Very unhealthy. Avoid outdoor physical activity. Wear an N95 mask.", "ru": "Очень вредно. Избегайте физ. активности на улице. Носите маску N95."},
            "hazardous": {"range": "300+", "emoji": "🟤", "advice": "Hazardous! Stay indoors. Masks are mandatory.", "ru": "Опасно! Оставайтесь дома. Маски обязательны."}
        }
    },

    # Leiure, Culture & Events (Added)
    "culture": {
        "museums": ["Central State Museum", "Kasteyev State Museum of Arts", "Almaty Museum", "Abay Opera House"],
        "theaters": ["Abay Opera House", "Auezov Theater", "Lermontov Theater", "ARTiSHOCK"],
        "malls": ["Mega Alma-Ata", "Dostyk Plaza", "Esentai Mall", "ADK", "Forum"],
        "parks": ["First President's Park", "Central Park (Gorky)", "Terrenkur", "Botanical Garden"]
    },

    # Healthcare (Added)
    "health": {
        "hospitals": ["Central City Clinical Hospital", "Children's Hospital No. 1", "Emergency Care Center"],
        "private_clinics": ["Dostik Med", "Keruen", "Sema"],
        "emergency_dental": ["Alatau Dental (24/7)", "City Dental Clinic No. 1"]
    }
}

# Intent recognition patterns (English + Russian fallback)
INTENT_PATTERNS = {
    "emergency_fire": [r"fire", r"burning", r"smoke", r"101", r"пожар", r"горит", r"дым"],
    "emergency_police": [r"police", r"theft", r"robbery", r"attack", r"fight", r"102", r"crime", r"полиц", r"кража"],
    "emergency_ambulance": [r"ambulance", r"doctor", r"pain", r"sick", r"103", r"medical", r"injury", r"heart", r"скорая", r"врач"],
    "emergency_gas": [r"gas", r"leak", r"104", r"smell of gas", r"газ", r"утечк"],
    "emergency_general": [r"emergency", r"sos", r"救命", r"rescue", r"112", r"экстрен", r"срочно", r"чп", r"катастрофа"],
    "transport_bus": [r"bus", r"route", r"stop", r"bus number", r"автобус", r"маршрут"],
    "transport_metro": [r"metro", r"subway", r"station", r"underground", r"метро", r"станци"],
    "transport_taxi": [r"taxi", r"cab", r"order a car", r"такси"],
    "transport_airport": [r"airport", r"plane", r"flight", r"ala", r"аэропорт"],
    "transport_general": [r"get to", r"reach", r"transport", r"travel", r"доехать", r"добрать"],
    "weather": [r"weather", r"temperature", r"rain", r"snow", r"cold", r"hot", r"degree", r"forecast", r"погод", r"температур", r"градус", r"осадк", r"дожд", r"снег"],
    "air_quality": [r"air", r"aqi", r"pollution", r"smog", r"breathe", r"pm2\.?5", r"pm10", r"eco", r"воздух", r"загрязнен", r"экология", r"смог", r"дышать"],
    "city_info": [r"almaty", r"city", r"population", r"district", r"landmark", r"university", r"school", r"history", r"fact", r"алмат[ыь]", r"город", r"биография", r"история", r"район", r"достопримечательность", r"университет"],
    "culture": [r"museum", r"theater", r"mall", r"park", r"cinema", r"shopping", r"entertainment", r"leisure", r"музей", r"театр", r"парк", r"тц", r"развлекаться", r"досуг", r"кино"],
    "health": [r"hospital", r"clinic", r"doctor", r"dentist", r"pharmacy", r"medicine", r"больница", r"клиника", r"аптека", r"врач", r"стоматолог", r"лечить", r"болит"],
    "context_query": [r"what did i ask", r"repeat", r"do you remember", r"before", r"earlier", r"что я спросил", r"повтори", r"помнишь"],
    "greeting": [r"hello", r"hi", r"good (morning|afternoon|evening)", r"salem", r"hey", r"привет", r"здравствуй", r"салем", r"добрый день", r"утро"],
    "thanks": [r"thanks", r"thank you", r"appreciate", r"rakhmet", r"спасибо", r"рахмет", r"благодарю"],
    "chat": [r"how are you", r"what's up", r"how's it going", r"who are you", r"you smart", r"love you", r"are you human", r"feelings", r"как дела", r"как ты", r"кто ты", r"ты человек", r"умный", r"любишь", r"че каво", r"как жизнь"],
    "help": [r"^help$", r"what can you do", r"functions", r"capabilities", r"что ты умеешь", r"^помощь$", r"помоги мне", r"умеешь", r"функции", r"возможности"],
    "infrastructure": [r"node", r"gpu", r"mining", r"reward", r"almt", r"nexus monitor", r"infrastructure", r"нод", r"награда", r"крипта", r"инфраструктура", r"заработать"],
    "neural_shield": [r"shield", r"security", r"bounty", r"bug", r"exploit", r"hack", r"взлом", r"баунти", r"уязвимость", r"щит", r"безопасность"],
    "advice": [r"walk", r"sport", r"outside", r"should i", r"recommend", r"is it good", r"can i", r"прогулка", r"гулять", r"спорт", r"совет", r"стоит ли", r"рекоменд", r"можно ли"]
}

@dataclass
class IntentResult:
    intent: str
    confidence: float
    sub_intent: Optional[str] = None
    entities: Dict[str, Any] = None
    language: str = "en"

class IntentClassifier:
    def classify(self, text: str) -> IntentResult:
        text_lower = text.lower()
        best_intent, best_confidence, sub_intent = "unknown", 0.0, None
        
        # Detect language (count characters to be robust against noise)
        ru_chars = len(re.findall(r'[а-яА-ЯёЁ]', text))
        en_chars = len(re.findall(r'[a-zA-Z]', text))
        
        # Determine language based on char count
        if ru_chars > 0 and en_chars == 0:
            lang = "ru"
        elif en_chars > 0 and ru_chars == 0:
            lang = "en"
        elif ru_chars > en_chars:
            lang = "ru"
        else:
            lang = "en"

        for intent, patterns in INTENT_PATTERNS.items():
            matches = sum(1 for p in patterns if re.search(p, text_lower))
            if matches > 0:
                conf = min(1.0, matches * 0.3 + 0.4)
                if conf > best_confidence:
                    best_confidence = conf
                    if "_" in intent:
                        parts = intent.split("_", 1)
                        best_intent, sub_intent = parts[0], parts[1]
                    else:
                        best_intent, sub_intent = intent, None
        
        return IntentResult(best_intent, best_confidence, sub_intent, self._extract_entities(text_lower), lang)
    
    def _extract_entities(self, text: str) -> Dict[str, Any]:
        entities = {}
        bus_match = re.search(r'(?:route|bus|number)\s*(\d+)', text)
        if bus_match: entities["bus_number"] = bus_match.group(1)
        
        # Check districts
        for d in ALMATY_KNOWLEDGE["city_info"]["districts"]:
            if d.lower() in text:
                entities["district"] = d
                break
        
        # Check for pronouns (contextual hints)
        if any(w in text for w in ["there", "it", "that", "там", "это", "туда"]):
            entities["has_pronoun"] = True
            
        return entities

class KnowledgeEngine:
    """Deep Research Engine for Almaty Data with GPT-like Generation"""
    def __init__(self):
        self.db_session = SessionLocal()
        self.vocab = self._load_vocabulary()
        self.extended_patterns = self._load_extended_patterns()
        self.conversation_history = []  # For context-aware responses
    
    def _load_vocabulary(self) -> set:
        """Loads common words to filter noise during semantic synthesis"""
        try:
            path = os.path.join(os.path.dirname(__file__), "english_5000.json")
            if os.path.exists(path):
                with open(path, 'r', encoding='utf-8') as f:
                    return {w.lower() for w in json.load(f)}
        except: pass
        return set()
    
    def _load_extended_patterns(self) -> Dict[str, List[Dict]]:
        """Load extended dataset patterns organized by language"""
        patterns = {"ru": [], "en": []}
        if HAS_EXTENDED_DB and EXTENDED_DATASET:
            for item in EXTENDED_DATASET:
                lang = item.get("language", "en")
                if lang in patterns:
                    patterns[lang].append(item)
        return patterns

    def find_answers(self, query: str, lang: str = "en", limit: int = 3) -> List[Dict[str, Any]]:
        """Multi-fact retrieval for synthesis with extended dataset support"""
        query_words = set(re.findall(r'[\w\d]+', query.lower(), re.UNICODE))
        if not query_words: return []
        
        stop_words = {"the", "is", "at", "which", "on", "in", "for", "a", "an", "and", "or", "что", "где", "когда", "как", "это", "мне", "нужно", "расскажи", "найди", "can", "you", "tell", "me", "please"}
        query_words = query_words - stop_words
        
        # Expand query words with synonyms
        expanded_query = set(query_words)
        for word in query_words:
            expanded_query.update(self.get_synonyms(word))
        
        results = []
        
        # Search in database
        try:
            knowledge_set = self.db_session.query(AIKnowledge).filter(AIKnowledge.language == lang).all()
            
            for item in knowledge_set:
                pattern_words = set(re.findall(r'[\w\d]+', item.pattern.lower(), re.UNICODE))
                overlap = expanded_query.intersection(pattern_words)
                
                phrase_bonus = 5.0 if item.pattern.lower() in query.lower() else 0.0
                
                keyword_score = 0
                for word in overlap:
                    if word in self.vocab and len(word) < 5:
                        keyword_score += 1
                    else:
                        keyword_score += 4
                
                importance = getattr(item, 'importance', 1)
                score = (keyword_score + phrase_bonus) * (1 + (importance - 1) * 0.3)
                
                if score >= 2.0:
                    results.append({"response": item.response, "score": score, "category": item.category})
        except Exception as e:
            pass  # Continue with extended dataset if DB fails
        
        # Search in extended dataset (in-memory)
        for item in self.extended_patterns.get(lang, []):
            pattern_words = set(re.findall(r'[\w\d]+', item.get("pattern", "").lower(), re.UNICODE))
            overlap = expanded_query.intersection(pattern_words)
            
            if overlap:
                keyword_score = len(overlap) * 3
                phrase_bonus = 5.0 if any(p in query.lower() for p in item.get("pattern", "").split()) else 0.0
                score = keyword_score + phrase_bonus
                
                if score >= 2.0:
                    results.append({"response": item.get("response", ""), "score": score, "category": item.get("category", "GENERAL")})
        
        # Sort by score and return top results
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def find_answer(self, query: str, lang: str = "en") -> Optional[str]:
        """Legacy single-answer retrieval"""
        answers = self.find_answers(query, lang, limit=1)
        return answers[0]["response"] if answers else None
    
    def generate_contextual_response(self, query: str, lang: str = "ru", topic: str = "general") -> str:
        """GPT-like response generation using extended vocabulary and templates"""
        if not HAS_EXTENDED_DB:
            return None
        
        # Build complex response using Markov-style patterns
        return build_complex_response(topic, lang, num_facts=random.randint(2, 4))
    
    def get_topic_sentences(self, topic: str, lang: str = "ru", count: int = 3) -> List[str]:
        """Get relevant sentences for a topic"""
        if not HAS_EXTENDED_DB:
            return []
        
        topic_map = {
            "ecology": ECOLOGY_SENTENCES,
            "weather": WEATHER_SENTENCES, 
            "traffic": TRAFFIC_SENTENCES,
            "general": SMALL_TALK_SENTENCES
        }
        
        sentences_dict = topic_map.get(topic, SMALL_TALK_SENTENCES)
        sentences = sentences_dict.get(lang, sentences_dict.get("ru", []))
        
        if sentences:
            return random.sample(sentences, min(count, len(sentences)))
        return []
    
    def enrich_response(self, base_response: str, topic: str, lang: str = "ru") -> str:
        """
        Returns response as-is. 
        Removed random elaborations for cleaner, more predictable output.
        """
        return base_response

    def get_synonyms(self, word: str) -> List[str]:
        # Expanded local synonym map with more terms
        syns = {
            "досуг": ["отдых", "развлечения", "сходить", "погулять", "места", "fun", "relax"],
            "лечить": ["больница", "клиника", "врач", "помощь", "здоровье", "медицина", "health"],
            "транспорт": ["автобус", "метро", "такси", "ехать", "маршрут", "дорога", "bus", "metro"],
            "ecology": ["air", "pollution", "smog", "aqi", "environment", "smoke", "экология", "воздух"],
            "weather": ["погода", "температура", "дождь", "снег", "climate", "forecast"],
            "traffic": ["пробка", "затор", "движение", "дорога", "congestion", "jam"],
            "history": ["past", "origin", "founded", "old", "ancient", "история", "прошлое"],
            "sights": ["landmarks", "places", "visit", "see", "monument", "достопримечательности"],
            "еда": ["кухня", "ресторан", "кафе", "традиции", "блюда", "food", "eat"],
            "спорт": ["лыжи", "коньки", "медео", "шымбулак", "тренировка", "sport", "ski"],
            "работа": ["карьера", "вакансии", "job", "career", "work"],
            "учеба": ["образование", "университет", "школа", "education", "study"],
            "пробки": ["затор", "трафик", "движение", "traffic", "congestion", "jam"],
            "смог": ["загрязнение", "воздух", "экология", "pollution", "smog", "air quality"],
        }
        return syns.get(word.lower(), [])

    def close(self):
        self.db_session.close()


class ResponseGenerator:
    def __init__(self, memory):
        self.classifier = IntentClassifier()
        self.knowledge = KnowledgeEngine()
        self.memory = memory
    
    def generate(self, message: str, context: Optional[Dict] = None) -> str:
        """
        Modified generation flow:
        Use the new EnhancedGPTStyleAI if available, 
        otherwise fall back to old pattern matching.
        """
        if HAS_ENHANCED_AI:
            ai = get_enhanced_ai()
            # We can pass session_id if we have it in context, else 'default'
            session_id = context.get('session_id', 'default') if context else 'default'
            return ai.chat(message, session_id=session_id)

        # --- LEGACY FLOW BELOW ---
        result = self.classifier.classify(message)
        result.entities["raw_text"] = message

        # 0. Contextual Enrichment
        if result.entities.get("has_pronoun"):
            last_intent = self.memory.get_last_intent()
            if last_intent and result.intent == "unknown":
                result.intent = last_intent
        
        # Handler mapping
        handlers = {
            "emergency": self._handle_emergency, "transport": self._handle_transport,
            "weather": self._handle_weather, "air": self._handle_air_quality,
            "city": self._handle_city_info, "context": self._handle_context,
            "culture": self._handle_culture, "health": self._handle_health,
            "infrastructure": self._handle_infrastructure, "neural_shield": self._handle_shield,
            "advice": self._handle_advice, "chat": self._handle_chat_intent,
            "greeting": self._handle_greeting, "thanks": self._handle_thanks,
            "help": self._handle_help, "unknown": self._handle_unknown,
        }
        
        # 1. Handle simple intents directly (no DB search needed)
        simple_intents = {"greeting", "thanks", "help", "emergency"}
        if result.intent in simple_intents:
            handler_response = handlers[result.intent](result, context or {})
            return self._apply_reasoning(handler_response, context or {}, result.language)
        
        # 2. For other intents, try specialized handlers first
        if result.intent in handlers and result.intent != "unknown":
            handler_response = handlers[result.intent](result, context or {})
            return self._apply_reasoning(handler_response, context or {}, result.language)
        
        # 3. For unknown intents - search knowledge base
        facts = self.knowledge.find_answers(message, result.language, limit=2)
        if facts:
            response = self._synthesize_facts(facts, result.language)
            return self._apply_reasoning(response, context or {}, result.language)

        # 4. Final fallback
        return self._apply_reasoning(
            self._handle_unknown(result, context or {}), 
            context or {}, 
            result.language
        )

    def _simulate_cot(self, intent: str, lang: str) -> str:
        """
        Generates a brief 'thought process' string.
        Now shows only 5% of the time to keep responses clean and concise.
        """
        # Show thinking process only rarely (5% of cases) for cleaner responses
        if random.random() > 0.05:
            return ""
        
        is_ru = lang == "ru"
        
        # Short, focused thinking indicators
        if intent in ["emergency", "emergency_fire", "emergency_police", "emergency_ambulance"]:
            return ""  # Never show thinking for emergencies - direct response needed
        
        if is_ru:
            return "> 🔍 *Обрабатываю запрос...*\n\n"
        return "> 🔍 *Processing...*\n\n"

    def _handle_chat_intent(self, result, context):
        """Dedicated handler for the new conversational knowledge base"""
        # Prioritize matching from the expanded dataset
        facts = self.knowledge.find_answers(result.entities.get("raw_text", ""), result.language, limit=1)
        if facts:
            return facts[0]["response"]
        
        # Fallback to a generic polite response
        if result.language == "ru":
            return "Я всегда готов пообщаться! Расскажите, что вас интересует в Алматы?"
        return "I'm always here to talk! Tell me, what interests you about Almaty today?"

    def _synthesize_facts(self, facts: List[Dict], lang: str) -> str:
        """
        Combines multiple facts into a clean, concise response.
        Simplified to avoid verbose introductions and transitions.
        """
        is_ru = lang == "ru"
        
        # Deduplicate and format
        responses = []
        for f in facts:
            resp = f["response"].strip()
            if resp not in responses:
                responses.append(resp)
        
        if not responses: 
            return ""
        
        # Single fact - return as is
        if len(responses) == 1: 
            return responses[0]
        
        # Multiple facts - combine cleanly with simple separator
        # Limit to 2 facts max for brevity
        responses = responses[:2]
        
        if is_ru:
            return f"{responses[0]}\n\n{responses[1]}" if len(responses) > 1 else responses[0]
        else:
            return f"{responses[0]}\n\n{responses[1]}" if len(responses) > 1 else responses[0]

    def _apply_reasoning(self, response: str, context: Dict, lang: str) -> str:
        """
        Apply contextual reasoning only when truly relevant.
        Simplified to avoid random distractions and verbose prefixes.
        """
        air = context.get("air", {})
        aqi = air.get("aqi", 0)
        weather = context.get("weather", {})
        temp = weather.get("temperature")
        is_ru = lang == "ru"
        
        reasoning = []
        
        # Only add contextual warnings when genuinely important (high thresholds)
        if aqi > 150:  # Only for actually unhealthy air
            if is_ru: 
                reasoning.append(f"⚠️ AQI сейчас {aqi} — ограничьте время на улице.")
            else: 
                reasoning.append(f"⚠️ AQI is {aqi} — limit outdoor time.")
        
        # Weather extremes only
        if temp is not None:
            if temp > 38:
                reasoning.append("🔥 Берегитесь жары!" if is_ru else "🔥 Stay cool!")
            elif temp < -20:
                reasoning.append("❄️ Сильный мороз!" if is_ru else "❄️ Extreme cold!")

        # Build final response without verbose prefix
        suffix = ""
        if reasoning:
            suffix = "\n\n" + " • ".join(reasoning)
        
        return f"{response}{suffix}"
    
    def _handle_context(self, result, context):
        history = self.memory.get_context()
        past_user_msgs = [m["content"] for m in history[:-1] if m["role"] == "user"]
        if not past_user_msgs: return "We just started our conversation! I don't have anything to recall yet. 😊"
        return f"You recently asked: *\"{past_user_msgs[-1]}\"*.\n\nI remember our conversation and am ready to continue!"

    def _handle_emergency(self, result, context):
        em = ALMATY_KNOWLEDGE["emergency"]
        is_ru = result.language == "ru"
        
        title = "📞 **Экстренные службы Алматы:**" if is_ru else "📞 **Almaty Emergency Services:**"
        footer = "\n\n🚑 *В любой ситуации звоните 112*" if is_ru else "\n\n🚑 *In any situation, you can call 112*"

        if result.sub_intent in em:
            svc = em[result.sub_intent]
            # Simple localization for keys if needed
            name = svc['name']
            if is_ru:
                names = {"Fire Department": "Пожарная служба", "Police": "Полиция", "Ambulance": "Скорая помощь", "Gas Emergency": "Аварийная служба газа", "Unified Rescue Service": "Служба спасения 112"}
                name = names.get(name, name)
            return f"{svc['emoji']} **{name}**: {svc['number']}\n\n{svc['instructions'] if not is_ru else 'Вызывайте при необходимости.'}"
            
        lines = [title]
        for svc in em.values(): 
            name = svc['name']
            if is_ru:
                names = {"Fire Department": "Пожарная", "Police": "Полиция", "Ambulance": "Скорая", "Gas Emergency": "Газ", "Unified Rescue Service": "ЧС/112"}
                name = names.get(name, name)
            lines.append(f"{svc['emoji']} {name}: **{svc['number']}**")
        return "\n".join(lines) + footer

    def _handle_transport(self, result, context):
        tr = ALMATY_KNOWLEDGE["transport"]
        is_ru = result.language == "ru"
        
        if result.sub_intent == "metro":
            msg = f"🚇 **Almaty Metro**\n\nStations: {', '.join(tr['metro_stations'][:8])}...\n\n⏰ Operating hours: 06:20 - 00:00"
            if is_ru:
                msg = f"🚇 **Алматинский метрополитен**\n\nСтанции: {', '.join(tr['metro_stations'][:8])}...\n\n⏰ Время работы: 06:20 - 00:00"
            return msg
            
        if result.sub_intent == "airport":
            msg = f"✈️ **{tr['airport']['name']}**\n\n🚌 Buses: {', '.join(tr['airport']['buses_to'])}\n📍 {tr['airport']['location']}"
            if is_ru:
                msg = f"✈️ **Международный аэропорт Алматы**\n\n🚌 Автобусы: {', '.join(tr['airport']['buses_to'])}\n📍 Турксибский район"
            return msg
            
        if result.sub_intent == "bus" or result.entities.get("bus_number"):
            num = result.entities.get("bus_number", "")
            if num:
                if is_ru: return f"🚌 Автобус **{num}**: Загрузка телеметрии... Для отслеживания используйте приложения CityBus или Onay."
                return f"🚌 Bus **{num}**: Loading telemetry... For real-time tracking, use CityBus or Onay app."
            
            if is_ru: return f"🚌 **Основные маршруты**: {', '.join(tr['buses'])}\n\n💡 Маршрут №12 едет до Медеу!"
            return f"🚌 **Main Bus Routes**: {', '.join(tr['buses'])}\n\n💡 Route #12 goes to Medeu!"
            
        if is_ru: return "🚌 **Транспорт Алматы**: Метро, 150+ автобусных маршрутов, система оплаты Onay. Используйте 2GIS для построения маршрутов."
        return "🚌 **Almaty Transport**: Metro, 100+ bus routes, Onay payment system. Use 2GIS for optimal routing."

    def _handle_weather(self, result, context):
        w = context.get("weather", {})
        is_ru = result.language == "ru"
        if w:
            temp = w.get('temperature', 'N/A')
            desc = w.get('description', 'clear')
            hum = w.get('humidity', 'N/A')
            if is_ru:
                return f"🌤️ **Погода**: **{temp}°C**, {desc}. 💧 Влажность: {hum}%"
            return f"🌤️ **Weather**: **{temp}°C**, {desc}. 💧 Humidity: {hum}%"
        if is_ru:
            return "🌤️ Погода сейчас комфортная. Данные сенсоров временно недоступны."
        return "🌤️ The weather is comfortable right now. Sensor data is temporarily unavailable."

    def _handle_air_quality(self, result, context):
        air = context.get("air", {})
        aqi = air.get("aqi", 0)
        is_ru = result.language == "ru"
        levels = ALMATY_KNOWLEDGE["air_quality"]["levels"]
        lv = levels["good"] if aqi <= 50 else levels["moderate"] if aqi <= 100 else levels["unhealthy_sensitive"] if aqi <= 150 else levels["unhealthy"] if aqi <= 200 else levels["very_unhealthy"] if aqi <= 300 else levels["hazardous"]
        
        advice = lv["ru"] if is_ru else lv["advice"]
        return f"💨 **Air Quality**: AQI **{aqi}**, PM2.5: {air.get('pm25', 'N/A')} µg/m³\n\n{lv['emoji']} {advice}"

    def _handle_culture(self, result, context):
        cu = ALMATY_KNOWLEDGE["culture"]
        is_ru = result.language == "ru"
        if is_ru:
            return f"🎭 **Культура и Досуг**:\n\n🏛️ **Музеи**: {', '.join(cu['museums'][:3])}\n🛍️ **ТЦ**: {', '.join(cu['malls'][:3])}\n🌳 **Парки**: {', '.join(cu['parks'][:3])}\n\nЧто именно вас интересует?"
        return f"🎭 **Culture & Leisure**:\n\n🏛️ **Museums**: {', '.join(cu['museums'][:3])}\n🛍️ **Shopping**: {', '.join(cu['malls'][:3])}\n🌳 **Parks**: {', '.join(cu['parks'][:3])}\n\nWhat would you like to explore?"

    def _handle_health(self, result, context):
        he = ALMATY_KNOWLEDGE["health"]
        is_ru = result.language == "ru"
        if is_ru:
            return f"🏥 **Здоровье и медицина**:\n\n🚑 **Госпитальные центры**: {', '.join(he['hospitals'])}\n🦷 **Стоматология 24/7**: {he['emergency_dental'][0]}\n\nБерегите себя! Если это экстренный случай, звоните **103**."
        return f"🏥 **Healthcare & Medical**:\n\n🚑 **Major Hospitals**: {', '.join(he['hospitals'])}\n🦷 **24/7 Dental**: {he['emergency_dental'][0]}\n\nStay safe! If this is an emergency, call **103**."

    def _handle_infrastructure(self, result, context):
        is_ru = result.language == "ru"
        if is_ru:
            return "🏗️ **Инфраструктурные ноды**: Вы можете сдавать в аренду свои GPU мощности или делиться данными датчиков на странице **Infrastructure**. За это вы получаете токены **ALMT**."
        return "🏗️ **Infrastructure Nodes**: You can lease your GPU power or share sensor data on the **Infrastructure** page. This earns you **ALMT** tokens for contributing to the city's AI core."

    def _handle_shield(self, result, context):
        is_ru = result.language == "ru"
        if is_ru:
            return "🛡️ **Neural Shield**: Наша программа Bug Bounty. Найдите уязвимость в городских системах и получите награду до $1,000. Подробности на вкладке инфраструктуры."
        return "🛡️ **Neural Shield**: Our Bug Bounty program. Find vulnerabilities in city systems and claim rewards up to $1,000. Details are in the Infrastructure tab."

    def _handle_advice(self, result, context):
        air = context.get("air", {})
        aqi = air.get("aqi", 0)
        weather = context.get("weather", {})
        temp = weather.get("temperature", 20)
        is_ru = result.language == "ru"
        
        if aqi > 150:
            if is_ru: return "🚫 **Не рекомендую**: Качество воздуха сейчас критическое (AQI {aqi}). Лучше остаться дома."
            return f"🚫 **Not Recommended**: Air quality is critical (AQI {aqi}) right now. Better stay indoors."
        
        if temp < -15:
            if is_ru: return f"❄️ **Холодно**: Температура {temp}°C. Если выйдете, одевайтесь очень тепло. Но воздух сегодня чистый!"
            return f"❄️ **Very Cold**: It's {temp}°C. Dress very warmly if you go out. Air is clear though!"
            
        if is_ru: return "✅ **Отличное время**: Погода и воздух в норме. Прогулка или спорт на свежем воздухе пойдут на пользу!"
        return "✅ **Great time**: Both weather and air quality are within normal limits. A walk or outdoor sport would be beneficial!"

    def _handle_city_info(self, result, context):
        ci = ALMATY_KNOWLEDGE["city_info"]
        is_ru = result.language == "ru"
        if is_ru:
            return f"🏙️ **Алматы** (Южная столица)\n\n👥 Население: 2.2 миллиона человек\n📍 **Места**: Кок-Тобе, Медеу, Шымбулак, Парк 28 панфиловцев\n🏛️ **Районы**: {', '.join(['Алмалинский', 'Медеуский', 'Ауэзовский', 'Бостандыкский'])}"
        return f"🏙️ **Almaty** (The Southern Capital)\n\n👥 Population: {ci['population']}\n📍 **Landmarks**: {', '.join(ci['landmarks'][:5])}\n🏛️ **Districts**: {', '.join(ci['districts'])}"

    def _handle_greeting(self, result, context):
        if result.language == "ru":
            greetings = [
                "👋 Привет! Чем могу помочь?",
                "Здравствуйте! Спрашивайте о транспорте, погоде или городе.",
                "Салем! Я ваш помощник по Алматы."
            ]
            return random.choice(greetings)
        greetings = [
            "👋 Hello! How can I help?",
            "Hi there! Ask me about transport, weather, or the city.",
            "Hey! I'm your Almaty assistant."
        ]
        return random.choice(greetings)

    def _handle_thanks(self, result, context):
        if result.language == "ru":
            return random.choice(["😊 Пожалуйста!", "Рад помочь! 🏔️", "Без проблем! 🇰🇿"])
        return random.choice(["😊 You're welcome!", "Happy to help! 🏔️", "No problem! 🇰🇿"])

    def _handle_help(self, result, context):
        if result.language == "ru":
            return "Могу помочь с:\n• 🚨 Экстренные (101, 102, 103, 112)\n• 🚌 Транспорт\n• 💨 Качество воздуха\n• 🌤️ Погода\n• 🏙️ Город"
        return "I can help with:\n• 🚨 Emergency (101, 102, 103, 112)\n• 🚌 Transport\n• 💨 Air quality\n• 🌤️ Weather\n• 🏙️ City info"

    def _handle_unknown(self, result, context):
        """
        Handle unknown intents with concise, helpful fallback.
        """
        is_ru = result.language == "ru"
        raw_text = result.entities.get("raw_text", "")
        
        # Try to find keyword matches in KnowledgeEngine
        facts = self.knowledge.find_answers(raw_text, result.language, limit=2)
        if facts:
            return self._synthesize_facts(facts, result.language)
        
        # Short query clarification
        words = raw_text.split()
        if len(words) <= 1:
            if is_ru: 
                return "О чём вы хотите узнать? Спросите про транспорт, погоду, экологию или город."
            return "What would you like to know? Ask about transport, weather, ecology, or the city."

        # Simple fallback
        if is_ru:
            return "Не нашёл точной информации. Попробуйте спросить про:\n• Транспорт (метро, автобусы)\n• Погоду\n• Качество воздуха\n• Экстренные службы (101, 102, 103)"
        else:
            return "I couldn't find specific info. Try asking about:\n• Transport (metro, buses)\n• Weather\n• Air quality\n• Emergency services (101, 102, 103)"
    
    def _detect_topic(self, text: str) -> str:
        """Detect the main topic from user input for contextual response generation"""
        text_lower = text.lower()
        
        topic_keywords = {
            "ecology": ["воздух", "экология", "смог", "загрязнение", "aqi", "pm2.5", "air", "pollution", "smog", "environment"],
            "weather": ["погода", "температура", "дождь", "снег", "прогноз", "weather", "temperature", "rain", "snow", "forecast", "climate"],
            "traffic": ["пробка", "затор", "трафик", "дорога", "движение", "traffic", "jam", "congestion", "road", "driving"],
        }
        
        max_matches = 0
        detected_topic = "general"
        
        for topic, keywords in topic_keywords.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > max_matches:
                max_matches = matches
                detected_topic = topic
        
        return detected_topic

class ConversationMemory:
    def __init__(self, max_history=10):
        self.history = []
        self.max_history = max_history
        self.last_intent = None

    def add(self, role, content, intent=None):
        self.history.append({
            "role": role, 
            "content": content, 
            "intent": intent, 
            "timestamp": datetime.now().isoformat()
        })
        if intent: self.last_intent = intent
        if len(self.history) > self.max_history: self.history.pop(0)

    def get_context(self): return self.history.copy()
    def get_last_intent(self): return self.last_intent
    def clear(self): 
        self.history = []
        self.last_intent = None

class SmartCityAI:
    def __init__(self):
        self.memory = ConversationMemory()
        self.generator = ResponseGenerator(self.memory)
    def chat(self, message, context=None):
        if HAS_ENHANCED_AI:
            # Use Enhanced AI for chat as well
            ai = get_enhanced_ai()
            # Ensure history is synced if needed, but enhanced_ai has its own history
            response = ai.chat(message, session_id="mem_session")
            # Keep sync with legacy memory for history endpoints
            self.memory.add("user", message)
            self.memory.add("assistant", response)
            return response

        # Legacy chat
        res = self.generator.generate(message, context)
        self.memory.add("user", message, "unknown")
        self.memory.add("assistant", res)
        return res
    def get_history(self): return self.memory.get_context()
    def clear_history(self): self.memory.clear()

_ai_instance = None
def get_ai():
    global _ai_instance
    if _ai_instance is None: _ai_instance = SmartCityAI()
    return _ai_instance
