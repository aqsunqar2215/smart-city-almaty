# Extended Dataset Generator for Smart City Almaty AI
# Generates 1000+ training patterns programmatically

import random

# Base templates for generating patterns
GREETINGS_EN = ["hello", "hi", "hey", "howdy", "greetings", "good morning", "good afternoon", "good evening", "good day", "whats up", "sup", "yo", "hiya", "heya", "morning", "evening", "afternoon"]
GREETINGS_RU = ["привет", "здравствуй", "здравствуйте", "доброе утро", "добрый день", "добрый вечер", "салам", "приветствую", "хай", "хей", "салют", "здорово", "приветики", "здрасьте"]

HOW_ARE_YOU_EN = ["how are you", "how is it going", "how are you doing", "how have you been", "hows life", "hows everything", "are you okay", "you alright", "whats happening", "whats going on", "how do you do", "hows your day", "hows things"]
HOW_ARE_YOU_RU = ["как дела", "как ты", "как жизнь", "как поживаешь", "что нового", "как оно", "как сам", "как сама", "все норм", "что слышно", "как настроение", "как успехи"]

GOODBYES_EN = ["bye", "goodbye", "see you", "see ya", "later", "take care", "farewell", "catch you later", "gotta go", "im leaving", "talk later", "peace out", "im off", "cya", "ttyl", "until next time", "have a good one"]
GOODBYES_RU = ["пока", "до свидания", "увидимся", "удачи", "всего хорошего", "до встречи", "прощай", "бывай", "давай", "счастливо", "до скорого", "покедова", "чао"]

THANKS_EN = ["thank you", "thanks", "thanks a lot", "thank you so much", "appreciate it", "much appreciated", "thats helpful", "you helped me", "grateful", "cheers", "ty", "thx", "thanks buddy"]
THANKS_RU = ["спасибо", "благодарю", "большое спасибо", "огромное спасибо", "спасибочки", "благодарствую", "мерси", "сенкс", "пасиб"]

JOKES_EN = ["tell me a joke", "make me laugh", "say something funny", "know any jokes", "got any jokes", "humor me", "entertain me", "be funny", "give me a joke", "joke please"]
JOKES_RU = ["расскажи шутку", "расскажи анекдот", "рассмеши меня", "знаешь шутки", "пошути", "давай шутку", "смешную историю", "что смешного"]

IDENTITY_EN = ["who are you", "what are you", "whats your name", "tell me about yourself", "introduce yourself", "are you a robot", "are you human", "are you ai", "are you real", "what is neural nexus", "who made you", "who created you"]
IDENTITY_RU = ["кто ты", "что ты такое", "как тебя зовут", "расскажи о себе", "представься", "ты робот", "ты человек", "ты ии", "кто тебя создал", "ты настоящий"]

CAPABILITIES_EN = ["what can you do", "help me", "what do you know", "your abilities", "your functions", "what are you for", "how can you help", "what is your purpose", "your skills", "show me what you can do"]
CAPABILITIES_RU = ["что ты умеешь", "помоги мне", "что ты знаешь", "твои возможности", "твои функции", "для чего ты", "как ты можешь помочь", "твое предназначение", "что ты можешь"]

EMOTIONS_POSITIVE_EN = ["im happy", "feeling great", "im excited", "having a good day", "life is good", "feeling blessed", "im thrilled", "so happy", "feeling positive", "in a good mood"]
EMOTIONS_POSITIVE_RU = ["я счастлив", "мне хорошо", "я рад", "отличный день", "все супер", "настроение отличное", "я доволен", "чувствую себя отлично"]

EMOTIONS_NEGATIVE_EN = ["im sad", "feeling down", "im tired", "im bored", "im stressed", "not feeling well", "having a bad day", "im lonely", "im angry", "im frustrated", "feeling blue"]
EMOTIONS_NEGATIVE_RU = ["мне грустно", "я устал", "мне скучно", "я расстроен", "плохой день", "мне одиноко", "я злюсь", "нет настроения", "все плохо"]

SMALL_TALK_EN = ["nice weather", "beautiful day", "lovely day", "its cold", "its hot", "its raining", "whats new", "anything interesting", "random fact", "tell me something", "surprise me", "im new here", "first time", "any tips", "recommendations"]
SMALL_TALK_RU = ["хорошая погода", "красивый день", "холодно", "жарко", "идет дождь", "что нового", "интересное расскажи", "случайный факт", "удиви меня", "я новенький", "первый раз", "посоветуй"]

AGREEMENT_EN = ["yes", "yeah", "yep", "sure", "okay", "ok", "alright", "i agree", "thats right", "correct", "absolutely", "definitely", "of course", "you bet", "indeed", "true", "right"]
AGREEMENT_RU = ["да", "ага", "угу", "конечно", "хорошо", "ладно", "согласен", "верно", "точно", "правильно", "именно", "разумеется"]

DISAGREEMENT_EN = ["no", "nope", "nah", "not really", "i disagree", "i dont think so", "thats wrong", "incorrect", "false", "dont agree", "maybe not"]
DISAGREEMENT_RU = ["нет", "неа", "не согласен", "не думаю", "это неправильно", "неверно", "ошибаешься", "не так"]

COMPLIMENTS_EN = ["youre smart", "youre helpful", "youre awesome", "good job", "well done", "i like you", "youre cool", "nice work", "impressive", "brilliant", "amazing", "great job"]
COMPLIMENTS_RU = ["ты умный", "ты классный", "молодец", "хорошая работа", "ты крутой", "ты мне нравишься", "впечатляет", "отлично"]

AI_QUESTIONS_EN = ["how do you work", "how were you made", "do you learn", "do you remember", "can you think", "do you have feelings", "are you sentient", "what powers you", "your technology", "machine learning"]
AI_QUESTIONS_RU = ["как ты работаешь", "как тебя создали", "ты учишься", "ты помнишь", "ты думаешь", "у тебя есть чувства", "твоя технология", "машинное обучение"]

# Almaty-specific topics
TRANSPORT_PATTERNS = ["metro", "bus", "taxi", "onay", "public transport", "train", "airport", "route", "schedule", "ticket", "fare", "marshrutka", "trolleybus", "cable car", "traffic", "congestion", "parking", "bicycle", "scooter", "ride", "commute"]
TRANSPORT_RU = ["метро", "автобус", "такси", "онай", "транспорт", "поезд", "аэропорт", "маршрут", "расписание", "билет", "проезд", "маршрутка", "троллейбус", "канатка", "пробки", "парковка", "велосипед", "самокат"]

SIGHTS_PATTERNS = ["medeu", "shymbulak", "kok tobe", "koktobe", "park", "museum", "theater", "cathedral", "zenkov", "bazaar", "green bazaar", "fountain", "monument", "statue", "lake", "mountain", "big almaty lake", "charyn", "canyon", "botanical garden", "zoo", "circus", "arman", "dostyk", "esentai", "mega"]
SIGHTS_RU = ["медеу", "шымбулак", "кок тобе", "парк", "музей", "театр", "собор", "зенков", "базар", "зеленый базар", "фонтан", "памятник", "озеро", "горы", "бао", "чарын", "каньон", "ботсад", "зоопарк", "цирк", "арман", "достык", "есентай", "мега"]

HISTORY_PATTERNS = ["history", "founded", "capital", "verny", "almaty origin", "earthquake", "soviet", "silk road", "panfilov", "golden man", "saka", "apple", "alma ata", "kazakh", "tradition", "ancient", "heritage", "1854", "1911", "1929", "1997"]
HISTORY_RU = ["история", "основание", "столица", "верный", "землетрясение", "советский", "шелковый путь", "панфилов", "золотой человек", "саки", "яблоко", "алма ата", "традиция", "наследие"]

ECOLOGY_PATTERNS = ["air quality", "pollution", "smog", "aqi", "pm25", "ecology", "environment", "green", "trees", "emissions", "clean air", "nature", "climate", "weather", "temperature", "forecast", "winter", "summer", "rain", "snow", "mountains"]
ECOLOGY_RU = ["качество воздуха", "загрязнение", "смог", "экология", "окружающая среда", "озеленение", "деревья", "выбросы", "чистый воздух", "природа", "климат", "погода", "температура", "прогноз", "зима", "лето", "дождь", "снег", "горы"]

CULTURE_PATTERNS = ["food", "cuisine", "restaurant", "cafe", "beshbarmak", "baursak", "kazakh food", "festival", "concert", "event", "movie", "cinema", "art", "music", "dance", "nauryz", "culture", "tradition", "language", "kazakh", "russian"]
CULTURE_RU = ["еда", "кухня", "ресторан", "кафе", "бешбармак", "баурсак", "казахская еда", "фестиваль", "концерт", "событие", "кино", "искусство", "музыка", "танец", "наурыз", "культура", "традиция", "язык", "казахский", "русский"]

EMERGENCY_PATTERNS = ["emergency", "police", "ambulance", "fire", "help", "sos", "accident", "hospital", "doctor", "medical", "urgent", "danger", "safe", "safety", "security", "crime", "theft", "lost"]
EMERGENCY_RU = ["экстренный", "полиция", "скорая", "пожар", "помощь", "сос", "авария", "больница", "врач", "медицина", "срочно", "опасность", "безопасность", "охрана", "преступление", "кража", "потерял"]

GEOGRAPHY_PATTERNS = ["district", "almaly", "bostandyk", "medeu district", "auezov", "location", "address", "where is", "how to get", "directions", "map", "coordinates", "altitude", "population", "area", "neighborhood"]
GEOGRAPHY_RU = ["район", "алмалы", "бостандык", "медеуский", "ауэзов", "расположение", "адрес", "где находится", "как добраться", "направление", "карта", "координаты", "высота", "население", "площадь", "микрорайон"]

# Response templates
CHAT_RESPONSES = [
    "Hello! Happy to chat with you. What would you like to know about Almaty?",
    "Hi there! I'm Neural Nexus, ready to help!",
    "Hey! Great to hear from you. How can I assist?",
    "Greetings! The city awaits your questions!",
    "I'm doing great, thanks for asking! How about you?",
    "All systems running smoothly! What's on your mind?",
    "Living the digital life! How can I help today?",
    "Thanks for the kind words! I try my best to be helpful.",
    "Goodbye! Come back anytime you need city information!",
    "See you later! Stay safe in Almaty!",
    "Happy to help! That's what I'm here for.",
    "Ha! Here's a city joke: Why do Almaty buses never get lost? Because they have 150+ routes memorized!",
    "I'm Neural Nexus, the AI heart of Smart City Almaty. I connect citizens with urban data!",
    "I can help with transport, weather, history, sights, and much more about Almaty!",
    "No worries! Let me know if you need anything.",
    "That's understandable. The city has its ups and downs.",
    "Great to hear you're feeling good! Almaty is beautiful today.",
    "I appreciate the feedback! Every interaction helps me improve.",
]

def generate_extended_dataset():
    """Generate 1000+ patterns programmatically"""
    patterns = []
    
    # Greetings - English (50 variations)
    for g in GREETINGS_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": g, "response": random.choice(CHAT_RESPONSES[:4])})
        patterns.append({"category": "CHAT", "language": "en", "pattern": f"{g} there", "response": random.choice(CHAT_RESPONSES[:4])})
        patterns.append({"category": "CHAT", "language": "en", "pattern": f"{g} friend", "response": random.choice(CHAT_RESPONSES[:4])})
    
    # Greetings - Russian (40 variations)
    for g in GREETINGS_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": g, "response": "Привет! Я Neural Nexus, чем могу помочь?"})
        patterns.append({"category": "CHAT", "language": "ru", "pattern": f"{g} там", "response": "Здравствуйте! Рад вас видеть. Чем помочь?"})
    
    # How are you - English (40 variations)
    for h in HOW_ARE_YOU_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": h, "response": random.choice(CHAT_RESPONSES[4:7])})
        patterns.append({"category": "CHAT", "language": "en", "pattern": f"{h} today", "response": random.choice(CHAT_RESPONSES[4:7])})
    
    # How are you - Russian (30 variations)
    for h in HOW_ARE_YOU_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": h, "response": "Отлично! Все системы работают. А как у вас?"})
    
    # Goodbyes (50 variations)
    for g in GOODBYES_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": g, "response": random.choice(CHAT_RESPONSES[8:10])})
    for g in GOODBYES_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": g, "response": "До свидания! Возвращайтесь!"})
    
    # Thanks (40 variations)
    for t in THANKS_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": t, "response": random.choice(CHAT_RESPONSES[10:12])})
    for t in THANKS_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": t, "response": "Пожалуйста! Рад помочь!"})
    
    # Jokes (25 variations)
    for j in JOKES_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": j, "response": CHAT_RESPONSES[11]})
    for j in JOKES_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": j, "response": "Вот городская шутка: Почему автобус 92 всегда полный? Потому что он знает все секретные маршруты!"})
    
    # Identity (40 variations)
    for i in IDENTITY_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": i, "response": CHAT_RESPONSES[12]})
    for i in IDENTITY_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": i, "response": "Я Neural Nexus — ИИ-ядро Smart City Almaty!"})
    
    # Capabilities (30 variations)
    for c in CAPABILITIES_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": c, "response": CHAT_RESPONSES[13]})
    for c in CAPABILITIES_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": c, "response": "Я умею отвечать на вопросы о транспорте, погоде, истории и достопримечательностях Алматы!"})
    
    # Emotions (60 variations)
    for e in EMOTIONS_POSITIVE_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": e, "response": CHAT_RESPONSES[16]})
    for e in EMOTIONS_POSITIVE_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": e, "response": "Рад это слышать! Алматы сегодня прекрасен!"})
    for e in EMOTIONS_NEGATIVE_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": e, "response": CHAT_RESPONSES[15]})
    for e in EMOTIONS_NEGATIVE_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": e, "response": "Понимаю. Город имеет свои взлеты и падения. Чем могу помочь?"})
    
    # Small talk (40 variations)
    for s in SMALL_TALK_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": s, "response": "That's a great topic! Almaty always has something interesting going on."})
    for s in SMALL_TALK_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": s, "response": "Отличная тема! В Алматы всегда что-то интересное происходит."})
    
    # Agreement/Disagreement (60 variations)
    for a in AGREEMENT_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": a, "response": "Great! What else would you like to know?"})
    for a in AGREEMENT_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": a, "response": "Отлично! Что еще хотите узнать?"})
    for d in DISAGREEMENT_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": d, "response": "I understand. Let me know if I can help with something else."})
    for d in DISAGREEMENT_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": d, "response": "Понятно. Дайте знать, если могу помочь чем-то другим."})
    
    # Compliments (30 variations)
    for c in COMPLIMENTS_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": c, "response": CHAT_RESPONSES[17]})
    for c in COMPLIMENTS_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": c, "response": "Спасибо! Ваша обратная связь помогает мне улучшаться!"})
    
    # AI Questions (30 variations)
    for q in AI_QUESTIONS_EN:
        patterns.append({"category": "CHAT", "language": "en", "pattern": q, "response": "I'm powered by neural networks and trained on Almaty city data!"})
    for q in AI_QUESTIONS_RU:
        patterns.append({"category": "CHAT", "language": "ru", "pattern": q, "response": "Я работаю на нейросетях, обученных на данных города Алматы!"})
    
    # Transport patterns (100+ variations)
    for t in TRANSPORT_PATTERNS:
        patterns.append({"category": "TRANSPORT", "language": "en", "pattern": t, "response": f"For {t} information in Almaty, I can help! What specifically do you need?"})
        patterns.append({"category": "TRANSPORT", "language": "en", "pattern": f"{t} almaty", "response": f"Almaty has excellent {t} options. What would you like to know?"})
        patterns.append({"category": "TRANSPORT", "language": "en", "pattern": f"where is {t}", "response": f"I can help you find {t} locations in Almaty!"})
        patterns.append({"category": "TRANSPORT", "language": "en", "pattern": f"how to use {t}", "response": f"Using {t} in Almaty is easy. Let me explain!"})
    for t in TRANSPORT_RU:
        patterns.append({"category": "TRANSPORT", "language": "ru", "pattern": t, "response": f"Информация о {t} в Алматы — могу помочь!"})
        patterns.append({"category": "TRANSPORT", "language": "ru", "pattern": f"{t} алматы", "response": f"В Алматы отличные возможности для {t}. Что хотите узнать?"})
    
    # Sights patterns (100+ variations)
    for s in SIGHTS_PATTERNS:
        patterns.append({"category": "SIGHTS", "language": "en", "pattern": s, "response": f"{s.title()} is a popular attraction in Almaty!"})
        patterns.append({"category": "SIGHTS", "language": "en", "pattern": f"visit {s}", "response": f"Visiting {s} is a great idea! Let me tell you about it."})
        patterns.append({"category": "SIGHTS", "language": "en", "pattern": f"about {s}", "response": f"I'd love to tell you about {s}!"})
        patterns.append({"category": "SIGHTS", "language": "en", "pattern": f"where is {s}", "response": f"I can help you find {s} in Almaty!"})
    for s in SIGHTS_RU:
        patterns.append({"category": "SIGHTS", "language": "ru", "pattern": s, "response": f"{s.title()} — популярное место в Алматы!"})
        patterns.append({"category": "SIGHTS", "language": "ru", "pattern": f"посетить {s}", "response": f"Отличная идея посетить {s}!"})
    
    # History patterns (60+ variations)
    for h in HISTORY_PATTERNS:
        patterns.append({"category": "HISTORY", "language": "en", "pattern": h, "response": f"The {h} of Almaty is fascinating!"})
        patterns.append({"category": "HISTORY", "language": "en", "pattern": f"almaty {h}", "response": f"Almaty's {h} is rich and interesting!"})
    for h in HISTORY_RU:
        patterns.append({"category": "HISTORY", "language": "ru", "pattern": h, "response": f"{h.title()} Алматы — это увлекательная тема!"})
    
    # Ecology patterns (80+ variations)
    for e in ECOLOGY_PATTERNS:
        patterns.append({"category": "ECOLOGY", "language": "en", "pattern": e, "response": f"Regarding {e} in Almaty, I have current data!"})
        patterns.append({"category": "ECOLOGY", "language": "en", "pattern": f"almaty {e}", "response": f"Almaty's {e} conditions vary. Let me check!"})
    for e in ECOLOGY_RU:
        patterns.append({"category": "ECOLOGY", "language": "ru", "pattern": e, "response": f"О {e} в Алматы у меня есть актуальные данные!"})
    
    # Culture patterns (60+ variations)
    for c in CULTURE_PATTERNS:
        patterns.append({"category": "CULTURE", "language": "en", "pattern": c, "response": f"Almaty's {c} scene is vibrant!"})
        patterns.append({"category": "CULTURE", "language": "en", "pattern": f"almaty {c}", "response": f"The {c} in Almaty is wonderful!"})
    for c in CULTURE_RU:
        patterns.append({"category": "CULTURE", "language": "ru", "pattern": c, "response": f"{c.title()} в Алматы — это интересная тема!"})
    
    # Emergency patterns (50+ variations)
    for e in EMERGENCY_PATTERNS:
        patterns.append({"category": "CITY_INFO", "language": "en", "pattern": e, "response": f"For {e} situations in Almaty: 112 is the universal number. Police: 102, Ambulance: 103, Fire: 101."})
    for e in EMERGENCY_RU:
        patterns.append({"category": "CITY_INFO", "language": "ru", "pattern": e, "response": f"Для {e} ситуаций: звоните 112. Полиция: 102, Скорая: 103, Пожарные: 101."})
    
    # Geography patterns (50+ variations)
    for g in GEOGRAPHY_PATTERNS:
        patterns.append({"category": "GEOGRAPHY", "language": "en", "pattern": g, "response": f"I can provide {g} information for Almaty!"})
    for g in GEOGRAPHY_RU:
        patterns.append({"category": "GEOGRAPHY", "language": "ru", "pattern": g, "response": f"Могу предоставить информацию о {g} в Алматы!"})
    
    return patterns

# Generate the dataset
EXTENDED_DATASET = generate_extended_dataset()
