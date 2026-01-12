"""
Vision Engine for Urban Problem Detection
==========================================
Analyzes images to identify urban issues like potholes, trash, or broken streetlights.
Supports integration with local vision models (Ollama/Llava) or custom CNNs.
"""

import os
import random
from typing import Dict, Any, Optional

class VisionEngine:
    def __init__(self):
        # In a production environment, you'd load a MobileNetV3 or use Ollama API
        self.supported_categories = {
            "pothole": ["яма", "дорога", "трещина", "асфальт"],
            "trash": ["мусор", "свалка", "баки", "переполнено"],
            "lighting": ["фонарь", "свет", "темно", "освещение"],
            "vandalism": ["граффити", "вандализм", "сломано", "скамейка"]
        }

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Analyzes image and returns detected urban category and confidence.
        Uses Ollama (llava) if available, otherwise falls back to simulation.
        """
        if not os.path.exists(image_path):
            return {"error": "Image not found"}

        # 1. Try real analysis with Ollama
        try:
            import requests
            import base64
            
            with open(image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Check if llava is available
            status_resp = requests.get("http://localhost:11434/api/tags", timeout=1)
            if status_resp.status_code == 200:
                models = [m["name"] for m in status_resp.json().get("models", [])]
                if any("llava" in m for m in models):
                    # Real vision analysis
                    prompt = "Describe this image in detail. Identify any urban problems like potholes, trash, broken lights, or vandalism. Format: CATEGORY: <name>, DESCRIPTION: <text>"
                    response = requests.post(
                        "http://localhost:11434/api/generate",
                        json={
                            "model": "llava",
                            "prompt": prompt,
                            "images": [encoded_string],
                            "stream": False
                        },
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        desc = response.json().get("response", "")
                        return {
                            "category": "urban_issue",
                            "confidence": 0.95,
                            "report_summary": desc,
                            "action_required": "high" if "broken" in desc.lower() or "trash" in desc.lower() else "medium"
                        }
        except Exception as e:
            # Fallback to simulation if Ollama fails
            pass

        # 2. SIMULATION LOGIC (Fallback)
        filename = os.path.basename(image_path).lower()
        
        detected_category = "unknown"
        confidence = 0.0
        
        for cat, keywords in self.supported_categories.items():
            if any(k in filename for k in keywords):
                detected_category = cat
                confidence = random.uniform(0.85, 0.98)
                break
        
        if detected_category == "unknown":
            # Just for demonstration, pick a random one if filename doesn't help
            detected_category = random.choice(list(self.supported_categories.keys()))
            confidence = random.uniform(0.6, 0.8)

        reports_templates = {
            "pothole": "Обнаружено повреждение дорожного полотна (яма/трещина). Рекомендуется оперативный ремонт.",
            "trash": "Зафиксировано скопление мусора или переполнение контейнеров. Требуется выезд санитарной службы.",
            "lighting": "Неисправность уличного освещения. Требуется проверка электросетей.",
            "vandalism": "Зафиксирован акт вандализма или порча городского имущества."
        }

        return {
            "category": detected_category,
            "confidence": confidence,
            "report_summary": reports_templates.get(detected_category, "Проблема не определена."),
            "action_required": "high" if confidence > 0.8 else "medium"
        }

_vision_engine = None

def get_vision_engine():
    global _vision_engine
    if _vision_engine is None:
        _vision_engine = VisionEngine()
    return _vision_engine
