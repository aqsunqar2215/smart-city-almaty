"""
Urban & Environmental Science Engine
====================================
Specialized module for Almaty's atmospheric physics, climate, and transport science.
Provides high-precision technical answers.
"""

import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class UrbanScienceEngine:
    def __init__(self):
        self.knowledge = {
            "atmosphere": {
                "smog_mechanics": "Smog in Almaty is caused by temperature inversion: a layer of warm air traps cold polluted air near the surface, preventing vertical mixing.",
                "pm25_impact": "PM2.5 particles (less than 2.5 microns) are dangerous as they penetrate deep into the lungs and blood. In Almaty, the main sources are heating plants and transport.",
                "chemical_composition": "Almaty smog is high in nitrogen dioxide (NO2), particulate matter, and benz(a)pyrene."
            },
            "climate": {
                "mountain_breeze": "Mountain-valley circulation: during the day air rises to the mountains, at night cool air from the mountains (foehn) descends, ventilating the city.",
                "Tuyuksu": "The Tuyuksu glacier is a key indicator of climate change. It has shrunk significantly over 50 years, impacting Almaty's water security.",
                "precipitation": "Almaty has a sharp continental climate with maximum rainfall in spring (April-May)."
            },
            "transport_science": {
                "flow_density": "Traffic flow dynamics: critical flow density leads to 'phantom traffic jams' even without accidents.",
                "emission_factor": "CO2 emissions: a petrol car emits 120-150g/km on average, while one electric bus saves up to 60 tons of CO2 per year.",
                "modal_shift": "Switching to public transport and bikes reduces noise by 3-5 decibels and improves road capacity by up to 40%."
            }
        }

    def get_scientific_explanation(self, query: str, lang: str = "en") -> Optional[str]:
        query_lower = query.lower()
        
        # Keyword mapping to scientific topics (English only)
        mapping = {
            "smog": ("atmosphere", "smog_mechanics"),
            "inversion": ("atmosphere", "smog_mechanics"),
            "pm2.5": ("atmosphere", "pm25_impact"),
            "pm25": ("atmosphere", "pm25_impact"),
            "air": ("atmosphere", "chemical_composition"),
            "wind": ("climate", "mountain_breeze"),
            "ventilation": ("climate", "mountain_breeze"),
            "glacier": ("climate", "Tuyuksu"),
            "climate": ("climate", "precipitation"),
            "jam": ("transport_science", "flow_density"),
            "traffic": ("transport_science", "flow_density"),
            "flow": ("transport_science", "flow_density"),
            "emission": ("transport_science", "emission_factor"),
            "ecology": ("transport_science", "modal_shift")
        }

        for kw, (cat, key) in mapping.items():
            if kw in query_lower:
                explanation = self.knowledge[cat][key]
                return "🔬 Scientific fact: " + explanation

        return None

_science_engine = None

def get_urban_science_engine():
    global _science_engine
    if _science_engine is None:
        _science_engine = UrbanScienceEngine()
    return _science_engine
