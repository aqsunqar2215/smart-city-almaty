"""
Smart City Almaty — Local LLM Integration Engine
Integrates with Ollama for local LLM inference.
Supports: Phi-3, Llama 3.2, Gemma 2, Qwen 2.5
"""

import requests
import json
import logging
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
import time

logger = logging.getLogger(__name__)

# ============================================
# CONFIGURATION
# ============================================

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "phi3:mini"  # Best for English, fast and smart

# System prompts for different contexts - optimized for concise responses
SYSTEM_PROMPTS = {
    "default": """You are Neural Nexus, the AI assistant for Smart City Almaty.
You help citizens with information about transport, weather, air quality, emergency services, and city landmarks.

IMPORTANT RULES:
- Be CONCISE. Maximum 2-3 sentences for simple questions.
- Be DIRECT. Answer the question immediately, no preambles.
- Use emojis sparingly (max 1-2 per response).
- If you don't know something, say so briefly.
- Provide actionable information when possible.""",

    "emergency": """You are Neural Nexus handling an EMERGENCY query.
Provide IMMEDIATE, CLEAR instructions. Be direct and calm.
Emergency numbers in Almaty: 101 (Fire), 102 (Police), 103 (Ambulance), 104 (Gas), 112 (Universal).
Keep response under 50 words.""",

    "transport": """You are Neural Nexus, the transport assistant for Almaty.
Metro: 11 stations, operates 06:20-00:00. Main buses: 12, 32, 63, 79, 92.
Taxi: Yandex Go, inDriver. Payment: Onay card.
Be concise - max 2-3 sentences.""",

    "ecology": """You are Neural Nexus, the environmental assistant for Almaty.
Provide brief AQI info and health recommendations.
Keep response under 3 sentences."""
}

# ============================================
# DATA CLASSES
# ============================================

@dataclass
class LLMResponse:
    """Response from the LLM"""
    text: str
    model: str
    tokens_used: int
    latency_ms: float
    success: bool
    error: Optional[str] = None


@dataclass  
class ConversationMessage:
    """A single message in a conversation"""
    role: str  # "system", "user", "assistant"
    content: str


# ============================================
# LLM ENGINE CLASS
# ============================================

class LocalLLMEngine:
    """
    Local LLM Engine using Ollama
    Provides chat completions with context management
    """
    
    def __init__(self, model: str = DEFAULT_MODEL, base_url: str = OLLAMA_BASE_URL):
        self.model = model
        self.base_url = base_url
        self.conversation_history: List[ConversationMessage] = []
        self.max_history = 10  # Keep last 10 messages for context
        self._is_available = None
        
    def is_available(self) -> bool:
        """Check if Ollama is running and model is available"""
        if self._is_available is not None:
            return self._is_available
            
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=2)
            if response.status_code == 200:
                models = response.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                self._is_available = any(self.model in name for name in model_names)
                if not self._is_available:
                    logger.warning(f"Model {self.model} not found. Available: {model_names}")
            else:
                self._is_available = False
        except requests.exceptions.RequestException:
            self._is_available = False
            logger.warning("Ollama is not running. LLM features disabled.")
            
        return self._is_available
    
    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
    
    def _build_prompt(self, user_message: str, context_type: str = "default") -> str:
        """Build a prompt with system context and conversation history"""
        system_prompt = SYSTEM_PROMPTS.get(context_type, SYSTEM_PROMPTS["default"])
        
        # Build conversation context
        history_text = ""
        for msg in self.conversation_history[-self.max_history:]:
            if msg.role == "user":
                history_text += f"User: {msg.content}\n"
            elif msg.role == "assistant":
                history_text += f"Assistant: {msg.content}\n"
        
        full_prompt = f"""{system_prompt}

{history_text}User: {user_message}
Assistant:"""
        
        return full_prompt
    
    def generate(
        self, 
        prompt: str, 
        context_type: str = "default",
        max_tokens: int = 512,
        temperature: float = 0.7,
        stream: bool = False
    ) -> LLMResponse:
        """
        Generate a response from the LLM
        
        Args:
            prompt: User's message
            context_type: Type of context (default, emergency, transport, ecology)
            max_tokens: Maximum tokens to generate
            temperature: Creativity (0.0-1.0)
            stream: Whether to stream the response
            
        Returns:
            LLMResponse with the generated text
        """
        if not self.is_available():
            return LLMResponse(
                text="",
                model=self.model,
                tokens_used=0,
                latency_ms=0,
                success=False,
                error="LLM not available. Please start Ollama with: ollama serve"
            )
        
        start_time = time.time()
        
        try:
            full_prompt = self._build_prompt(prompt, context_type)
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": stream,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature,
                        "top_p": 0.9,
                        "stop": ["User:", "\nUser:"]
                    }
                },
                timeout=60
            )
            
            latency = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                generated_text = data.get("response", "").strip()
                
                # Add to conversation history
                self.conversation_history.append(ConversationMessage("user", prompt))
                self.conversation_history.append(ConversationMessage("assistant", generated_text))
                
                # Trim history if too long
                if len(self.conversation_history) > self.max_history * 2:
                    self.conversation_history = self.conversation_history[-self.max_history * 2:]
                
                return LLMResponse(
                    text=generated_text,
                    model=self.model,
                    tokens_used=data.get("eval_count", 0),
                    latency_ms=latency,
                    success=True
                )
            else:
                return LLMResponse(
                    text="",
                    model=self.model,
                    tokens_used=0,
                    latency_ms=latency,
                    success=False,
                    error=f"API error: {response.status_code}"
                )
                
        except requests.exceptions.Timeout:
            return LLMResponse(
                text="",
                model=self.model,
                tokens_used=0,
                latency_ms=(time.time() - start_time) * 1000,
                success=False,
                error="Request timed out. The model might be loading."
            )
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return LLMResponse(
                text="",
                model=self.model,
                tokens_used=0,
                latency_ms=(time.time() - start_time) * 1000,
                success=False,
                error=str(e)
            )
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 512,
        temperature: float = 0.7
    ) -> LLMResponse:
        """
        Chat completion with message history
        
        Args:
            messages: List of {"role": "user"|"assistant"|"system", "content": "..."}
            
        Returns:
            LLMResponse
        """
        if not self.is_available():
            return LLMResponse(
                text="",
                model=self.model,
                tokens_used=0,
                latency_ms=0,
                success=False,
                error="LLM not available"
            )
        
        start_time = time.time()
        
        try:
            response = requests.post(
                f"{self.base_url}/api/chat",
                json={
                    "model": self.model,
                    "messages": messages,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": temperature
                    }
                },
                timeout=60
            )
            
            latency = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                data = response.json()
                message = data.get("message", {})
                generated_text = message.get("content", "").strip()
                
                return LLMResponse(
                    text=generated_text,
                    model=self.model,
                    tokens_used=data.get("eval_count", 0),
                    latency_ms=latency,
                    success=True
                )
            else:
                return LLMResponse(
                    text="",
                    model=self.model,
                    tokens_used=0,
                    latency_ms=latency,
                    success=False,
                    error=f"Chat API error: {response.status_code}"
                )
                
        except Exception as e:
            logger.error(f"Chat error: {e}")
            return LLMResponse(
                text="",
                model=self.model,
                tokens_used=0,
                latency_ms=(time.time() - start_time) * 1000,
                success=False,
                error=str(e)
            )


# ============================================
# SMART ALMATY SPECIFIC FUNCTIONS
# ============================================

class SmartAlmatyLLM:
    """
    High-level LLM interface for Smart City Almaty
    Wraps LocalLLMEngine with domain-specific logic
    """
    
    def __init__(self):
        self.engine = LocalLLMEngine()
        self.fallback_responses = {
            "transport": "For transport info in Almaty: Metro runs 06:20-00:00, buses use Onay card, taxis via Yandex Go/inDriver.",
            "emergency": "Emergency numbers: 101 (Fire), 102 (Police), 103 (Ambulance), 112 (Universal)",
            "weather": "Almaty weather varies by season. Check local forecasts for current conditions.",
            "default": "I'm your Smart Almaty assistant. I can help with transport, weather, air quality, and city services."
        }
    
    def is_enabled(self) -> bool:
        """Check if LLM is available"""
        return self.engine.is_available()
    
    def ask(
        self, 
        question: str, 
        context: Optional[Dict[str, Any]] = None,
        context_type: str = "default"
    ) -> str:
        """
        Ask the LLM a question with optional context
        
        Args:
            question: User's question
            context: Additional context (weather, air quality, etc.)
            context_type: Type of query for system prompt selection
            
        Returns:
            Generated response string
        """
        # Enrich prompt with real-time context if available
        enriched_prompt = question
        
        if context:
            context_parts = []
            
            if "weather" in context:
                w = context["weather"]
                context_parts.append(
                    f"Current weather: {w.get('temperature', 'N/A')}°C, {w.get('description', 'N/A')}"
                )
            
            if "air" in context:
                a = context["air"]
                context_parts.append(
                    f"Air quality: AQI {a.get('aqi', 'N/A')}, PM2.5: {a.get('pm25', 'N/A')}"
                )
            
            if context_parts:
                enriched_prompt = f"[Context: {'; '.join(context_parts)}]\n\n{question}"
        
        # Try LLM first - reduced tokens for concise responses
        response = self.engine.generate(
            enriched_prompt,
            context_type=context_type,
            max_tokens=200,  # Reduced from 400 for brevity
            temperature=0.5   # Lower for more focused responses
        )
        
        if response.success and response.text:
            return response.text
        
        # Fallback to predefined response
        return self.fallback_responses.get(context_type, self.fallback_responses["default"])
    
    def enhance_response(self, base_response: str, topic: str) -> str:
        """
        Use LLM to enhance a rule-based response
        
        Args:
            base_response: The original response from rule-based system
            topic: Topic for context
            
        Returns:
            Enhanced response
        """
        if not self.is_enabled():
            return base_response
        
        prompt = f"""Improve this response to be more helpful and natural, but keep the core facts:

Original: {base_response}

Make it conversational and add a helpful tip if relevant. Keep it under 100 words."""
        
        response = self.engine.generate(
            prompt,
            context_type="default",
            max_tokens=150,
            temperature=0.8
        )
        
        if response.success and response.text:
            return response.text
        
        return base_response
    
    def generate_city_fact(self) -> str:
        """Generate an interesting fact about Almaty"""
        if not self.is_enabled():
            return "Did you know? Almaty is the birthplace of the wild apple. The city's name means 'Father of Apples'!"
        
        prompt = "Share one interesting, lesser-known fact about Almaty, Kazakhstan. Be concise (1-2 sentences)."
        
        response = self.engine.generate(
            prompt,
            context_type="default",
            max_tokens=100,
            temperature=0.9
        )
        
        if response.success and response.text:
            return response.text
        
        return "Almaty is surrounded by the Trans-Ili Alatau mountains, with peaks reaching over 4,000 meters!"


# ============================================
# UTILITY FUNCTIONS
# ============================================

def check_ollama_status() -> Dict[str, Any]:
    """Check Ollama server status and available models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            models = [m.get("name") for m in data.get("models", [])]
            return {
                "status": "running",
                "models": models,
                "default_model": DEFAULT_MODEL,
                "default_available": any(DEFAULT_MODEL in m for m in models)
            }
    except:
        pass
    
    return {
        "status": "stopped",
        "models": [],
        "default_model": DEFAULT_MODEL,
        "default_available": False,
        "instructions": "Start Ollama with: ollama serve && ollama pull phi3:mini"
    }


def pull_model(model_name: str = DEFAULT_MODEL) -> bool:
    """Pull a model from Ollama"""
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/pull",
            json={"name": model_name},
            stream=True,
            timeout=300
        )
        return response.status_code == 200
    except:
        return False


# ============================================
# SINGLETON INSTANCE
# ============================================

_llm_instance: Optional[SmartAlmatyLLM] = None

def get_llm() -> SmartAlmatyLLM:
    """Get or create the singleton LLM instance"""
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = SmartAlmatyLLM()
    return _llm_instance


# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    print("🔍 Checking Ollama status...")
    status = check_ollama_status()
    print(f"Status: {status}")
    
    if status["status"] == "running":
        print("\n🤖 Testing LLM...")
        llm = get_llm()
        
        if llm.is_enabled():
            response = llm.ask("What are the main tourist attractions in Almaty?")
            print(f"\nResponse: {response}")
        else:
            print(f"\n⚠️ Model {DEFAULT_MODEL} not available. Run: ollama pull phi3:mini")
    else:
        print("\n⚠️ Ollama is not running. Start with: ollama serve")
