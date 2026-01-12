import json
import os

# Mapping from external JSON categories to AI Engine tags
CATEGORY_MAP = {
    "food": "CULTURE",
    "housing": "CITY_INFO",
    "ecology": "ECOLOGY",
    "traffic": "TRANSPORT",
    "emergency": "EMERGENCY",
    "tourism": "SIGHTS",
    "finance": "ECONOMY",
    "education": "SCIENCE"
}

import random

def load_external_datasets(limit_per_file=3000):
    """
    Loads almaty_smart_city_english.json and general_chat_english_10k.json
    with a limit and shuffling for better variety.
    """
    base_path = r"c:\Users\Nitro\Downloads\rererggrrg-main"
    smart_city_path = os.path.join(base_path, "almaty_smart_city_english.json")
    chat_10k_path = os.path.join(base_path, "general_chat_english_10k.json")
    
    external_patterns = []
    
    # 1. Load Smart City Dataset
    if os.path.exists(smart_city_path):
        with open(smart_city_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            random.shuffle(data)
            for item in data[:limit_per_file]:
                ext_cat = item.get("category", "")
                target_cat = CATEGORY_MAP.get(ext_cat, "CITY_INFO")
                external_patterns.append({
                    "category": target_cat,
                    "language": "en",
                    "pattern": item.get("instruction", ""),
                    "response": item.get("output", "")
                })
    
    # 2. Load General Chat Dataset
    if os.path.exists(chat_10k_path):
        with open(chat_10k_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            random.shuffle(data)
            for item in data[:limit_per_file]:
                external_patterns.append({
                    "category": "CHAT",
                    "language": "en",
                    "pattern": item.get("instruction", ""),
                    "response": item.get("output", "")
                })
                
    return external_patterns

if __name__ == "__main__":
    patterns = load_external_datasets()
    print(f"Loaded {len(patterns)} external patterns.")
    if patterns:
        print(f"First pattern: {patterns[0]}")
