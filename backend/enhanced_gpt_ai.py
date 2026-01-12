"""
Enhanced GPT-Style AI Engine for Smart City Almaty
===================================================
This is the brain of the chatbot - combining all NLP components
for natural, human-like conversations similar to early GPT models.

Features:
- Multi-layer intent understanding
- Context-aware response generation
- Sentiment-adjusted personality
- Knowledge synthesis from multiple sources
- Conversational memory
- Graceful error handling

Total: ~800 lines of AI orchestration logic
"""

import re
import random
import logging
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# IMPORT AI COMPONENTS
# ============================================

# Import advanced NLP engine
try:
    from advanced_nlp_engine import (
        AdvancedNLPProcessor, TextPreprocessor, TFIDFEngine,
        NGramModel, MarkovChainGenerator, SentimentAnalyzer,
        EntityExtractor, ConversationContextManager, ResponseTemplateEngine,
        get_nlp_processor, detect_language, normalize_query
    )
    HAS_NLP_ENGINE = True
except ImportError as e:
    logger.warning(f"Advanced NLP engine not available: {e}")
    HAS_NLP_ENGINE = False

# Import GPT-style knowledge base
try:
    from gpt_knowledge_base import (
        GPT_CONVERSATIONS, ConversationalPatternMatcher,
        DynamicResponseGenerator, get_pattern_matcher, get_response_generator
    )
    HAS_GPT_KB = True
except ImportError as e:
    logger.warning(f"GPT knowledge base not available: {e}")
    HAS_GPT_KB = False

# Import existing components
try:
    from conversation_database import (
        VOCABULARY, ECOLOGY_SENTENCES, WEATHER_SENTENCES,
        TRAFFIC_SENTENCES, SMALL_TALK_SENTENCES, RESPONSE_TEMPLATES,
        get_random_sentence, get_thinking_phrase, get_transition
    )
    HAS_CONV_DB = True
except ImportError:
    HAS_CONV_DB = False

try:
    from extended_dataset import EXTENDED_DATASET
    HAS_EXTENDED_DS = True
except ImportError:
    HAS_EXTENDED_DS = False
    EXTENDED_DATASET = []

try:
    from live_data_engine import get_live_engine
    HAS_LIVE_DATA = True
except ImportError:
    HAS_LIVE_DATA = False

try:
    from vision_engine import get_vision_engine
    HAS_VISION = True
except ImportError:
    HAS_VISION = False

try:
    from voice_engine import get_voice_engine
    HAS_VOICE = True
except ImportError:
    HAS_VOICE = False

try:
    from logic_engine import LogicEngine, get_logic_engine
    HAS_LOGIC = True
except ImportError:
    HAS_LOGIC = False

try:
    from urban_science_engine import get_urban_science_engine
    HAS_SCIENCE = True
except ImportError:
    HAS_SCIENCE = False

try:
    from long_term_memory import get_long_term_memory
    HAS_MEMORY = True
except ImportError:
    HAS_MEMORY = False

try:
    from culture_engine import CultureEngine, get_culture_engine
    HAS_CULTURE = True
except ImportError:
    HAS_CULTURE = False

try:
    from knowledge_graph import get_knowledge_graph
    HAS_GRAPH = True
except ImportError:
    HAS_GRAPH = False

try:
    from llm_engine import get_llm
    HAS_LLM = True
except ImportError:
    HAS_LLM = False

try:
    from neural_engine import NeuralClassifierV2
    HAS_NEURAL_BRAIN = True
except ImportError:
    HAS_NEURAL_BRAIN = False

# ============================================
# CONFIGURATION
# ============================================

@dataclass
class GPTConfig:
    """Configuration for GPT-style AI behavior"""
    # Response generation
    max_response_length: int = 200
    min_response_length: int = 10
    temperature: float = 0.7
    
    # Personality
    show_thinking: bool = False  # Show "thinking" process (old behavior)
    add_emoji: bool = True
    personality_level: float = 0.7  # 0=formal, 1=casual
    
    # Context
    use_context: bool = True
    context_window: int = 5  # Number of previous turns to consider
    
    # Quality
    min_confidence: float = 0.3  # Minimum confidence for response
    use_fallback_llm: bool = True  # Use Ollama as fallback
    
    # Debug
    debug_mode: bool = False

# Default config
DEFAULT_CONFIG = GPTConfig()

# ============================================
# DATA CLASSES
# ============================================

@dataclass
class UserIntent:
    """Parsed user intent with metadata"""
    primary: str
    secondary: Optional[str] = None
    confidence: float = 0.0
    entities: Dict[str, Any] = field(default_factory=dict)
    language: str = "ru"
    sentiment: float = 0.0
    is_question: bool = False
    is_command: bool = False
    raw_text: str = ""

@dataclass
class AIResponse:
    """AI response with metadata"""
    text: str
    intent: str
    confidence: float
    source: str  # "pattern", "nlp", "llm", "fallback"
    language: str
    sentiment_adjustment: float = 0.0
    entities_found: List[str] = field(default_factory=list)
    processing_time_ms: float = 0.0

# ============================================
# INTENT CLASSIFIER
# ============================================

class EnhancedIntentClassifier:
    """
    Multi-layer intent classification with confidence scoring
    """
    
    # Intent patterns with weights
    INTENT_PATTERNS = {
        # Emergency (highest priority)
        "emergency": {
            "weight": 2.0,
            "patterns": {
                "en": [r"fire", r"ambulance", r"police", r"emergency", r"help me", r"accident", r"101\b", r"102\b", r"103\b", r"112\b"]
            }
        },
        # Greeting
        "greeting": {
            "weight": 1.5,
            "patterns": {
                "en": [r"^hello", r"^hi\b", r"^hey\b", r"good morning", r"good evening", r"greetings"]
            }
        },
        # Farewell
        "farewell": {
            "weight": 1.5,
            "patterns": {
                "en": [r"^bye", r"goodbye", r"see you", r"good night", r"farewell"]
            }
        },
        # Thanks
        "thanks": {
            "weight": 1.5,
            "patterns": {
                "en": [r"thanks", r"thank you", r"appreciate", r"thx"]
            }
        },
        # Emotional check
        "emotional": {
            "weight": 1.3,
            "patterns": {
                "en": [r"how are you", r"how's it going", r"what's up", r"feeling", r"i am sad", r"i am happy"]
            }
        },
        # Identity
        "identity": {
            "weight": 1.3,
            "patterns": {
                "en": [r"who are you", r"what are you", r"what can you do", r"are you", r"your name"]
            }
        },
        # Transport
        "transport": {
            "weight": 1.2,
            "patterns": {
                "en": [r"metro", r"bus", r"taxi", r"transport", r"route", r"airport", r"traffic", r"get to", r"go to"]
            }
        },
        # Weather/Ecology
        "weather_eco": {
            "weight": 1.2,
            "patterns": {
                "en": [r"weather", r"temperature", r"air", r"smog", r"pollution", r"rain", r"snow", r"forecast", r"aqi"]
            }
        },
        # City info
        "city": {
            "weight": 1.1,
            "patterns": {
                "en": [r"almaty", r"city", r"sights", r"places to visit", r"landmarks", r"history", r"where is"]
            }
        },
        # Philosophy/Deep talk
        "philosophy": {
            "weight": 1.0,
            "patterns": {
                "en": [r"meaning of life", r"happiness", r"love", r"advice", r"purpose", r"philosophy"]
            }
        },
        # Help request
        "help": {
            "weight": 1.0,
            "patterns": {
                "en": [r"^help$", r"help me", r"what can you", r"assist"]
            }
        },
    }
    
    def __init__(self):
        self.preprocessor = TextPreprocessor() if HAS_NLP_ENGINE else None
        self.sentiment_analyzer = SentimentAnalyzer() if HAS_NLP_ENGINE else None
        self.entity_extractor = EntityExtractor() if HAS_NLP_ENGINE else None
        self.neural_brain = NeuralClassifierV2() if HAS_NEURAL_BRAIN else None
    
    def classify(self, text: str) -> UserIntent:
        """Classify user input into intent with confidence"""
        # 1. Try Neural Brain first (LSTM V2)
        if self.neural_brain:
            try:
                intent_tag, confidence = self.neural_brain.predict(text)
                if confidence > 0.6:
                    lang = "en" # Neural Brain is primarily English for now
                    return UserIntent(
                        primary=intent_tag.lower(),
                        confidence=confidence,
                        language=lang,
                        raw_text=text
                    )
            except Exception as e:
                logger.debug(f"Neural brain failed: {e}")

        # 2. Fallback to Regex and NLP
        # Detect language
        if HAS_NLP_ENGINE:
            lang = "en" # Force English for now
        else:
            lang = "en" # Force English default
        
        text_lower = text.lower().strip()
        
        # Check for question
        is_question = text.endswith("?") or any(
            text_lower.startswith(w) for w in ["как", "что", "где", "когда", "почему", "зачем", "how", "what", "where", "when", "why"]
        )
        
        # Check for command
        is_command = text.endswith("!")
        
        # Match intents
        intent_scores = {}
        
        for intent, data in self.INTENT_PATTERNS.items():
            patterns = data["patterns"].get(lang, [])
            weight = data["weight"]
            
            for pattern in patterns:
                if re.search(pattern, text_lower, re.UNICODE):
                    score = weight * (1 + len(pattern) / 50)  # Longer patterns = higher score
                    
                    if intent not in intent_scores or score > intent_scores[intent]:
                        intent_scores[intent] = score
        
        # Get best intent
        if intent_scores:
            best_intent = max(intent_scores, key=intent_scores.get)
            confidence = min(1.0, intent_scores[best_intent] / 3.0)
        else:
            best_intent = "unknown"
            confidence = 0.1
        
        # Analyze sentiment
        sentiment = 0.0
        if self.sentiment_analyzer:
            sent_result = self.sentiment_analyzer.analyze(text, lang)
            sentiment = sent_result["score"]
        
        # Extract entities
        entities = {}
        if self.entity_extractor:
            entities = self.entity_extractor.extract(text, lang)
        
        return UserIntent(
            primary=best_intent,
            secondary=None,
            confidence=confidence,
            entities=entities,
            language=lang,
            sentiment=sentiment,
            is_question=is_question,
            is_command=is_command,
            raw_text=text
        )


# ============================================
# RESPONSE SYNTHESIZER
# ============================================

class ResponseSynthesizer:
    """
    Synthesize responses from multiple sources
    """
    
    def __init__(self):
        self.pattern_matcher = get_pattern_matcher() if HAS_GPT_KB else None
        self.response_generator = get_response_generator() if HAS_GPT_KB else None
        self.nlp_processor = get_nlp_processor() if HAS_NLP_ENGINE else None
        self._initialized = False
    
    def initialize(self):
        """Initialize with knowledge base"""
        if self._initialized:
            return
        
        if HAS_NLP_ENGINE and self.nlp_processor:
            # Build knowledge base for NLP processor
            knowledge_items = []
            
            # Add extended dataset
            if HAS_EXTENDED_DS:
                for item in EXTENDED_DATASET:
                    knowledge_items.append({
                        "text": item.get("response", ""),
                        "category": item.get("category", "general"),
                        "language": item.get("language", "ru"),
                        "importance": 1.0
                    })
            
            # Add GPT conversations
            if HAS_GPT_KB:
                for category, lang_data in GPT_CONVERSATIONS.items():
                    for lang, patterns in lang_data.items():
                        for pattern_group in patterns:
                            for response in pattern_group["responses"]:
                                knowledge_items.append({
                                    "text": response,
                                    "category": category,
                                    "language": lang,
                                    "importance": 1.2  # Boost GPT responses
                                })
            
            if knowledge_items:
                self.nlp_processor.initialize(knowledge_items)
        
        self._initialized = True
    
    def synthesize(self, intent: UserIntent, session_id: str = "default",
                   config: GPTConfig = DEFAULT_CONFIG) -> AIResponse:
        """
        Synthesize best response for given intent
        Uses multiple sources and picks best one
        """
        start_time = datetime.now()
        
        # Initialize if needed
        if not self._initialized:
            self.initialize()
        
        responses = []  # (response, source, confidence)
        
        # 0. HIGHEST PRIORITY: Check for injected LIVE_DATA context
        if "[LIVE_DATA:" in intent.raw_text:
            try:
                # Extract live data from prefix
                live_data_match = re.search(r'\[LIVE_DATA:\s*([^\]]+)\]', intent.raw_text)
                if live_data_match:
                    live_info = live_data_match.group(1).strip()
                    # Clean the query (remove the prefix)
                    clean_query = re.sub(r'\[LIVE_DATA:[^\]]+\]\s*', '', intent.raw_text).strip()
                    
                    # Generate response based on live data
                    if "traffic" in clean_query.lower() or "congestion" in clean_query.lower():
                        responses.append((
                            f"🚗 **Current Traffic Status**: {live_info}. " +
                            "This is real-time data from city sensors. " +
                            "Consider using EcoRouting for optimal routes.",
                            "live_data", 1.0
                        ))
                    elif "aqi" in clean_query.lower() or "air" in clean_query.lower() or "quality" in clean_query.lower():
                        responses.append((
                            f"🌬️ **Current Air Quality**: {live_info}. " +
                            "This is real-time data from environmental sensors. " +
                            "Check the dashboard for detailed PM2.5, PM10, and O3 levels.",
                            "live_data", 1.0
                        ))
                    else:
                        # Generic live data response
                        responses.append((f"📊 **Live City Data**: {live_info}.", "live_data", 1.0))
            except Exception as e:
                logger.debug(f"Live data parsing error: {e}")

        # Initialize text_lower for pattern matching
        text_lower = intent.raw_text.lower().strip()
        
        # PRIORITY: Check for actual questions first (skip conversational if query has real content)
        question_indicators = ["what", "how", "where", "when", "why", "tell", "show", "number", "service", "sos", "emergency", "help", "traffic", "air", "bus", "transport", "weather"]
        is_real_question = any(q in text_lower for q in question_indicators) and len(text_lower) > 10
        
        # BUS ROUTE HANDLER - Provide specific bus info with streets (CHECK FIRST before elif chain)
        bus_match = re.search(r'\b(\d{1,3})\s*(?:bus|автобус|маршрут)', text_lower) or re.search(r'(?:bus|автобус|маршрут)\s*(\d{1,3})', text_lower)
        has_bus_keyword = "bus" in text_lower or "автобус" in text_lower or "маршрут" in text_lower
        
        if bus_match or has_bus_keyword:
            # Bus route data with street info
            bus_routes = {
                "92": {"street": "Abay Avenue", "start": "Sairan", "end": "Medeu District", "type": "Electric 🔋", "popular": True},
                "32": {"street": "Tole Bi Street", "start": "Zhibek Zholy", "end": "Turksib District", "type": "Standard", "popular": True},
                "12": {"street": "Seifullin Avenue", "start": "Train Station 2", "end": "Almaly District", "type": "Electric 🔋", "popular": True},
                "121": {"street": "Zhandosov Street", "start": "Mega Center", "end": "Green Bazaar", "type": "Standard", "popular": True},
                "201": {"street": "Al-Farabi Avenue", "start": "Airport", "end": "Center", "type": "Express", "popular": False},
                "79": {"street": "Raiymbek Avenue", "start": "Airport", "end": "Sayakhat Station", "type": "Standard", "popular": True},
                "45": {"street": "Nauryzbay Batyr", "start": "Orbita", "end": "Zhibek Zholy", "type": "Standard", "popular": False},
                "18": {"street": "Dostyk Avenue", "start": "Almaly", "end": "Bostandyk", "type": "Standard", "popular": False},
                "63": {"street": "Zheltoksan Street", "start": "Train Station 1", "end": "Koktem", "type": "Standard", "popular": False},
                "37": {"street": "Kabanbay Batyr", "start": "Raiymbek", "end": "Taugul", "type": "Standard", "popular": False},
            }
            
            # Try to extract bus number
            bus_num = None
            if bus_match:
                bus_num = bus_match.group(1)
            else:
                # Try alternative extraction
                num_match = re.search(r'\b(\d{1,3})\b', text_lower)
                if num_match:
                    bus_num = num_match.group(1)
            
            if bus_num and bus_num in bus_routes:
                route = bus_routes[bus_num]
                response = f"🚌 **Bus #{bus_num}** ({route['type']})\n\n"
                response += f"📍 **Main Street:** {route['street']}\n"
                response += f"🚏 **Route:** {route['start']} → {route['end']}\n"
                response += f"⭐ **Popular route:** {'Yes' if route['popular'] else 'No'}\n\n"
                response += "Check the **Transport** page for real-time location!"
                responses.append((response, "transport", 1.0))
            elif bus_num:
                # Unknown bus number
                response = f"🚌 **Bus #{bus_num}** — I don't have specific data for this route.\n\n"
                response += "**Popular routes I know:**\n"
                response += "• **92** — Abay Avenue (Electric 🔋)\n"
                response += "• **32** — Tole Bi Street\n"
                response += "• **79** — Raiymbek Avenue (Airport)\n"
                response += "• **121** — Zhandosov Street\n\n"
                response += "Check the **Transport** page for live tracking!"
                responses.append((response, "transport", 1.0))
            else:
                # General bus inquiry
                response = "🚌 **Almaty Public Transport:**\n\n"
                response += "**Popular Bus Routes:**\n"
                response += "• **92** — Abay Avenue (Sairan → Medeu) 🔋\n"
                response += "• **32** — Tole Bi Street (Zhibek Zholy → Turksib)\n"
                response += "• **79** — Raiymbek Avenue (Airport → Sayakhat)\n"
                response += "• **121** — Zhandosov Street (Mega → Green Bazaar)\n"
                response += "• **12** — Seifullin Avenue (Electric) 🔋\n\n"
                response += "Ask about any specific bus number for details!"
                responses.append((response, "transport", 1.0))
        
        # Emergency/SOS handler - HIGHEST priority for safety
        elif any(sos in text_lower for sos in ["sos", "emergency", "emergency number", "101", "102", "103", "112"]):
            import random
            sos_responses = [
                "🚨 **Emergency Numbers in Almaty:**\n\n🔥 **101** — Fire Department\n👮 **102** — Police\n🚑 **103** — Ambulance\n⛽ **104** — Gas Emergency\n📞 **112** — Universal Emergency\n\nAll numbers are free and available 24/7.",
            ]
            responses.append((random.choice(sos_responses), "emergency", 1.0))
        
        # City services handler
        elif any(svc in text_lower for svc in ["city service", "services available", "what can", "what do you"]):
            import random
            services_responses = [
                "🏙️ **Smart City Almaty Services:**\n\n📊 **Dashboard** — Real-time city health metrics\n🚌 **Transport** — Live bus tracking, metro info\n🌫️ **Air Quality** — AQI, PM2.5 monitoring\n🚨 **Emergency** — SOS alerts, incident tracking\n🗺️ **Eco Routing** — Green route planning\n📝 **Reports** — File citizen reports\n🗳️ **Petitions** — Vote on city initiatives\n\nAsk about any of these!",
            ]
            responses.append((random.choice(services_responses), "city_info", 1.0))
        
        # Only match pure conversational patterns if NOT a real question
        elif not is_real_question:
            # Greeting responses - match only at start or as whole message
            greeting_patterns = ["hello", "hi", "hey", "howdy", "greetings", "good morning", "good afternoon", "good evening", "yo", "sup", "whats up", "what's up", "hiya", "heya"]
            greeting_responses = [
                "👋 Hey there! I'm Neural Nexus, your Almaty city assistant. What can I help you with today?",
                "Hello! Great to see you. I'm here to help with traffic, weather, transport, or anything about Almaty!",
                "Hi! Welcome to Smart City Almaty. Ask me anything about the city!",
            ]
            
            # How are you responses
            how_are_you_patterns = ["how are you", "how's it going", "how is it going", "how are you doing", "how have you been"]
            how_are_you_responses = [
                "I'm doing fantastic, thanks for asking! 🌟 All my systems are running smoothly. How about you?",
                "Running at peak efficiency! The city data is flowing beautifully. What can I do for you?",
            ]
            
            # Bye/Farewell responses
            bye_patterns = ["bye", "goodbye", "see you", "see ya", "later", "take care", "farewell"]
            bye_responses = [
                "Goodbye! Come back anytime you need help with Almaty! 👋",
                "See you later! Stay safe and enjoy the city!",
            ]
            
            # Thanks responses - must be EXACT or very short
            thanks_patterns = ["thank you", "thanks", "thx", "ty"]
            thanks_responses = [
                "You're welcome! Happy to help! 😊",
                "Anytime! That's what I'm here for.",
            ]
            
            # Only match if text starts with pattern or is very short (pure greeting)
            if len(text_lower) < 20:
                if any(text_lower.startswith(p) or text_lower == p for p in greeting_patterns):
                    import random
                    responses.append((random.choice(greeting_responses), "chat", 0.98))
                elif any(p in text_lower for p in how_are_you_patterns):
                    import random
                    responses.append((random.choice(how_are_you_responses), "chat", 0.98))
                elif any(text_lower.startswith(p) or text_lower == p for p in bye_patterns):
                    import random
                    responses.append((random.choice(bye_responses), "chat", 0.98))
                elif any(text_lower == p for p in thanks_patterns):  # Exact match only for thanks
                    import random
                    responses.append((random.choice(thanks_responses), "chat", 0.98))
        
        # 1. Try Urban Science (Environment/Transport precision)
        if HAS_SCIENCE:
            try:
                science = get_urban_science_engine()
                science_res = science.get_scientific_explanation(intent.raw_text, intent.language)
                if science_res:
                    responses.append((science_res, "science", 0.95))
            except Exception as e:
                logger.debug(f"Science engine error: {e}")

        # 1.5 Try Logic Engine (intelligence first)
        if HAS_LOGIC:
            try:
                logic = get_logic_engine()
                logic_res = logic.reason(intent.raw_text, intent.language)
                if logic_res:
                    responses.append((logic_res, "logic", 0.95))
            except Exception as e:
                logger.debug(f"Logic engine error: {e}")

        # 2. Try Culture Engine (Almaty depth)
        if HAS_CULTURE:
            try:
                culture = get_culture_engine()
                culture_res = culture.get_info(intent.raw_text, intent.language)
                if culture_res:
                    responses.append((culture_res, "culture", 0.9))
            except Exception as e:
                logger.debug(f"Culture engine error: {e}")

        # 2.5 Try Knowledge Graph (Semantic links)
        if HAS_GRAPH:
            try:
                graph = get_knowledge_graph()
                related_facts = graph.find_related(intent.raw_text, intent.language)
                if related_facts:
                    graph_response = "Кстати, еще связанные факты: " + "; ".join(related_facts[:3])
                    responses.append((graph_response, "graph", 0.85))
            except Exception as e:
                logger.debug(f"Knowledge Graph error: {e}")

        # 3. Try GPT-style pattern matching (classic)
        if HAS_GPT_KB and self.pattern_matcher:
            result = self.pattern_matcher.find_response(intent.raw_text, intent.language)
            if result:
                response, category, conf = result
                responses.append((response, "pattern", conf * 1.1))  # Slight boost
        
        # 4. Try NLP processor
        if HAS_NLP_ENGINE and self.nlp_processor and self._initialized:
            try:
                analysis = self.nlp_processor.process_query(
                    intent.raw_text, session_id, "en", intent.primary
                )
                if analysis["search_results"]:
                    best_text, score = analysis["search_results"][0]
                    if score > config.min_confidence:
                        responses.append((best_text, "nlp", score))
            except Exception as e:
                logger.debug(f"NLP processing error: {e}")
        
        # 5. Generate dynamic response
        if HAS_GPT_KB and self.response_generator:
            try:
                gen_response = self.response_generator.generate(
                    intent.raw_text, session_id, intent.language
                )
                if gen_response and len(gen_response) > 10:
                    responses.append((gen_response, "generated", 0.7))
            except Exception as e:
                logger.debug(f"Generation error: {e}")
        
        # 6. Try Ollama LLM as fallback OR as final synthesizer (RAG)
        if config.use_fallback_llm and HAS_LLM:
            try:
                llm = get_llm()
                if llm.is_enabled():
                    # Gather context from other sources
                    context_facts = [r[0] for r in responses if r[2] > 0.4]
                    context_str = "\n".join(context_facts)
                    
                    if context_str:
                        rag_prompt = f"Use these facts to answer the question: {context_str}\n\nQuestion: {intent.raw_text}"
                        llm_response = llm.ask(rag_prompt)
                    else:
                        llm_response = llm.ask(intent.raw_text)
                        
                    if llm_response and len(llm_response) > 10:
                        # If we have RAG context, this is high confidence
                        responses.append((llm_response, "llm_rag", 0.9 if context_str else 0.6))
            except Exception as e:
                logger.debug(f"LLM synthesis error: {e}")
        
        # Pick best response
        if responses:
            responses.sort(key=lambda x: x[2], reverse=True)
            best_text, source, confidence = responses[0]
        else:
            # Ultimate fallback
            best_text = "Interesting question! Try asking about transport, weather, or places to visit in Almaty."
            source = "fallback"
            confidence = 0.1
        
        # Apply personality adjustments
        best_text = self._apply_personality(best_text, intent, config)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return AIResponse(
            text=best_text,
            intent=intent.primary,
            confidence=confidence,
            source=source,
            language=intent.language,
            sentiment_adjustment=intent.sentiment,
            entities_found=list(intent.entities.keys()),
            processing_time_ms=processing_time
        )
    
    def _apply_personality(self, text: str, intent: UserIntent, 
                           config: GPTConfig) -> str:
        """Apply personality adjustments and personalization to response"""
        
        # --- PERSONALIZATION ---
        if "[USER_CONTEXT:" in intent.raw_text:
            try:
                context_part = intent.raw_text.split("[USER_CONTEXT:")[1].split("]")[0]
                name = None
                if "name:" in context_part.lower():
                    name_chunk = context_part.lower().split("name:")[1].split("|")[0].split(",")[0].strip()
                    name = name_chunk.capitalize()
                
                # 1. Apply Name to Greetings or generic responses
                if name and name not in text:
                    greetings = ["hello", "hi", "hey", "good morning", "good evening", "greetings"]
                    if any(g in text.lower() for g in greetings):
                        if "!" in text:
                            text = text.replace("!", f", {name}!", 1)
                        else:
                            text = f"{name}, {text}"
                
                # 2. Apply Interests to suggestions
                query_lower = intent.raw_text.lower()
                if "куд" in query_lower and ("схо" in query_lower or "пое" in query_lower or "пос" in query_lower):
                    if "hill" in context_part.lower() and "Medeu" not in text:
                        prefix = f"{name}, " if name else ""
                        text = f"{prefix}since you like mountains, you should visit Medeu or Shymbulak! " + text
            except Exception as e:
                logger.debug(f"Personalization failed: {e}")

        # --- EMOJI ---
        # Add emoji if enabled and not too many already
        if config.add_emoji and text.count('') < 3: 
            emoji_count = sum(1 for c in text if ord(c) > 127000)
            if emoji_count < 2:
                emoji_map = {"greeting": "👋", "farewell": "👋", "thanks": "😊", 
                             "weather_eco": "🌤️", "transport": "🚌", "emergency": "🚨", "city": "🏙️"}
                if intent.primary in emoji_map and emoji_map[intent.primary] not in text:
                    text = f"{emoji_map[intent.primary]} {text}"
        
        # Adjust for sentiment
        if intent.sentiment < -0.3:
            if not text.startswith("I understand"):
                text = random.choice(["I understand. ", "I'm sorry. ", ""]) + text
        
        return text


# ============================================
# MAIN GPT-STYLE AI
# ============================================

class EnhancedGPTStyleAI:
    """
    Main AI class that orchestrates all components
    for GPT-like conversation experience
    """
    
    def __init__(self, config: Optional[GPTConfig] = None):
        self.config = config or DEFAULT_CONFIG
        self.classifier = EnhancedIntentClassifier()
        self.synthesizer = ResponseSynthesizer()
        
        # Context management
        if HAS_NLP_ENGINE:
            self.context_manager = ConversationContextManager()
        else:
            self.context_manager = None
        
        # Session-based conversation history
        self.sessions: Dict[str, List[Dict]] = {}
        
        logger.info(f"Enhanced GPT-Style AI initialized. Components: NLP={HAS_NLP_ENGINE}, GPT_KB={HAS_GPT_KB}, LLM={HAS_LLM}")
    
    def chat(self, message: str, session_id: str = "default",
             context: Optional[Dict] = None, image_path: Optional[str] = None) -> str:
        """
        Main chat interface - process message and return response.
        Supports RAG (Live Data) and Vision analysis.
        """
        # 1. Handle Vision if image is provided
        if image_path and HAS_VISION:
            vision = get_vision_engine()
            vision_result = vision.analyze_image(image_path)
            if "error" not in vision_result:
                res = f"🔍 I've analyzed your photo. {vision_result.get('report_summary', 'Analysis complete.')} "
                res += f"Category: {vision_result.get('category', 'General')}. Priority: {vision_result.get('action_required', 'Normal')}. "
                res += "I have prepared a draft report for city services. Shall I send it?"
                
                # Save to history
                if session_id not in self.sessions: self.sessions[session_id] = []
                self.sessions[session_id].append({"role": "user", "content": f"[Image: {image_path}] {message}", "timestamp": datetime.now().isoformat()})
                self.sessions[session_id].append({"role": "assistant", "content": res, "source": "vision", "timestamp": datetime.now().isoformat()})
                return res

        # 1.5 Handle Long-term Memory recall and extraction
        memory_context = ""
        if HAS_MEMORY:
            memory = get_long_term_memory()
            memory.extract_preferences(session_id, message)
            memory_context = memory.get_user_context(session_id)

        # 2. Normalize input
        message = message.strip()
        if not message:
            return "I'm listening. What would you like to know?"
        
        # 3. RAG: Inject Live Context and Memory Context if available
        processed_message = message
        injection_parts = []
        
        if HAS_LIVE_DATA:
            live = get_live_engine()
            live_ctx = live.get_context(message)
            if live_ctx: injection_parts.append(f"ACTUAL_CITY_INFO: {live_ctx}")
            
        if memory_context:
            injection_parts.append(f"USER_CONTEXT: {memory_context}")
            
        if injection_parts:
            processed_message = f"{message}\n\n[" + " | ".join(injection_parts) + "]"

        # 4. Classify intent
        intent = self.classifier.classify(processed_message)
        
        # 5. Update context
        if self.context_manager:
            self.context_manager.update_context(
                session_id, "user", message, intent.language, intent.primary
            )
        
        # 6. Synthesize response
        response = self.synthesizer.synthesize(intent, session_id, self.config)
        
        # 7. Store in session history
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        
        self.sessions[session_id].append({
            "role": "user",
            "content": message,
            "intent": intent.primary,
            "timestamp": datetime.now().isoformat()
        })
        
        self.sessions[session_id].append({
            "role": "assistant",
            "content": response.text,
            "source": response.source,
            "timestamp": datetime.now().isoformat()
        })
        
        # Limit history
        if len(self.sessions[session_id]) > 40:
            self.sessions[session_id] = self.sessions[session_id][-40:]
        
        # Update context with response
        if self.context_manager:
            self.context_manager.update_context(
                session_id, "assistant", response.text, intent.language
            )
        
        # Log if debug mode
        if self.config.debug_mode:
            logger.info(f"[{session_id}] Intent: {intent.primary} ({intent.confidence:.2f}), "
                       f"Source: {response.source}, Time: {response.processing_time_ms:.1f}ms")
        
        return response.text
    
    def get_full_response(self, message: str, session_id: str = "default") -> AIResponse:
        """
        Get full response object with metadata
        """
        intent = self.classifier.classify(message)
        return self.synthesizer.synthesize(intent, session_id, self.config)
    
    def _detect_lang(self, text: str) -> str:
        """Quick language detection"""
        # Force English
        return "en"
    
    def get_history(self, session_id: str = "default") -> List[Dict]:
        """Get conversation history for session"""
        return self.sessions.get(session_id, [])
    
    def clear_history(self, session_id: str = "default"):
        """Clear conversation history"""
        if session_id in self.sessions:
            self.sessions[session_id] = []
        
        if self.context_manager:
            self.context_manager.clear_context(session_id)
    
    def get_context_summary(self, session_id: str = "default") -> Dict:
        """Get conversation context summary"""
        if self.context_manager:
            ctx = self.context_manager.get_context(session_id)
            return {
                "turn_count": ctx.turn_count,
                "topics": ctx.topics,
                "last_intent": ctx.last_intent,
                "avg_sentiment": self.context_manager.get_average_sentiment(session_id)
            }
        return {}


# ============================================
# SINGLETON AND FACTORY
# ============================================

_enhanced_ai: Optional[EnhancedGPTStyleAI] = None

def get_enhanced_ai(config: Optional[GPTConfig] = None) -> EnhancedGPTStyleAI:
    """Get or create enhanced AI singleton"""
    global _enhanced_ai
    if _enhanced_ai is None:
        _enhanced_ai = EnhancedGPTStyleAI(config)
    return _enhanced_ai

def create_ai(config: Optional[GPTConfig] = None) -> EnhancedGPTStyleAI:
    """Create new AI instance (not singleton)"""
    return EnhancedGPTStyleAI(config)


# ============================================
# CONVENIENCE FUNCTIONS
# ============================================

def quick_chat(message: str, session_id: str = "default") -> str:
    """Quick chat function for one-off messages"""
    ai = get_enhanced_ai()
    return ai.chat(message, session_id)

def analyze_message(message: str) -> Dict[str, Any]:
    """Analyze message and return detailed info"""
    ai = get_enhanced_ai()
    classifier = ai.classifier
    
    intent = classifier.classify(message)
    
    return {
        "text": message,
        "intent": intent.primary,
        "confidence": intent.confidence,
        "language": intent.language,
        "sentiment": intent.sentiment,
        "is_question": intent.is_question,
        "entities": intent.entities
    }


# ============================================
# TEST FUNCTION
# ============================================

def test_enhanced_ai():
    """Test the enhanced AI with sample conversations"""
    ai = get_enhanced_ai(GPTConfig(debug_mode=True))
    
    test_messages = [
        "Привет!",
        "Как дела?",
        "Кто ты такой?",
        "Расскажи о метро Алматы",
        "Какая сегодня погода?",
        "В чём смысл жизни?",
        "Дай совет как быть счастливым",
        "Нужна скорая помощь!",
        "Спасибо за помощь!",
        "Пока!",
    ]
    
    print("=" * 60)
    print("Testing Enhanced GPT-Style AI")
    print("=" * 60 + "\n")
    
    for msg in test_messages:
        response = ai.chat(msg)
        print(f"User: {msg}")
        print(f"AI: {response}")
        print("-" * 40)
    
    print("\nContext Summary:", ai.get_context_summary())


if __name__ == "__main__":
    test_enhanced_ai()
