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

# LLM and internet fallback are intentionally disabled in V4.1 runtime.
HAS_LLM = False
HAS_WEB_SEARCH = False

def get_llm():
    raise RuntimeError("LLM runtime is disabled in V4.1")

def get_internet_engine():
    raise RuntimeError("Internet fallback is disabled in V4.1")

try:
    from neural_engine import NeuralClassifierV2
    HAS_NEURAL_BRAIN = True
except ImportError:
    HAS_NEURAL_BRAIN = False

try:
    from intent_router_v3 import get_intent_router
    HAS_INTENT_ROUTER = True
except ImportError:
    HAS_INTENT_ROUTER = False

try:
    from dialogue_state import DialogueStateManager
    HAS_DIALOGUE_STATE = True
except ImportError:
    HAS_DIALOGUE_STATE = False

try:
    from local_retriever import get_local_retriever
    HAS_LOCAL_RETRIEVER = True
except ImportError:
    HAS_LOCAL_RETRIEVER = False

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
    use_fallback_llm: bool = False  # V4.1: runtime LLM disabled
    enable_web_fallback: bool = False  # V4.1: web fallback disabled
    web_search_min_confidence: float = 0.45
    max_web_sources: int = 3
    
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
    source: str  # "pattern", "nlp", "llm_rag", "web_search", "fallback"
    language: str
    sources: List[str] = field(default_factory=list)
    sentiment_adjustment: float = 0.0
    entities_found: List[str] = field(default_factory=list)
    processing_time_ms: float = 0.0
    routing_reason: str = ""
    debug_trace_id: str = ""

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
        self.intent_router = get_intent_router() if HAS_INTENT_ROUTER else None
    
    def classify(self, text: str) -> UserIntent:
        """Classify user input into intent with confidence"""
        lang = "en"
        text_lower = text.lower().strip()
        is_question = text.endswith("?") or any(
            text_lower.startswith(w) for w in ["how", "what", "where", "when", "why"]
        )
        is_command = text.endswith("!")

        # 0) Primary local intent router (SVC + calibration)
        if self.intent_router:
            try:
                pred = self.intent_router.predict(text)
                if pred.intent != "unknown":
                    return UserIntent(
                        primary=pred.intent,
                        secondary=pred.top2[1][0] if len(pred.top2) > 1 else None,
                        confidence=pred.confidence,
                        entities={},
                        language=lang,
                        sentiment=0.0,
                        is_question=is_question,
                        is_command=is_command,
                        raw_text=text,
                    )
            except Exception as e:
                logger.debug(f"Intent router failed: {e}")

        # 1. Try Neural Brain first (LSTM V2)
        if self.neural_brain:
            try:
                intent_tag, confidence = self.neural_brain.predict(text)
                if confidence > 0.6:
                    return UserIntent(
                        primary=intent_tag.lower(),
                        confidence=confidence,
                        language=lang,
                        is_question=is_question,
                        is_command=is_command,
                        raw_text=text
                    )
            except Exception as e:
                logger.debug(f"Neural brain failed: {e}")

        # 2. Fallback to Regex and NLP
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
        self.internet_engine = None
        self.local_retriever = get_local_retriever() if HAS_LOCAL_RETRIEVER else None
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
        V4.1 local-only synthesis pipeline.
        """
        if not self._initialized:
            self.initialize()
        return self._synthesize_v3(intent, session_id, config)

    def _synthesize_v3(
        self, intent: UserIntent, session_id: str, config: GPTConfig
    ) -> AIResponse:
        start_time = datetime.now()
        raw_query = re.sub(r"\[[^\]]+\]", " ", intent.raw_text or "").strip()
        raw_query = re.sub(r"\s+", " ", raw_query).strip()
        query_lower = raw_query.lower()

        live_data_match = re.search(r"\[LIVE_DATA:\s*([^\]]+)\]", intent.raw_text or "")
        if live_data_match:
            live_info = live_data_match.group(1).strip()
            txt = f"Current city data: {live_info}."
            if "traffic" in query_lower or "congestion" in query_lower:
                txt = f"Current traffic data: {live_info}. Consider route alternatives if congestion is high."
            elif "aqi" in query_lower or "air" in query_lower or "pollution" in query_lower:
                txt = f"Current air quality data: {live_info}. Sensitive groups should limit long outdoor exposure."
            return AIResponse(
                text=self._apply_personality(txt, intent, config),
                intent=intent.primary,
                confidence=1.0,
                source="live_data",
                language=intent.language,
                sources=[],
                sentiment_adjustment=intent.sentiment,
                entities_found=list(intent.entities.keys()),
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                routing_reason="live_data_priority",
                debug_trace_id=f"{session_id}:{int(start_time.timestamp()*1000)}",
            )

        if self.local_retriever and raw_query:
            context_topic = ""
            if intent.primary == "transport":
                context_topic = "transport"
            elif intent.primary == "weather_eco":
                context_topic = "weather"
            elif intent.primary == "city":
                context_topic = "city"
            elif intent.primary == "emergency":
                context_topic = "emergency"

            candidates = self.local_retriever.retrieve(raw_query, context_topic=context_topic, top_k=3)
            if candidates:
                top = candidates[0]
                confidence = min(0.98, max(0.35, top.score))
                return AIResponse(
                    text=self._apply_personality(top.text, intent, config),
                    intent=intent.primary,
                    confidence=confidence,
                    source="retrieval_factual",
                    language=intent.language,
                    sources=[c.source for c in candidates],
                    sentiment_adjustment=intent.sentiment,
                    entities_found=list(intent.entities.keys()),
                    processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                    routing_reason="retriever_top1",
                    debug_trace_id=f"{session_id}:{int(start_time.timestamp()*1000)}",
                )

        template = self._domain_template(intent.primary)
        if template:
            return AIResponse(
                text=self._apply_personality(template, intent, config),
                intent=intent.primary,
                confidence=0.62,
                source="domain_template",
                language=intent.language,
                sources=[],
                sentiment_adjustment=intent.sentiment,
                entities_found=list(intent.entities.keys()),
                processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
                routing_reason="template_fallback",
                debug_trace_id=f"{session_id}:{int(start_time.timestamp()*1000)}",
            )

        clarification = (
            "I need a bit more detail to answer precisely. "
            "Please specify if your question is about transport, air quality, weather, emergency, or city info."
        )
        return AIResponse(
            text=clarification,
            intent=intent.primary,
            confidence=0.25,
            source="controlled_fallback",
            language=intent.language,
            sources=[],
            sentiment_adjustment=intent.sentiment,
            entities_found=list(intent.entities.keys()),
            processing_time_ms=(datetime.now() - start_time).total_seconds() * 1000,
            routing_reason="low_confidence_clarification",
            debug_trace_id=f"{session_id}:{int(start_time.timestamp()*1000)}",
        )

    def _domain_template(self, intent_name: str) -> str:
        templates = {
            "greeting": "Hello! I can help with transport, weather, air quality, emergency contacts, and city information.",
            "thanks": "You're welcome. Ask anytime if you need city assistance.",
            "farewell": "Goodbye. Stay safe and have a good day in Almaty.",
            "help": "I can answer questions about transport, air quality, weather, emergency numbers, and city services.",
            "emergency": "Emergency numbers in Almaty: 101 Fire, 102 Police, 103 Ambulance, 104 Gas, 112 Universal.",
            "transport": "For transport requests, share route number, origin, and destination to get a precise answer.",
            "weather_eco": "For air and weather, ask AQI, PM2.5, temperature, humidity, or forecast by area.",
            "city": "You can ask about districts, landmarks, services, and infrastructure in Almaty.",
        }
        return templates.get(intent_name, "")

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
        self.dialogue_state = DialogueStateManager(ttl_minutes=30) if HAS_DIALOGUE_STATE else None
        
        # Context management
        if HAS_NLP_ENGINE:
            self.context_manager = ConversationContextManager()
        else:
            self.context_manager = None
        
        # Session-based conversation history
        self.sessions: Dict[str, List[Dict]] = {}
        self._last_response_cache: Dict[Tuple[str, str], AIResponse] = {}
        
        logger.info(
            f"Enhanced GPT-Style AI initialized. Components: "
            f"NLP={HAS_NLP_ENGINE}, GPT_KB={HAS_GPT_KB}, LLM={HAS_LLM}, WEB={HAS_WEB_SEARCH}"
        )
    
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

        if self.dialogue_state:
            self.dialogue_state.observe_user_turn(session_id, message)
        
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
        if self.dialogue_state and HAS_INTENT_ROUTER:
            try:
                router = get_intent_router()
                base_pred = router.predict(processed_message)
                adjusted = self.dialogue_state.contextualize_prediction(session_id, message, base_pred)
                should_override = adjusted.intent != intent.primary and (
                    adjusted.routing_reason == "followup_context_boost"
                    or adjusted.confidence >= intent.confidence
                )
                if should_override:
                    intent.primary = adjusted.intent
                    intent.secondary = adjusted.top2[1][0] if len(adjusted.top2) > 1 else intent.secondary
                    intent.confidence = adjusted.confidence
                    intent.entities["routing_reason"] = adjusted.routing_reason
            except Exception as e:
                logger.debug(f"Dialogue state contextualization failed: {e}")
        
        # 5. Update context
        if self.context_manager:
            self.context_manager.update_context(
                session_id, "user", message, intent.language, intent.primary
            )
        
        # 6. Synthesize response
        response = self.synthesizer.synthesize(intent, session_id, self.config)
        cache_key = (session_id, message)
        self._last_response_cache[cache_key] = response
        if len(self._last_response_cache) > 120:
            self._last_response_cache.pop(next(iter(self._last_response_cache)))
        
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

        if self.dialogue_state:
            self.dialogue_state.update_intent(session_id, intent.primary)
            self.dialogue_state.observe_assistant_turn(session_id, response.text)
        
        # Log if debug mode
        if self.config.debug_mode:
            logger.info(f"[{session_id}] Intent: {intent.primary} ({intent.confidence:.2f}), "
                       f"Source: {response.source}, Time: {response.processing_time_ms:.1f}ms")
        
        return response.text
    
    def get_full_response(self, message: str, session_id: str = "default") -> AIResponse:
        """
        Get full response object with metadata
        """
        cache_key = (session_id, message)
        cached_response = self._last_response_cache.get(cache_key)
        if cached_response is not None:
            return cached_response

        # Run through main chat pipeline to keep intent routing and dialogue state consistent.
        self.chat(message, session_id=session_id)
        cached_response = self._last_response_cache.get(cache_key)
        if cached_response is not None:
            return cached_response

        # Defensive fallback if cache was not populated for any reason.
        intent = self.classifier.classify(message)
        response = self.synthesizer.synthesize(intent, session_id, self.config)
        self._last_response_cache[cache_key] = response
        if len(self._last_response_cache) > 120:
            self._last_response_cache.pop(next(iter(self._last_response_cache)))
        return response
    
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
