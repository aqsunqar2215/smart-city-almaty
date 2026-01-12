"""
Almaty Culture and History Knowledge Engine
===========================================
Deep knowledge about Almaty's cultural heritage, history, 
architecture, and famous personalities.

Features:
- Historical timeline of Almaty
- Architectural landmarks catalog
- Famous Almaty citizens and artists
- Local vocabulary and urban legends
- Cultural event types
"""

from typing import List, Dict, Any, Optional, Tuple
import random

# ============================================
# CULTURAL DATABASE
# ============================================

ALMATY_CULTURE_DB = {
    "history": {
        "ru": [
            "Алматы стоял на Великом Шелковом пути. В районе города находилось поселение Алмату.",
            "В 1854 году было заложено укрепление Верное, которое позже стало городом Верный.",
            "В 1921 году город получил свое историческое название — Алма-Ата.",
            "В 1929-1997 годах Алма-Ата была столицей Казахской ССР, а затем независимого Казахстана.",
            "В 2016 году Алматы официально отметил свое 1000-летие.",
        ],
        "en": [
            "Almaty was situated on the Great Silk Road. The settlement of Almatu existed here.",
            "In 1854, the Vernoye fortification was founded, which later became the city of Verniy.",
            "In 1921, the city received its historical name — Alma-Ata.",
            "From 1929 to 1997, Almaty was the capital of Kazakhstan.",
        ]
    },
    "architecture": {
        "ru": [
            "Вознесенский кафедральный собор — уникальное деревянное здание, построенное без единого железного гвоздя инженером Зенковым.",
            "Гостиница 'Казахстан' — символ города, первый 25-этажный небоскреб в сейсмоопасной зоне, построенный в 1977 году.",
            "Здание Академии наук (бывшее здание Госплана) — шедевр неоклассицизма в центре города.",
            "Дворец Республики — монументальное здание на проспекте Достык, главный зал страны.",
            "Театр оперы и балета им. Абая — красивейшее здание в стиле сталинского ампира с элементами казахского орнамента.",
        ]
    },
    "personalities": {
        "ru": [
            "Каныш Сатпаев — выдающийся ученый-геолог, первый президент Академии наук Казахстана.",
            "Шокан Уалиханов — великий просветитель, ученый и путешественник, живший и работавший в Алматы.",
            "Абильхан Кастеев — основоположник казахского изобразительного искусства, в честь него назван музей искусств.",
            "Мухтар Ауэзов — классик казахской литературы, автор эпопеи 'Путь Абая'.",
            "Дина Нурпеисова — легендарная исполнительница на домбре, композитор.",
        ]
    },
    "urban_legends": {
        "ru": [
            "Говорят, что под Алматы существует целая сеть секретных подземных ходов, соединяющих главные здания правительства.",
            "Легенда гласит, что верхушка гостиницы 'Казахстан' была спроектирована так, чтобы напоминать корону или корону сакского царя.",
            "Существует легенда об 'Алматинском призраке' в старых домах 'золотого квадрата'.",
            "Многие верят, что яблоко сорта 'Апорт' приобрело свой вкус только здесь благодаря сочетанию горного воздуха и почвы.",
        ]
    }
}

# ============================================
# CULTURAL ENGINE
# ============================================

class CultureEngine:
    """Provides deep cultural context about Almaty"""
    
    def __init__(self):
        self.db = ALMATY_CULTURE_DB
        try:
            from advanced_nlp_engine import TextPreprocessor
            self.preprocessor = TextPreprocessor()
        except ImportError:
            self.preprocessor = None
        
    def get_info(self, query: str, lang: str = "ru") -> Optional[str]:
        """Find cultural facts based on keywords in query"""
        query_lower = query.lower()
        
        # Mapping keywords to categories (using substrings for better match)
        categories = {
            "history": ["истор", "прошл", "верн", "основа", "history", "past", "ancient"],
            "architecture": ["архитект", "здани", "собор", "гостиниц", "зенков", "architecture", "building", "monument"],
            "personalities": ["личност", "человек", "кто так", "знаменит", "famous", "who is", "person", "имен"],
            "urban_legends": ["легенд", "слух", "миф", "секрет", "legend", "myth", "mystery", "расскаж"]
        }
        
        # Specific overrides for high-precision
        if "зенков" in query_lower:
            return self.db["architecture"]["ru"][0] # Return the Zenkov cathedral fact
        
        found_categories = []
        for cat, keywords in categories.items():
            if any(k in query_lower for k in keywords):
                found_categories.append(cat)
                
        if found_categories:
            # Pick a random fact from found categories
            cat = random.choice(found_categories)
            facts = self.db.get(cat, {}).get(lang, self.db.get(cat, {}).get("ru", []))
            if facts:
                prefix = {
                    "history": "Интересный факт из истории: ",
                    "architecture": "Об архитектуре города: ",
                    "personalities": "Об известных людях Алматы: ",
                    "urban_legends": "Городская легенда: "
                }.get(cat, "") if lang == "ru" else "Interesting fact: "
                
                return f"{prefix}{random.choice(facts)}"
                
        return None
    
    def get_random_fact(self, lang: str = "ru") -> str:
        """Return a completely random Almaty fact"""
        cat = random.choice(list(self.db.keys()))
        facts = self.db[cat].get(lang, self.db[cat].get("ru", []))
        return random.choice(facts)

# ============================================
# SINGLETON
# ============================================

_culture_engine: Optional[CultureEngine] = None

def get_culture_engine() -> CultureEngine:
    global _culture_engine
    if _culture_engine is None:
        _culture_engine = CultureEngine()
    return _culture_engine
