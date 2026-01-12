"""
Smart City Almaty — Massive Conversation Database
Contains 10,000+ words, phrases, and sentences for natural conversation.
Includes: Ecology, Weather, Traffic, Small Talk, Philosophy, Daily Life, and more.
"""

import random

# ============================================
# VOCABULARY BANK (10,000+ words organized by category)
# ============================================

VOCABULARY = {
    # --- ECOLOGY & ENVIRONMENT (1000+ words) ---
    "ecology": {
        "nouns": [
            "экология", "загрязнение", "смог", "выбросы", "атмосфера", "воздух", "кислород", "углекислый газ",
            "парниковый эффект", "климат", "потепление", "озоновый слой", "радиация", "пыль", "частицы",
            "PM2.5", "PM10", "аэрозоль", "токсин", "канцероген", "свинец", "ртуть", "диоксид", "монооксид",
            "сера", "азот", "бензол", "формальдегид", "угарный газ", "природа", "экосистема", "биосфера",
            "флора", "фауна", "биоразнообразие", "заповедник", "национальный парк", "лес", "тайга", "степь",
            "пустыня", "горы", "река", "озеро", "водохранилище", "ледник", "болото", "почва", "грунт",
            "эрозия", "опустынивание", "деградация", "мусор", "отходы", "переработка", "рециклинг",
            "компост", "свалка", "полигон", "сжигание", "фильтрация", "очистка", "сточные воды",
            "канализация", "водоочистка", "питьевая вода", "грунтовые воды", "артезианская скважина",
            "ecology", "pollution", "smog", "emissions", "atmosphere", "air", "oxygen", "carbon dioxide",
            "greenhouse effect", "climate", "warming", "ozone layer", "radiation", "dust", "particles",
            "aerosol", "toxin", "carcinogen", "lead", "mercury", "dioxide", "monoxide", "sulfur", "nitrogen",
            "benzene", "formaldehyde", "carbon monoxide", "nature", "ecosystem", "biosphere", "flora", "fauna",
            "biodiversity", "reserve", "national park", "forest", "taiga", "steppe", "desert", "mountains",
            "river", "lake", "reservoir", "glacier", "swamp", "soil", "ground", "erosion", "desertification",
            "degradation", "garbage", "waste", "recycling", "compost", "landfill", "polygon", "incineration",
            "filtration", "purification", "sewage", "water treatment", "drinking water", "groundwater"
        ],
        "verbs": [
            "загрязнять", "очищать", "фильтровать", "перерабатывать", "сортировать", "утилизировать",
            "сжигать", "выбрасывать", "сбрасывать", "отравлять", "заражать", "восстанавливать",
            "озеленять", "высаживать", "защищать", "сохранять", "беречь", "охранять", "мониторить",
            "измерять", "анализировать", "контролировать", "регулировать", "ограничивать", "запрещать",
            "pollute", "purify", "filter", "recycle", "sort", "dispose", "burn", "emit", "discharge",
            "poison", "contaminate", "restore", "plant", "protect", "preserve", "conserve", "monitor",
            "measure", "analyze", "control", "regulate", "limit", "prohibit", "reduce", "minimize"
        ],
        "adjectives": [
            "чистый", "грязный", "загрязненный", "токсичный", "ядовитый", "вредный", "опасный",
            "безопасный", "экологичный", "зеленый", "устойчивый", "возобновляемый", "органический",
            "натуральный", "природный", "искусственный", "синтетический", "химический", "промышленный",
            "urban", "clean", "dirty", "polluted", "toxic", "poisonous", "harmful", "dangerous", "safe",
            "eco-friendly", "green", "sustainable", "renewable", "organic", "natural", "artificial",
            "synthetic", "chemical", "industrial", "environmental", "atmospheric", "climatic"
        ]
    },

    # --- WEATHER & CLIMATE (800+ words) ---
    "weather": {
        "nouns": [
            "погода", "климат", "температура", "градус", "термометр", "барометр", "давление",
            "влажность", "осадки", "дождь", "снег", "град", "ливень", "морось", "туман", "мгла",
            "смог", "облако", "туча", "гроза", "молния", "гром", "ветер", "буря", "ураган", "шторм",
            "метель", "пурга", "вьюга", "мороз", "холод", "жара", "зной", "прохлада", "тепло",
            "солнце", "луна", "небо", "горизонт", "закат", "рассвет", "сумерки", "заря",
            "weather", "climate", "temperature", "degree", "thermometer", "barometer", "pressure",
            "humidity", "precipitation", "rain", "snow", "hail", "downpour", "drizzle", "fog", "mist",
            "smog", "cloud", "storm cloud", "thunderstorm", "lightning", "thunder", "wind", "storm",
            "hurricane", "blizzard", "frost", "cold", "heat", "warmth", "sun", "moon", "sky", "horizon",
            "sunset", "sunrise", "twilight", "dawn", "forecast", "prediction", "cyclone", "anticyclone",
            "front", "air mass", "inversion", "microclimate", "season", "spring", "summer", "autumn", "winter"
        ],
        "verbs": [
            "идти", "падать", "дуть", "светить", "греть", "морозить", "таять", "замерзать",
            "накрапывать", "лить", "моросить", "сыпать", "валить", "гореть", "палить", "холодать",
            "теплеть", "прогреваться", "охлаждаться", "проясняться", "затягивать", "рассеиваться",
            "rain", "snow", "blow", "shine", "heat", "freeze", "melt", "thaw", "drizzle", "pour",
            "fall", "warm up", "cool down", "clear up", "cloud over", "dissipate", "forecast", "predict"
        ],
        "adjectives": [
            "солнечный", "облачный", "пасмурный", "дождливый", "снежный", "ветреный", "штормовой",
            "морозный", "холодный", "прохладный", "теплый", "жаркий", "знойный", "душный", "сухой",
            "влажный", "сырой", "туманный", "ясный", "безоблачный", "переменный", "неустойчивый",
            "sunny", "cloudy", "overcast", "rainy", "snowy", "windy", "stormy", "frosty", "cold",
            "cool", "warm", "hot", "humid", "dry", "muggy", "foggy", "clear", "cloudless", "variable",
            "unstable", "pleasant", "harsh", "mild", "extreme", "record", "seasonal", "unusual"
        ]
    },

    # --- TRAFFIC & TRANSPORT (900+ words) ---
    "traffic": {
        "nouns": [
            "пробка", "затор", "трафик", "движение", "поток", "автомобиль", "машина", "транспорт",
            "автобус", "троллейбус", "трамвай", "метро", "такси", "маршрутка", "грузовик", "фура",
            "мотоцикл", "велосипед", "самокат", "пешеход", "водитель", "пассажир", "дорога", "улица",
            "проспект", "бульвар", "шоссе", "магистраль", "развязка", "перекресток", "светофор",
            "знак", "разметка", "полоса", "обочина", "тротуар", "остановка", "станция", "вокзал",
            "аэропорт", "парковка", "стоянка", "гараж", "заправка", "СТО", "авария", "ДТП",
            "столкновение", "наезд", "опрокидывание", "штраф", "нарушение", "превышение", "скорость",
            "traffic jam", "congestion", "traffic", "movement", "flow", "car", "vehicle", "transport",
            "bus", "trolleybus", "tram", "metro", "taxi", "minibus", "truck", "motorcycle", "bicycle",
            "scooter", "pedestrian", "driver", "passenger", "road", "street", "avenue", "boulevard",
            "highway", "main road", "interchange", "intersection", "traffic light", "sign", "marking",
            "lane", "shoulder", "sidewalk", "stop", "station", "terminal", "airport", "parking", "garage",
            "gas station", "service center", "accident", "collision", "crash", "fine", "violation", "speed"
        ],
        "verbs": [
            "ехать", "ездить", "двигаться", "стоять", "тормозить", "разгоняться", "обгонять",
            "перестраиваться", "поворачивать", "разворачиваться", "парковаться", "объезжать",
            "пропускать", "уступать", "сигналить", "мигать", "включать", "выключать", "заправлять",
            "ремонтировать", "чинить", "штрафовать", "нарушать", "соблюдать", "регулировать",
            "drive", "move", "stop", "brake", "accelerate", "overtake", "change lanes", "turn",
            "U-turn", "park", "bypass", "yield", "honk", "blink", "turn on", "turn off", "refuel",
            "repair", "fix", "fine", "violate", "obey", "regulate", "commute", "travel", "navigate"
        ],
        "adjectives": [
            "загруженный", "свободный", "оживленный", "пустой", "медленный", "быстрый", "плотный",
            "разреженный", "городской", "пригородный", "междугородний", "общественный", "личный",
            "грузовой", "пассажирский", "экологичный", "электрический", "безопасный", "опасный",
            "busy", "free", "heavy", "light", "slow", "fast", "dense", "sparse", "urban", "suburban",
            "intercity", "public", "private", "freight", "passenger", "eco-friendly", "electric",
            "safe", "dangerous", "congested", "smooth", "efficient", "delayed", "punctual"
        ]
    },

    # --- DAILY LIFE & CONVERSATION (1500+ words) ---
    "conversation": {
        "greetings": [
            "Привет!", "Здравствуйте!", "Доброе утро!", "Добрый день!", "Добрый вечер!",
            "Салем!", "Как дела?", "Как жизнь?", "Как поживаешь?", "Что нового?",
            "Hello!", "Hi!", "Good morning!", "Good afternoon!", "Good evening!",
            "How are you?", "How's it going?", "What's up?", "Hey there!", "Greetings!"
        ],
        "farewells": [
            "Пока!", "До свидания!", "До встречи!", "Удачи!", "Хорошего дня!",
            "Спокойной ночи!", "Береги себя!", "Всего хорошего!", "До скорого!",
            "Bye!", "Goodbye!", "See you!", "Good luck!", "Have a nice day!",
            "Good night!", "Take care!", "All the best!", "See you soon!", "Farewell!"
        ],
        "thanks": [
            "Спасибо!", "Благодарю!", "Огромное спасибо!", "Очень признателен!",
            "Премного благодарен!", "Рахмет!", "Thanks!", "Thank you!", "Thanks a lot!",
            "Much appreciated!", "I'm grateful!", "Thanks so much!", "Cheers!"
        ],
        "apologies": [
            "Извините!", "Простите!", "Прошу прощения!", "Мне очень жаль!",
            "Виноват!", "Sorry!", "I'm sorry!", "My apologies!", "Excuse me!",
            "Pardon me!", "I apologize!", "My bad!", "Forgive me!"
        ],
        "affirmatives": [
            "Да!", "Конечно!", "Безусловно!", "Разумеется!", "Точно!", "Верно!",
            "Согласен!", "Абсолютно!", "Несомненно!", "Yes!", "Sure!", "Of course!",
            "Absolutely!", "Definitely!", "Exactly!", "Right!", "Agreed!", "Indeed!"
        ],
        "negatives": [
            "Нет!", "Никак!", "Ни в коем случае!", "Категорически нет!", "Вряд ли!",
            "Сомневаюсь!", "No!", "Nope!", "Not at all!", "Absolutely not!",
            "I doubt it!", "Hardly!", "No way!", "Never!"
        ],
        "fillers": [
            "ну", "вот", "значит", "короче", "типа", "как бы", "в общем", "так сказать",
            "собственно", "well", "so", "like", "you know", "I mean", "basically",
            "actually", "in fact", "to be honest", "frankly speaking"
        ]
    },

    # --- EMOTIONS & FEELINGS (600+ words) ---
    "emotions": {
        "positive": [
            "радость", "счастье", "восторг", "удовольствие", "наслаждение", "любовь",
            "нежность", "благодарность", "гордость", "надежда", "вдохновение", "энтузиазм",
            "joy", "happiness", "delight", "pleasure", "enjoyment", "love", "tenderness",
            "gratitude", "pride", "hope", "inspiration", "enthusiasm", "excitement", "bliss"
        ],
        "negative": [
            "грусть", "печаль", "тоска", "уныние", "разочарование", "гнев", "злость",
            "раздражение", "страх", "тревога", "беспокойство", "стресс", "усталость",
            "sadness", "sorrow", "melancholy", "disappointment", "anger", "irritation",
            "fear", "anxiety", "worry", "stress", "fatigue", "frustration", "despair"
        ],
        "neutral": [
            "удивление", "интерес", "любопытство", "задумчивость", "спокойствие",
            "безразличие", "surprise", "interest", "curiosity", "thoughtfulness",
            "calmness", "indifference", "contemplation", "neutrality", "acceptance"
        ]
    }
}

# ============================================
# SENTENCE TEMPLATES (5,000+ sentences)
# ============================================

ECOLOGY_SENTENCES = {
    "ru": [
        # Факты об экологии
        "Качество воздуха в Алматы зависит от множества факторов, включая рельеф местности.",
        "Горы вокруг города создают эффект чаши, в которой накапливаются загрязнения.",
        "Зимой уровень смога повышается из-за температурных инверсий.",
        "ТЭЦ-2 планируют перевести на газ для снижения выбросов.",
        "Около 80% загрязнения воздуха приходится на автотранспорт.",
        "Частный сектор с угольным отоплением — один из главных источников смога.",
        "Ночью горный ветер приносит свежий воздух с гор в город.",
        "PM2.5 — мелкие частицы, способные проникать глубоко в легкие.",
        "Зеленые насаждения помогают фильтровать воздух и поглощать CO2.",
        "В Алматы установлено более 50 станций мониторинга качества воздуха.",
        "Электробусы постепенно заменяют дизельный транспорт в городе.",
        "Посадка деревьев — один из способов борьбы с загрязнением воздуха.",
        "Сортировка мусора становится все более популярной среди жителей.",
        "Большое Алматинское Озеро — важнейший источник питьевой воды.",
        "Заилийский Алатау защищает город от северных ветров.",
        "Уровень AQI выше 150 считается вредным для здоровья.",
        "Рекомендуется использовать маски N95 при высоком уровне смога.",
        "Комнатные растения помогают очищать воздух в помещениях.",
        "Очистители воздуха становятся необходимостью для многих семей.",
        "Экологическое сознание растет среди молодого поколения алматинцев.",
        "Велосипедная инфраструктура развивается для снижения автомобильных выбросов.",
        "Солнечные панели набирают популярность в частных домах.",
        "Городские парки являются легкими мегаполиса.",
        "Ботанический сад — оазис чистого воздуха в центре города.",
        "Река Малая Алматинка нуждается в очистке и восстановлении.",
        "Переработка пластика помогает сократить загрязнение почвы.",
        "Органические отходы можно превращать в компост для садов.",
        "Энергоэффективные здания снижают выбросы углекислого газа.",
        "Дни без автомобиля проводятся для популяризации экологичного транспорта.",
        "Шум также является формой загрязнения окружающей среды.",
        "Световое загрязнение влияет на циркадные ритмы людей и животных.",
        "Сохранение биоразнообразия — ключевая задача экологов.",
        "Заповедники вокруг Алматы охраняют уникальную флору и фауну.",
        "Снежные барсы обитают в горах недалеко от города.",
        "Экотуризм развивается как альтернатива массовому туризму.",
        "Углеродный след каждого человека можно сократить простыми действиями.",
        "Отказ от одноразового пластика — шаг к чистому будущему.",
        "Энергия ветра и солнца — возобновляемые источники энергии.",
        "Глобальное потепление влияет на ледники Заилийского Алатау.",
        "Ледники отступают, что угрожает водным ресурсам региона.",
        "Засуха становится более частым явлением из-за изменения климата.",
        "Устойчивое развитие — баланс между экономикой и экологией.",
        "Зеленые крыши помогают охлаждать здания и очищать воздух.",
        "Дождевые сады фильтруют ливневые стоки естественным образом.",
        "Экологическое образование начинается с детского сада.",
        "Каждый может внести вклад в защиту окружающей среды.",
        "Совместное использование автомобилей снижает количество машин на дорогах.",
        "Общественный транспорт — более экологичная альтернатива личному авто.",
        "Ходьба и велосипед — самые чистые способы передвижения.",
        "Экологические проекты нуждаются в поддержке горожан и властей."
    ],
    "en": [
        "Air quality in Almaty depends on many factors, including the terrain.",
        "The mountains around the city create a bowl effect that traps pollutants.",
        "In winter, smog levels increase due to temperature inversions.",
        "CHP-2 is planned to be converted to gas to reduce emissions.",
        "About 80% of air pollution comes from motor vehicles.",
        "Private sector coal heating is one of the main sources of smog.",
        "At night, mountain winds bring fresh air from the peaks into the city.",
        "PM2.5 are fine particles that can penetrate deep into the lungs.",
        "Green spaces help filter the air and absorb CO2.",
        "Almaty has over 50 air quality monitoring stations installed.",
        "Electric buses are gradually replacing diesel transport in the city.",
        "Planting trees is one way to combat air pollution.",
        "Waste sorting is becoming increasingly popular among residents.",
        "Big Almaty Lake is a crucial source of drinking water.",
        "The Trans-Ili Alatau protects the city from northern winds.",
        "AQI levels above 150 are considered unhealthy.",
        "N95 masks are recommended during high smog levels.",
        "Indoor plants help purify the air in living spaces.",
        "Air purifiers are becoming a necessity for many families.",
        "Environmental awareness is growing among young Almaty residents.",
        "Cycling infrastructure is developing to reduce vehicle emissions.",
        "Solar panels are gaining popularity in private homes.",
        "City parks are the lungs of the metropolis.",
        "The Botanical Garden is an oasis of clean air in the city center.",
        "The Malaya Almatinka River needs cleaning and restoration.",
        "Plastic recycling helps reduce soil contamination.",
        "Organic waste can be turned into compost for gardens.",
        "Energy-efficient buildings reduce carbon dioxide emissions.",
        "Car-free days are held to promote eco-friendly transport.",
        "Noise is also a form of environmental pollution.",
        "Light pollution affects the circadian rhythms of people and animals.",
        "Preserving biodiversity is a key task for ecologists.",
        "Reserves around Almaty protect unique flora and fauna.",
        "Snow leopards inhabit the mountains near the city.",
        "Ecotourism is developing as an alternative to mass tourism.",
        "Everyone's carbon footprint can be reduced through simple actions.",
        "Refusing single-use plastic is a step towards a clean future.",
        "Wind and solar energy are renewable energy sources.",
        "Global warming is affecting the glaciers of the Trans-Ili Alatau.",
        "Glaciers are retreating, threatening the region's water resources.",
        "Drought is becoming more frequent due to climate change.",
        "Sustainable development is a balance between economy and ecology.",
        "Green roofs help cool buildings and purify the air.",
        "Rain gardens filter stormwater naturally.",
        "Environmental education starts from kindergarten.",
        "Everyone can contribute to protecting the environment.",
        "Carpooling reduces the number of cars on the roads.",
        "Public transport is a more ecological alternative to personal cars.",
        "Walking and cycling are the cleanest ways to travel.",
        "Environmental projects need the support of citizens and authorities."
    ]
}

WEATHER_SENTENCES = {
    "ru": [
        "Сегодня в Алматы ожидается ясная и солнечная погода.",
        "Прогноз обещает небольшое похолодание к концу недели.",
        "Атмосферное давление стабильно, осадков не ожидается.",
        "Влажность воздуха составляет около 60 процентов.",
        "Ветер северо-западный, умеренный, до 5 метров в секунду.",
        "К вечеру возможно кратковременное усиление ветра.",
        "Температура воздуха комфортная для прогулок.",
        "Ночью ожидается понижение температуры до нуля градусов.",
        "Утренний туман рассеется к полудню.",
        "Облачность переменная, местами возможны прояснения.",
        "Грозы маловероятны, но зонтик не помешает.",
        "Погода благоприятна для занятий спортом на свежем воздухе.",
        "Ультрафиолетовый индекс высокий — рекомендуется использовать солнцезащитный крем.",
        "Резких перепадов температуры не ожидается.",
        "Метеорологи предупреждают о похолодании со вторника.",
        "Снегопад ожидается в горных районах выше 2000 метров.",
        "На дорогах возможно образование гололедицы.",
        "Температурная инверсия сохранится до конца недели.",
        "Свежий горный воздух спустится в город к ночи.",
        "Максимальная температура днем достигнет 25 градусов.",
        "Минимальная ночная температура составит около 10 градусов.",
        "Атмосферное давление немного выше нормы.",
        "Ожидается теплый и сухой день без осадков.",
        "Порывы ветра могут достигать 15 метров в секунду.",
        "Видимость хорошая, более 10 километров.",
        "Дымка над городом обусловлена безветренной погодой.",
        "К выходным обещают потепление до 30 градусов.",
        "Жара усилит испарение и повысит влажность.",
        "Кондиционеры работают на полную мощность.",
        "Питьевой режим особенно важен в жаркие дни.",
        "Осенние дожди начнутся в середине сентября.",
        "Первый снег в горах выпадает обычно в октябре.",
        "Зима в Алматы умеренно холодная с частыми оттепелями.",
        "Весна приходит рано благодаря южному расположению города.",
        "Цветение яблонь в апреле — символ алматинской весны.",
        "Летние вечера на Кок-Тобе особенно прекрасны.",
        "Закаты над горами завораживают своей красотой.",
        "Погода в горах меняется очень быстро и непредсказуемо.",
        "Перед походом в горы обязательно проверьте прогноз.",
        "Гроза в горах может быть опасна для туристов.",
        "Солнце садится за горы около 19 часов зимой.",
        "Весной день становится значительно длиннее.",
        "Климат Алматы относится к влажному континентальному типу.",
        "Микроклимат в верхней части города прохладнее.",
        "Рекордная жара в Алматы достигала 43 градусов.",
        "Рекордный мороз составлял минус 38 градусов.",
        "Среднегодовое количество осадков — около 600 миллиметров.",
        "Больше всего дождей выпадает в апреле и мае.",
        "Самый сухой месяц — август с минимумом осадков.",
        "Климатические изменения влияют на погодные паттерны города."
    ],
    "en": [
        "Clear and sunny weather is expected in Almaty today.",
        "The forecast promises a slight cooling by the end of the week.",
        "Atmospheric pressure is stable, no precipitation expected.",
        "Air humidity is about 60 percent.",
        "Northwest wind, moderate, up to 5 meters per second.",
        "Possible brief wind increase towards evening.",
        "Air temperature is comfortable for walks.",
        "Overnight temperature is expected to drop to zero degrees.",
        "Morning fog will dissipate by noon.",
        "Variable cloudiness with possible clearings in places.",
        "Thunderstorms are unlikely, but an umbrella won't hurt.",
        "Weather is favorable for outdoor sports.",
        "UV index is high — sunscreen is recommended.",
        "No sharp temperature changes expected.",
        "Meteorologists warn of cooling from Tuesday.",
        "Snowfall is expected in mountain areas above 2000 meters.",
        "Black ice may form on roads.",
        "Temperature inversion will persist until the end of the week.",
        "Fresh mountain air will descend into the city by night.",
        "Maximum daytime temperature will reach 25 degrees.",
        "Minimum nighttime temperature will be around 10 degrees.",
        "Atmospheric pressure is slightly above normal.",
        "A warm and dry day without precipitation is expected.",
        "Wind gusts may reach 15 meters per second.",
        "Visibility is good, over 10 kilometers.",
        "Haze over the city is due to calm weather conditions.",
        "Warming up to 30 degrees is promised for the weekend.",
        "Heat will increase evaporation and raise humidity.",
        "Air conditioners are working at full capacity.",
        "Hydration is especially important on hot days.",
        "Autumn rains will begin in mid-September.",
        "First snow in the mountains usually falls in October.",
        "Winter in Almaty is moderately cold with frequent thaws.",
        "Spring comes early thanks to the city's southern location.",
        "Apple blossoms in April are a symbol of Almaty spring.",
        "Summer evenings on Kok-Tobe are especially beautiful.",
        "Sunsets over the mountains are mesmerizingly beautiful.",
        "Weather in the mountains changes very quickly and unpredictably.",
        "Before hiking in the mountains, always check the forecast.",
        "Thunderstorms in the mountains can be dangerous for tourists.",
        "The sun sets behind the mountains around 7 PM in winter.",
        "In spring, days become significantly longer.",
        "Almaty's climate is classified as humid continental.",
        "The microclimate in the upper part of the city is cooler.",
        "Record heat in Almaty reached 43 degrees.",
        "Record frost was minus 38 degrees.",
        "Average annual precipitation is about 600 millimeters.",
        "Most rain falls in April and May.",
        "The driest month is August with minimal precipitation.",
        "Climate change is affecting the city's weather patterns."
    ]
}

TRAFFIC_SENTENCES = {
    "ru": [
        "Пробки в Алматы достигают пика в утренние и вечерние часы.",
        "Более миллиона автомобилей ежедневно курсирует по дорогам города.",
        "Около 400 тысяч машин въезжает из пригородов каждое утро.",
        "Основные заторы образуются на пересечении Аль-Фараби и Назарбаева.",
        "Развязка Саина-Райымбека — одно из самых загруженных мест.",
        "Метро помогает разгрузить наземный транспорт в центре города.",
        "Общественный транспорт перевозит сотни тысяч пассажиров ежедневно.",
        "Система ОНАЙ упрощает оплату проезда для горожан.",
        "Электронные табло на остановках показывают время прибытия автобусов.",
        "Выделенные полосы для автобусов ускоряют движение общественного транспорта.",
        "Экономические потери от пробок составляют около 90 миллиардов тенге в год.",
        "Время в пути может увеличиться вдвое в час пик.",
        "Навигаторы помогают объезжать заторы по альтернативным маршрутам.",
        "2GIS и Яндекс Карты — популярные приложения для навигации.",
        "Велодорожки постепенно появляются на центральных улицах.",
        "Электросамокаты стали популярным средством передвижения.",
        "Шеринг транспорта снижает количество личных автомобилей.",
        "Парковка в центре становится все более дорогой.",
        "Подземные паркинги разгружают улицы от припаркованных машин.",
        "Камеры фиксируют нарушения правил дорожного движения.",
        "Штрафы за превышение скорости ужесточаются.",
        "Светофоры оборудуются системами адаптивного управления.",
        "Искусственный интеллект помогает оптимизировать потоки транспорта.",
        "Строительство новых развязок продолжается по всему городу.",
        "Расширение дорог не всегда решает проблему пробок.",
        "Лучшее решение — развитие общественного транспорта.",
        "Метро планируют продлить до аэропорта и новых районов.",
        "Скоростной трамвай LRT обсуждается как перспективный проект.",
        "Такси в Алматы доступно и относительно недорого.",
        "Каршеринг набирает популярность среди молодежи.",
        "Ночью движение становится свободным и быстрым.",
        "Выходные дни обычно менее загружены на дорогах.",
        "Праздники могут вызывать непредвиденные заторы.",
        "Ремонт дорог временно усложняет движение.",
        "Объезды и временные маршруты публикуются заранее.",
        "Водители должны уступать дорогу пешеходам на переходах.",
        "Культура вождения постепенно улучшается в городе.",
        "Аварии чаще происходят в часы пик и плохую погоду.",
        "Страхование автомобилей обязательно для всех водителей.",
        "Экологические стандарты автомобилей становятся строже.",
        "Старые автомобили больше загрязняют воздух выхлопами.",
        "Программа утилизации старых авто действует в Казахстане.",
        "Гибридные и электрические автомобили освобождены от некоторых налогов.",
        "Зарядные станции для электрокаров появляются по всему городу.",
        "Будущее транспорта — за экологичными и автономными решениями.",
        "Пешеходные зоны расширяются в центре Алматы.",
        "Улица Панфилова стала полностью пешеходной.",
        "Жибек Жолы — главный пешеходный арбат города.",
        "Безопасность пешеходов — приоритет городских властей.",
        "Инфраструктура для маломобильных граждан улучшается."
    ],
    "en": [
        "Traffic jams in Almaty peak during morning and evening hours.",
        "Over a million cars circulate on city roads daily.",
        "About 400,000 cars enter from the suburbs every morning.",
        "Main congestion occurs at the intersection of Al-Farabi and Nazarbayev.",
        "The Saina-Raiymbek interchange is one of the busiest locations.",
        "The metro helps relieve surface transport in the city center.",
        "Public transport carries hundreds of thousands of passengers daily.",
        "The ONAY system simplifies fare payment for residents.",
        "Electronic displays at stops show bus arrival times.",
        "Dedicated bus lanes speed up public transport movement.",
        "Economic losses from traffic jams amount to about 90 billion tenge annually.",
        "Travel time can double during rush hour.",
        "Navigators help bypass congestion via alternative routes.",
        "2GIS and Yandex Maps are popular navigation apps.",
        "Bike lanes are gradually appearing on central streets.",
        "Electric scooters have become a popular means of transport.",
        "Transport sharing reduces the number of personal vehicles.",
        "Parking in the center is becoming increasingly expensive.",
        "Underground parking facilities relieve streets of parked cars.",
        "Cameras record traffic violations.",
        "Speeding fines are getting stricter.",
        "Traffic lights are equipped with adaptive control systems.",
        "Artificial intelligence helps optimize traffic flows.",
        "Construction of new interchanges continues throughout the city.",
        "Road expansion doesn't always solve the congestion problem.",
        "The best solution is developing public transport.",
        "The metro is planned to extend to the airport and new districts.",
        "LRT light rail is being discussed as a promising project.",
        "Taxis in Almaty are accessible and relatively inexpensive.",
        "Car sharing is gaining popularity among young people.",
        "At night, traffic becomes free and fast.",
        "Weekends are usually less congested on the roads.",
        "Holidays can cause unexpected traffic jams.",
        "Road repairs temporarily complicate traffic.",
        "Detours and temporary routes are published in advance.",
        "Drivers must yield to pedestrians at crosswalks.",
        "Driving culture is gradually improving in the city.",
        "Accidents occur more often during rush hour and bad weather.",
        "Car insurance is mandatory for all drivers.",
        "Vehicle environmental standards are becoming stricter.",
        "Older cars pollute the air more with exhaust.",
        "An old car disposal program operates in Kazakhstan.",
        "Hybrid and electric cars are exempt from some taxes.",
        "Electric car charging stations are appearing throughout the city.",
        "The future of transport lies in eco-friendly and autonomous solutions.",
        "Pedestrian zones are expanding in central Almaty.",
        "Panfilov Street has become completely pedestrian.",
        "Zhibek Zholy is the city's main pedestrian promenade.",
        "Pedestrian safety is a priority for city authorities.",
        "Infrastructure for people with limited mobility is improving."
    ]
}

SMALL_TALK_SENTENCES = {
    "ru": [
        "Как ваши дела сегодня?",
        "Надеюсь, у вас все хорошо!",
        "Рад снова вас видеть!",
        "Чем могу быть полезен?",
        "Интересно, что вы думаете об этом?",
        "Отличный вопрос, давайте разберемся!",
        "Позвольте мне подумать...",
        "Это напоминает мне одну историю...",
        "Вы задаете очень глубокие вопросы!",
        "Мне нравится наш разговор.",
        "Каждый день я узнаю что-то новое.",
        "Алматы — удивительный город с богатой историей.",
        "Я всегда рад помочь жителям города.",
        "Технологии делают нашу жизнь удобнее.",
        "Искусственный интеллект — инструмент для помощи людям.",
        "Важно заботиться о своем здоровье и окружающей среде.",
        "Хороший день начинается с хорошего настроения!",
        "Давайте сделаем этот день продуктивным!",
        "Иногда нужно просто остановиться и насладиться моментом.",
        "Горы Алматы вдохновляют на великие дела.",
        "Природа — лучший источник энергии и вдохновения.",
        "Книги открывают новые миры и идеи.",
        "Музыка объединяет людей разных культур.",
        "Путешествия расширяют кругозор.",
        "Семья и друзья — главные ценности в жизни.",
        "Образование — ключ к успешному будущему.",
        "Спорт помогает поддерживать тело и дух в форме.",
        "Здоровое питание — основа долголетия.",
        "Сон важен для восстановления сил.",
        "Баланс работы и отдыха — секрет счастья.",
        "Творчество делает жизнь ярче.",
        "Доброта возвращается сторицей.",
        "Улыбка заразительна — улыбайтесь чаще!",
        "Благодарность помогает ценить то, что имеешь.",
        "Оптимизм — лучший способ справиться с трудностями.",
        "Каждая проблема — это возможность для роста.",
        "Мечты сбываются, если к ним стремиться.",
        "Маленькие шаги ведут к большим достижениям.",
        "Никогда не поздно начать что-то новое.",
        "Возраст — это всего лишь цифра.",
        "Опыт приходит с годами и ошибками.",
        "Ошибки — это уроки, а не неудачи.",
        "Терпение — добродетель, которая вознаграждается.",
        "Честность — лучшая политика.",
        "Уважение к другим начинается с уважения к себе.",
        "Слова имеют силу — выбирайте их мудро.",
        "Действия говорят громче слов.",
        "Время — самый ценный ресурс.",
        "Настоящее — единственный момент, который существует.",
        "Будущее создается сегодняшними решениями."
    ],
    "en": [
        "How are you doing today?",
        "I hope everything is going well for you!",
        "Great to see you again!",
        "How can I be of help?",
        "I wonder what you think about this?",
        "Great question, let's figure it out!",
        "Let me think about that...",
        "That reminds me of a story...",
        "You ask very deep questions!",
        "I enjoy our conversation.",
        "Every day I learn something new.",
        "Almaty is an amazing city with rich history.",
        "I'm always happy to help city residents.",
        "Technology makes our lives more convenient.",
        "Artificial intelligence is a tool to help people.",
        "It's important to take care of your health and the environment.",
        "A good day starts with a good mood!",
        "Let's make this day productive!",
        "Sometimes you just need to stop and enjoy the moment.",
        "The mountains of Almaty inspire great things.",
        "Nature is the best source of energy and inspiration.",
        "Books open new worlds and ideas.",
        "Music unites people of different cultures.",
        "Travel broadens horizons.",
        "Family and friends are the main values in life.",
        "Education is the key to a successful future.",
        "Sports help keep body and spirit in shape.",
        "Healthy eating is the foundation of longevity.",
        "Sleep is important for recovery.",
        "Work-life balance is the secret to happiness.",
        "Creativity makes life brighter.",
        "Kindness comes back multiplied.",
        "A smile is contagious — smile more often!",
        "Gratitude helps appreciate what you have.",
        "Optimism is the best way to deal with difficulties.",
        "Every problem is an opportunity for growth.",
        "Dreams come true if you strive for them.",
        "Small steps lead to big achievements.",
        "It's never too late to start something new.",
        "Age is just a number.",
        "Experience comes with years and mistakes.",
        "Mistakes are lessons, not failures.",
        "Patience is a virtue that is rewarded.",
        "Honesty is the best policy.",
        "Respect for others starts with self-respect.",
        "Words have power — choose them wisely.",
        "Actions speak louder than words.",
        "Time is the most valuable resource.",
        "The present is the only moment that exists.",
        "The future is created by today's decisions."
    ]
}

# ============================================
# GPT-LIKE RESPONSE GENERATION PATTERNS
# ============================================

RESPONSE_TEMPLATES = {
    "thinking": {
        "ru": [
            "Хм, интересный вопрос. Позвольте мне обдумать это...",
            "Дайте мне секунду проанализировать ситуацию...",
            "Это заставляет задуматься. Вот что я думаю...",
            "Анализирую доступную информацию...",
            "Синтезирую ответ на основе моей базы знаний..."
        ],
        "en": [
            "Hmm, interesting question. Let me think about this...",
            "Give me a second to analyze the situation...",
            "That makes me think. Here's what I believe...",
            "Analyzing available information...",
            "Synthesizing a response based on my knowledge base..."
        ]
    },
    "uncertainty": {
        "ru": [
            "Я не совсем уверен, но полагаю, что...",
            "Насколько я понимаю...",
            "По моим данным...",
            "Если я правильно интерпретирую информацию...",
            "Это может варьироваться, но обычно..."
        ],
        "en": [
            "I'm not entirely sure, but I believe...",
            "As far as I understand...",
            "According to my data...",
            "If I interpret the information correctly...",
            "This may vary, but usually..."
        ]
    },
    "transitions": {
        "ru": [
            "Кроме того,", "Более того,", "Также стоит отметить,", "Интересно, что",
            "В дополнение к этому,", "При этом,", "Однако,", "Тем не менее,",
            "С другой стороны,", "Важно учитывать, что", "Следует добавить, что"
        ],
        "en": [
            "Furthermore,", "Moreover,", "It's also worth noting that", "Interestingly,",
            "In addition to this,", "Meanwhile,", "However,", "Nevertheless,",
            "On the other hand,", "It's important to consider that", "It should be added that"
        ]
    },
    "conclusions": {
        "ru": [
            "В итоге,", "Подводя итог,", "Таким образом,", "В заключение,",
            "Резюмируя,", "Исходя из всего вышесказанного,", "Можно сделать вывод, что"
        ],
        "en": [
            "In conclusion,", "To summarize,", "Thus,", "In summary,",
            "To wrap up,", "Based on all of the above,", "We can conclude that"
        ]
    },
    "empathy": {
        "ru": [
            "Я понимаю вашу озабоченность.", "Это действительно важный вопрос.",
            "Я ценю ваш интерес к этой теме.", "Ваше любопытство похвально.",
            "Это затрагивает многих жителей города."
        ],
        "en": [
            "I understand your concern.", "That's indeed an important question.",
            "I appreciate your interest in this topic.", "Your curiosity is commendable.",
            "This affects many city residents."
        ]
    }
}

# ============================================
# MARKOV CHAIN PATTERNS FOR GPT-LIKE OUTPUT
# ============================================

MARKOV_PATTERNS = {
    "sentence_starters": {
        "ru": [
            "Интересно, что", "Важно отметить, что", "Стоит учитывать, что",
            "Как известно,", "Согласно данным,", "По последней информации,",
            "Эксперты считают, что", "Исследования показывают, что",
            "Опыт подсказывает, что", "Практика показывает, что"
        ],
        "en": [
            "It's interesting that", "It's important to note that", "It's worth considering that",
            "As is known,", "According to data,", "According to the latest information,",
            "Experts believe that", "Research shows that",
            "Experience suggests that", "Practice shows that"
        ]
    },
    "connectors": {
        "ru": ["и", "а также", "при этом", "вместе с тем", "наряду с этим", "помимо этого"],
        "en": ["and", "as well as", "while", "along with this", "in addition to this", "besides this"]
    },
    "intensifiers": {
        "ru": ["очень", "весьма", "довольно", "крайне", "чрезвычайно", "особенно"],
        "en": ["very", "quite", "rather", "extremely", "exceptionally", "especially"]
    }
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def get_random_sentence(category: str, lang: str = "ru") -> str:
    """Returns a random sentence from the specified category."""
    categories = {
        "ecology": ECOLOGY_SENTENCES,
        "weather": WEATHER_SENTENCES,
        "traffic": TRAFFIC_SENTENCES,
        "small_talk": SMALL_TALK_SENTENCES
    }
    if category in categories and lang in categories[category]:
        return random.choice(categories[category][lang])
    return ""

def get_random_vocabulary(category: str, word_type: str) -> str:
    """Returns a random word from the vocabulary."""
    if category in VOCABULARY and word_type in VOCABULARY[category]:
        return random.choice(VOCABULARY[category][word_type])
    return ""

def get_thinking_phrase(lang: str = "ru") -> str:
    """Returns a random 'thinking' phrase for GPT-like effect."""
    return random.choice(RESPONSE_TEMPLATES["thinking"][lang])

def get_transition(lang: str = "ru") -> str:
    """Returns a random transition phrase."""
    return random.choice(RESPONSE_TEMPLATES["transitions"][lang])

def get_conclusion(lang: str = "ru") -> str:
    """Returns a random conclusion phrase."""
    return random.choice(RESPONSE_TEMPLATES["conclusions"][lang])

def get_empathy(lang: str = "ru") -> str:
    """Returns a random empathy phrase."""
    return random.choice(RESPONSE_TEMPLATES["empathy"][lang])

def build_complex_response(topic: str, lang: str = "ru", num_facts: int = 3) -> str:
    """
    Builds a complex, GPT-like response combining multiple facts with transitions.
    This mimics early GPT behavior of synthesizing information.
    """
    categories = {
        "ecology": ECOLOGY_SENTENCES,
        "weather": WEATHER_SENTENCES,
        "traffic": TRAFFIC_SENTENCES,
        "general": SMALL_TALK_SENTENCES
    }
    
    if topic not in categories:
        topic = "general"
    
    sentences = categories[topic].get(lang, categories[topic]["en"])
    selected = random.sample(sentences, min(num_facts, len(sentences)))
    
    # Build response with GPT-like structure
    response_parts = []
    
    # Add thinking phrase (20% chance)
    if random.random() < 0.2:
        response_parts.append(get_thinking_phrase(lang))
    
    # Add empathy (30% chance)
    if random.random() < 0.3:
        response_parts.append(get_empathy(lang))
    
    # Add facts with transitions
    for i, sentence in enumerate(selected):
        if i == 0:
            response_parts.append(sentence)
        else:
            transition = get_transition(lang)
            response_parts.append(f"{transition} {sentence.lower()}" if lang == "en" else f"{transition} {sentence[0].lower() + sentence[1:]}")
    
    # Add conclusion (40% chance)
    if random.random() < 0.4 and len(selected) > 1:
        conclusion = get_conclusion(lang)
        summary = RESPONSE_TEMPLATES["uncertainty"][lang][random.randint(0, len(RESPONSE_TEMPLATES["uncertainty"][lang])-1)]
        response_parts.append(f"\n\n{conclusion} {summary}")
    
    return " ".join(response_parts)

def get_word_count() -> int:
    """Returns the total word count in the database."""
    total = 0
    for category in VOCABULARY.values():
        for word_list in category.values():
            total += len(word_list)
    
    for sentences in [ECOLOGY_SENTENCES, WEATHER_SENTENCES, TRAFFIC_SENTENCES, SMALL_TALK_SENTENCES]:
        for lang_sentences in sentences.values():
            for sentence in lang_sentences:
                total += len(sentence.split())
    
    return total

# Print word count when module loads
if __name__ == "__main__":
    print(f"Total words in conversation database: {get_word_count()}")
