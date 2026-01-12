"""
Data Augmenter V2 - Dataset expansion and enrichment
Features:
- Synonym expansion
- Typo generation (for training robustness)
- Response variant management
- Dynamic response templates
"""

import random
import re

# ==========================================
# SYNONYM GROUPS
# ==========================================

SYNONYMS = {
    "hello": ["hi", "hey", "greetings", "good day", "yo", "sup", "hiya", "morning", "evening"],
    "bye": ["goodbye", "later", "see ya", "farewell", "cya", "bye bye", "talk later"],
    "bus": ["autobus", "shuttle", "transit", "public transport", "coach", "buses", "marshrutka"],
    "metro": ["subway", "underground", "train", "tube", "rail"],
    "weather": ["climate", "forecast", "conditions", "temp", "temperature", "outside"],
    "pollution": ["smog", "air quality", "emissions", "dirty air", "aqi", "smoke", "haze"],
    "sights": ["attractions", "landmarks", "places of interest", "tourism", "monuments", "visit"],
    "how are you": ["hows it going", "how are u", "how is everything", "hows life", "u ok"],
    "what is": ["whats", "tell me about", "explain", "describe", "info on"],
    "where is": ["show me", "locate", "how to find", "direction to", "path to"],
    "almaty": ["the city", "town", "alma-ata", "capital"],
    "smart": ["intelligent", "ai-powered", "digital", "modern", "automated"],
    "help": ["assist", "guide", "support", "help me"],
}

# ==========================================
# TYPO GENERATION LOGIC
# ==========================================

def add_typo(word):
    """Add a common typo to a word for training robustness"""
    if len(word) < 4:
        return word
        
    typo_type = random.choice(["swap", "drop", "repeat", "keyboard"])
    chars = list(word)
    
    if typo_type == "swap":
        # Swap adjacent characters
        idx = random.randint(0, len(chars) - 2)
        chars[idx], chars[idx+1] = chars[idx+1], chars[idx]
    
    elif typo_type == "drop":
        # Drop a character
        idx = random.randint(1, len(chars) - 1)
        chars.pop(idx)
        
    elif typo_type == "repeat":
        # Repeat a character
        idx = random.randint(0, len(chars) - 1)
        chars.insert(idx, chars[idx])
        
    elif typo_type == "keyboard":
        # Common keyboard slips (approximate)
        adjacents = {"a": "s", "s": "da", "d": "sf", "f": "dg", "g": "fh", "h": "gj", "j": "hk", "k": "jl", "l": "k",
                     "q": "w", "w": "qe", "e": "wr", "r": "et", "t": "ry", "y": "tu", "u": "yi", "i": "uo", "o": "ip", "p": "o"}
        idx = random.randint(0, len(chars) - 1)
        if chars[idx] in adjacents:
            chars[idx] = random.choice(adjacents[chars[idx]])
            
    return "".join(chars)

# ==========================================
# AUGMENTATION LOGIC
# ==========================================

def augment_pattern(pattern):
    """Generate synonyms and typo variants of a pattern"""
    variants = {pattern}
    words = pattern.lower().split()
    
    # 1. Synonym Augmentation
    for i, word in enumerate(words):
        if word in SYNONYMS:
            for syn in SYNONYMS[word]:
                new_words = words[:]
                new_words[i] = syn
                variants.add(" ".join(new_words))
    
    # 2. Key phrases replacement
    for phrase, syns in SYNONYMS.items():
        if phrase in pattern.lower():
            for syn in syns:
                variants.add(pattern.lower().replace(phrase, syn))

    # 3. Typo Augmentation (Add to about 10% of variants)
    original_variants = list(variants)
    for v in original_variants:
        if random.random() < 0.15:
            words = v.split()
            if words:
                idx = random.randint(0, len(words) - 1)
                words[idx] = add_typo(words[idx])
                variants.add(" ".join(words))
                
    return list(variants)

def augment_dataset(dataset, target_size=5000):
    """Expand dataset using augmentation techniques"""
    augmented = []
    
    # Track counts per category to maintain balance
    counts = {}
    
    print(f"Original dataset size: {len(dataset)}")
    
    # First pass: collect all original and synonyms
    for entry in dataset:
        cat = entry['category']
        counts[cat] = counts.get(cat, 0) + 1
        
        pattern = entry['pattern']
        variants = augment_pattern(pattern)
        
        for v in variants:
            new_entry = entry.copy()
            new_entry['pattern'] = v
            augmented.append(new_entry)
            
    print(f"Size after synonym/typo expansion: {len(augmented)}")
    
    # Second pass: if still small, add more typo variants
    if len(augmented) < target_size:
        needed = target_size - len(augmented)
        for _ in range(needed):
            entry = random.choice(dataset)
            new_entry = entry.copy()
            words = entry['pattern'].split()
            if words:
                idx = random.randint(0, len(words) - 1)
                words[idx] = add_typo(words[idx])
                new_entry['pattern'] = " ".join(words)
                augmented.append(new_entry)
                
    # Final shuffle
    random.shuffle(augmented)
    print(f"Final augmented dataset size: {len(augmented)}")
    return augmented

# ================= ==========================
# DYNAMIC RESPONSE MANAGER
# ==========================================

RESPONSE_VARIANTS = {
    "CHAT": [
        "Hello! I'm here to chat about Almaty.",
        "Hey! How can I assist you in the city today?",
        "Greetings! What would you like to explore?",
        "Neural Nexus at your service! Ask me anything.",
        "Hi! Almaty is a beautiful place, isn't it?"
    ],
    "TRANSPORT": [
        "I can help with transit info. What route are you looking for?",
        "Public transport is a great way to see Almaty! Need help with Onay or buses?",
        "Checking transport data... What specific info do you need?",
        "Transport services in Almaty are quite extensive. What should I check for you?",
        "I've got the latest on buses and metro. What's on your mind?"
    ],
    "ECOLOGY": [
        "Air quality is important for Almaty. Here's what I know...",
        "Ecology data coming right up! Are you asking about AQI or pollution?",
        "Almaty is active in green initiatives. What environmental info do you need?",
        "Environment and smog are hot topics here. Let me help with the data.",
    ],
    "SIGHTS": [
        "Almaty has amazing landmarks! Where do you want to go?",
        "Medeu, Shymbulak, Kok-Tobe... so many sights! Want specific details?",
        "Tourism is booming here. Let me guide you to the best spots.",
        "Exploring our city is always fun. Which attraction interests you?",
    ],
    "CITY_INFO": [
        "Getting city details... One moment.",
        "Almaty OS is monitoring everything. What info can I retrieve?",
        "Knowledge base access granted. What city stats do you need?",
        "From infrastructure to safety, I've got you covered."
    ]
}

def get_dynamic_response(category, context=None):
    """Retrieve a varied response based on category and context"""
    base = random.choice(RESPONSE_VARIANTS.get(category, ["I'm here to help with your query."]))
    
    # Add context check (e.g., time of day)
    # This could be expanded with real API data
    return base
