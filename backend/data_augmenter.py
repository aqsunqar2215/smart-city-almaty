import random
import json
import os
import re
from database import SessionLocal, AIKnowledge
from almaty_dataset import ALMATY_DATASET

def augment_data():
    db = SessionLocal()
    try:
        print("Starting Data Augmentation to reach 10,000+ entries...")
        
        # 1. Load synonyms for augmentation
        synonyms = {
            "досуг": ["отдых", "развлечения", "сходить", "погулять", "места", "досуга"],
            "транспорт": ["автобус", "метро", "такси", "ехать", "маршрут", "дорога", "способы передвижения"],
            "экология": ["воздух", "загрязнение", "смог", "aqi", "эко", "состояние среды"],
            "история": ["прошлое", "происхождение", "основание", "старый", "архивы"],
            "наука": ["академия", "университет", "исследования", "ученые", "знания"],
            "места": ["достопримечательности", "памятники", "локации", "интересное"],
            "еда": ["рестораны", "кафе", "кухня", "традиции", "питание"],
            "здоровье": ["больница", "медицина", "клиника", "врач", "помощь"],
        }
        
        en_synonyms = {
            "leisure": ["recreation", "entertainment", "visit", "walk", "places"],
            "transport": ["bus", "metro", "taxi", "go", "route", "road", "transit"],
            "ecology": ["air", "pollution", "smog", "aqi", "environment"],
            "history": ["past", "origin", "founded", "old", "ancient", "legacy"],
            "science": ["academy", "university", "research", "scientists", "knowledge"],
            "sights": ["landmarks", "monuments", "locations", "points of interest"],
            "food": ["restaurants", "cafes", "cuisine", "traditions", "dining"],
            "health": ["hospital", "medical", "clinic", "doctor", "help"],
        }

        # 2. Permutation patterns
        intros_ru = ["Расскажи про", "Где находится", "Что ты знаешь о", "Интересно узнать про", "Мне нужно знать про", "Покажи", "Найди информацию о"]
        intros_en = ["Tell me about", "Where is", "What do you know about", "Can you find info on", "I need to know about", "Show me", "Find information on"]

        new_count = 0
        existing_patterns = {k.pattern for k in db.query(AIKnowledge.pattern).all()}
        
        # We target ~10,000 entries by permuting the ALMATY_DATASET
        # 150 base items * 10 intros * 5 synonyms = 7500 per language approx
        
        for item in ALMATY_DATASET:
            base_pattern = item["pattern"]
            is_ru = item["language"] == "ru"
            intros = intros_ru if is_ru else intros_en
            syns_dict = synonyms if is_ru else en_synonyms
            
            # Find which category this pattern refers to for synonym swapping
            category_syns = []
            for cat, words in syns_dict.items():
                if any(word in base_pattern.lower() for word in words):
                    category_syns = words
                    break
            
            # Special intros for CHAT category
            if item["category"] == "CHAT":
                chat_intros = ["Hey,", "Hi,", "Hello,", "Can you say", "Tell me", ""] if not is_ru else ["Привет,", "Хай,", "Скажи,", "Ответь на", ""]
                intros = chat_intros
            
            # Generate variations
            for intro in intros:
                # Variation 1: Intro + Base Pattern
                new_pat = f"{intro} {base_pattern}"
                if new_pat not in existing_patterns:
                    db.add(AIKnowledge(
                        category=item["category"],
                        pattern=new_pat,
                        response=item["response"],
                        language=item["language"],
                        importance=item.get("importance", 1)
                    ))
                    existing_patterns.add(new_pat)
                    new_count += 1
                
                # Variation 2: Intro + Synonym Swap (if possible)
                if category_syns:
                    for syn in random.sample(category_syns, min(len(category_syns), 3)):
                        # Simple swap logic: if base pattern has words from category_syns, replace one
                        # But simpler: just add Syn to Intro
                        new_pat_syn = f"{intro} {syn} {base_pattern}"
                        if new_pat_syn not in existing_patterns:
                            db.add(AIKnowledge(
                                category=item["category"],
                                pattern=new_pat_syn,
                                response=item["response"],
                                language=item["language"],
                                importance=item.get("importance", 1)
                            ))
                            existing_patterns.add(new_pat_syn)
                            new_count += 1
            
            if new_count > 11000: break # Safety limit

        db.commit()
        print(f"Augmentation complete. Added {new_count} synthetic knowledge entries.")
        total = db.query(AIKnowledge).count()
        print(f"Total Knowledge Base Size: {total}")
        
    except Exception as e:
        print(f"Error augmenting data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    augment_data()
