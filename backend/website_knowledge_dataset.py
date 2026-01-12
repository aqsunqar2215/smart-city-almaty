# Smart City Almaty - Website Knowledge Dataset
# Contains patterns about the website features, functions, and structure
# Plus scientific data about smart cities, urban planning, and technology

WEBSITE_KNOWLEDGE_DATASET = [
    # ==========================================
    # WEBSITE FEATURES & FUNCTIONS
    # ==========================================
    # Dashboard
    {"category": "CITY_INFO", "language": "en", "pattern": "what is smart city dashboard", "response": "The Smart City Dashboard is the main control center showing real-time city metrics: air quality, traffic, active sensors, and system health scores."},
    {"category": "CITY_INFO", "language": "en", "pattern": "dashboard features", "response": "The dashboard displays: City Health Score, Air Quality Index, Traffic Congestion levels, Active Sensors count, Emergency Alerts, and AI Query statistics."},
    {"category": "CITY_INFO", "language": "en", "pattern": "how to use dashboard", "response": "Navigate to the Dashboard page to see real-time city data. Cards show different metrics, and you can click on any for detailed information."},
    {"category": "CITY_INFO", "language": "en", "pattern": "city health score", "response": "The City Health Score (0-100) is calculated from air quality and traffic congestion. Higher scores indicate better overall city conditions."},
    {"category": "CITY_INFO", "language": "en", "pattern": "real time data", "response": "Our platform provides real-time data from 142+ sensors across Almaty, updating every few seconds for traffic, air quality, and emergency services."},
    
    # Transport Features
    {"category": "TRANSPORT", "language": "en", "pattern": "public transport page", "response": "The Public Transport page shows live bus and marshrutka locations, route information, occupancy levels, and eco-friendly transport stats."},
    {"category": "TRANSPORT", "language": "en", "pattern": "bus tracking feature", "response": "Our bus tracking shows real-time locations of 36+ bus routes and 10+ marshrutka routes with occupancy data and ETA calculations."},
    {"category": "TRANSPORT", "language": "en", "pattern": "eco routing", "response": "The Eco Routing feature calculates the most environmentally friendly routes, showing CO2 savings and tree equivalents for each journey."},
    {"category": "TRANSPORT", "language": "en", "pattern": "onay card system", "response": "Onay is Almaty's electronic payment system for public transport. You can check balance and usage through our transport tracking features."},
    {"category": "TRANSPORT", "language": "en", "pattern": "transport statistics", "response": "We track CO2 saved by public transport usage, number of electric buses active, and daily ridership estimates across the city."},
    {"category": "TRANSPORT", "language": "en", "pattern": "traffic congestion monitoring", "response": "Our traffic API monitors congestion levels 1-10, average speeds, and incident counts based on time of day and historical patterns."},
    
    # Emergency Services
    {"category": "CITY_INFO", "language": "en", "pattern": "emergency services page", "response": "The Emergency Services page displays real-time locations of police, ambulance, and fire units, plus active incidents and safety scores."},
    {"category": "CITY_INFO", "language": "en", "pattern": "sos button feature", "response": "The SOS button allows users to broadcast emergency alerts with their location. It immediately creates a CRITICAL incident in the system."},
    {"category": "CITY_INFO", "language": "en", "pattern": "incident tracking", "response": "We track emergency incidents including type (fire, accident, medical), severity level, status, and assigned response units."},
    {"category": "CITY_INFO", "language": "en", "pattern": "safety score", "response": "The city safety score is calculated based on active incidents. Fewer incidents = higher score. 80+ is NORMAL, 60-80 is ELEVATED, below 60 is CRITICAL."},
    {"category": "CITY_INFO", "language": "en", "pattern": "emergency response time", "response": "Our system tracks average emergency response time, currently averaging 8.4 minutes across all emergency services in Almaty."},
    
    # Air Quality & Ecology
    {"category": "ECOLOGY", "language": "en", "pattern": "air quality monitoring", "response": "We fetch real-time air quality from Open-Meteo API, showing European AQI, PM2.5, PM10, NO2, and Ozone levels for Almaty."},
    {"category": "ECOLOGY", "language": "en", "pattern": "aqi index meaning", "response": "AQI (Air Quality Index): 0-50 is Good, 51-100 Moderate, 101-150 Unhealthy for Sensitive Groups, 151-200 Unhealthy, 201-300 Very Unhealthy."},
    {"category": "ECOLOGY", "language": "en", "pattern": "pm25 levels", "response": "PM2.5 are fine particles that can penetrate lungs. We monitor these in real-time. Almaty levels vary 10-80 depending on season and weather."},
    {"category": "ECOLOGY", "language": "en", "pattern": "pollution sources almaty", "response": "Main pollution sources in Almaty: vehicle emissions, coal heating in winter, industrial activity, and geographical factors (mountain basin traps smog)."},
    {"category": "ECOLOGY", "language": "en", "pattern": "environmental sensors", "response": "Our platform connects to environmental sensors measuring air quality, temperature, humidity, and atmospheric pressure across the city."},
    {"category": "ECOLOGY", "language": "en", "pattern": "current smog level", "response": "Smog levels are tracked via our AQI sensors. Check the Dashboard for real-time visibility and pollution scores."},
    {"category": "ECOLOGY", "language": "en", "pattern": "is air clean today", "response": "I can check the latest air quality data for you. Current AQI suggests the air quality is within historical norms."},
    {"category": "ECOLOGY", "language": "en", "pattern": "dirty air in almaty", "response": "Smog is a significant challenge in Almaty. Our system provides data to help you avoid peak pollution hours."},
    {"category": "ECOLOGY", "language": "en", "pattern": "haze and smoke", "response": "Haze in the city is often caused by temperature inversion and accumulated surface emissions. We monitor particulate matter continuously."},
    {"category": "ECOLOGY", "language": "en", "pattern": "ecology metrics", "response": "Ecology metrics include PM2.5, PM10, NOx, and general AQI levels. You can see these on the Environmental analytics page."},
    {"category": "ECOLOGY", "language": "en", "pattern": "green initiatives", "response": "Almaty is implementing green belts and transition to gas heating for private homes to reduce the smog problem."},
    
    # User Features
    {"category": "CITY_INFO", "language": "en", "pattern": "user registration", "response": "Register with email and password to access personalized features: report filing, petition voting, and activity history tracking."},
    {"category": "CITY_INFO", "language": "en", "pattern": "citizen reports", "response": "Citizens can file reports about city issues: roads, lighting, sanitation. Reports are tracked with status (PENDING, IN_PROGRESS, RESOLVED) and AI analysis."},
    {"category": "CITY_INFO", "language": "en", "pattern": "petition system", "response": "The petition system allows citizens to create and vote on city initiatives. Popular petitions are shown sorted by votes."},
    {"category": "CITY_INFO", "language": "en", "pattern": "profile page features", "response": "Your profile shows: join date, reports filed, resolved issues, AI consultations, reputation score, and complete activity history."},
    {"category": "CITY_INFO", "language": "en", "pattern": "activity history", "response": "We track all user actions: registrations, logins, reports filed, AI queries - accessible through your profile page."},
    
    # AI Features
    {"category": "CHAT", "language": "en", "pattern": "neural nexus ai", "response": "Neural Nexus is our hybrid AI system combining neural network intent classification with a rich knowledge base about Almaty city."},
    {"category": "CHAT", "language": "en", "pattern": "ai capabilities", "response": "Our AI can: answer city questions, classify query intent, provide real-time sensor data, analyze images, and maintain conversation history."},
    {"category": "CHAT", "language": "en", "pattern": "how does ai work", "response": "The AI uses a trained MLP neural network for intent classification, then retrieves relevant information from our knowledge base and sensor data."},
    {"category": "CHAT", "language": "en", "pattern": "ai vision feature", "response": "The AI Vision feature can analyze images to identify city issues like potholes, broken lights, or traffic problems using computer vision."},
    {"category": "CHAT", "language": "en", "pattern": "conversation history", "response": "The AI maintains conversation history within a session. You can clear history anytime through the API or interface."},
    {"category": "CHAT", "language": "en", "pattern": "ai forecast", "response": "Our AI engine predicts city state for the next 3 hours: traffic patterns, air quality trends, with confidence percentages."},
    
    # Technical Infrastructure
    {"category": "CITY_INFO", "language": "en", "pattern": "tech stack", "response": "Our platform uses: FastAPI backend, React frontend, SQLite database, PyTorch neural networks, and real-time API integrations."},
    {"category": "CITY_INFO", "language": "en", "pattern": "api endpoints", "response": "Key APIs: /api/ai/analyze (AI chat), /api/transport/buses (bus tracking), /api/sensors/qa (air quality), /api/emergency/* (emergency services)."},
    {"category": "CITY_INFO", "language": "en", "pattern": "database structure", "response": "We store: Users, ActivityLogs, CitizenReports, SensorReadings, EmergencyIncidents, BusLocations, AIKnowledge, EmergencyUnits, Petitions."},
    {"category": "CITY_INFO", "language": "en", "pattern": "sensor network", "response": "142+ active sensors monitor Almaty: air quality stations, traffic cameras, weather stations, and emergency response trackers."},
    {"category": "CITY_INFO", "language": "en", "pattern": "data sources", "response": "Data comes from: Open-Meteo API (air quality/weather), simulated sensor networks, user reports, and municipal data feeds."},
    
    # Pages Overview
    {"category": "CITY_INFO", "language": "en", "pattern": "website pages", "response": "Main pages: Dashboard, Public Transport, Emergency Services, Eco Routing, Infrastructure, Analytics, Profile, Admin Panel, and more."},
    {"category": "CITY_INFO", "language": "en", "pattern": "analytics page", "response": "The Analytics page shows city statistics: total reports, active users, AI metrics, topic distribution, and infrastructure health scores."},
    {"category": "CITY_INFO", "language": "en", "pattern": "admin panel", "response": "The Admin Panel (for authorized users) shows all registered users, system logs, and administrative controls."},
    {"category": "CITY_INFO", "language": "en", "pattern": "infrastructure page", "response": "The Infrastructure page displays city systems: power grid stability, water treatment quality, transit punctuality, and emergency contacts."},
    {"category": "CITY_INFO", "language": "en", "pattern": "public control page", "response": "Public Control shows citizen petitions, community initiatives, and allows voting on city improvement proposals."},
    
    # ==========================================
    # SMART CITY SCIENCE & TECHNOLOGY
    # ==========================================
    {"category": "SCIENCE", "language": "en", "pattern": "what is smart city", "response": "A smart city uses IoT sensors, data analytics, and AI to improve urban services, sustainability, and quality of life for citizens."},
    {"category": "SCIENCE", "language": "en", "pattern": "iot internet of things", "response": "IoT (Internet of Things) connects physical devices with sensors to the internet, enabling real-time data collection and automated responses."},
    {"category": "SCIENCE", "language": "en", "pattern": "urban planning technology", "response": "Modern urban planning uses GIS mapping, traffic simulation, population modeling, and AI to optimize city development and resource allocation."},
    {"category": "SCIENCE", "language": "en", "pattern": "machine learning cities", "response": "Machine learning in cities predicts traffic patterns, optimizes energy usage, detects anomalies in infrastructure, and improves emergency response."},
    {"category": "SCIENCE", "language": "en", "pattern": "neural networks explained", "response": "Neural networks are computing systems inspired by biological brains. They learn patterns from data through connected layers of artificial neurons."},
    {"category": "SCIENCE", "language": "en", "pattern": "deep learning", "response": "Deep learning uses multi-layer neural networks to learn complex patterns. Used in image recognition, natural language processing, and prediction."},
    {"category": "SCIENCE", "language": "en", "pattern": "artificial intelligence urban", "response": "AI in urban environments: traffic optimization, predictive maintenance, crime prediction, resource allocation, and citizen service automation."},
    {"category": "SCIENCE", "language": "en", "pattern": "big data analytics", "response": "Big data analytics processes massive datasets to find patterns. Smart cities generate terabytes daily from sensors, cameras, and user interactions."},
    {"category": "SCIENCE", "language": "en", "pattern": "edge computing", "response": "Edge computing processes data near its source (sensors) rather than sending everything to central servers, reducing latency and bandwidth."},
    {"category": "SCIENCE", "language": "en", "pattern": "5g smart city", "response": "5G enables smart cities with ultra-fast, low-latency connections for autonomous vehicles, real-time monitoring, and massive IoT deployments."},
    
    # Environmental Science
    {"category": "SCIENCE", "language": "en", "pattern": "air pollution science", "response": "Air pollution consists of particulate matter (PM), nitrogen oxides (NOx), ozone (O3), carbon monoxide (CO), and volatile organic compounds (VOCs)."},
    {"category": "SCIENCE", "language": "en", "pattern": "climate change cities", "response": "Cities produce 70% of global CO2 emissions. Smart cities reduce this through efficient transport, green buildings, and renewable energy integration."},
    {"category": "SCIENCE", "language": "en", "pattern": "urban heat island", "response": "Urban Heat Island effect: cities are warmer than surrounding areas due to concrete, asphalt, and reduced vegetation. Green spaces help mitigate this."},
    {"category": "SCIENCE", "language": "en", "pattern": "sustainable transport", "response": "Sustainable transport includes electric vehicles, public transit, cycling infrastructure, and car-sharing to reduce emissions and congestion."},
    {"category": "SCIENCE", "language": "en", "pattern": "carbon footprint", "response": "Carbon footprint measures total greenhouse gas emissions. Smart cities track and reduce footprints through monitoring and optimization."},
    {"category": "SCIENCE", "language": "en", "pattern": "renewable energy cities", "response": "Smart cities integrate solar panels, wind turbines, and smart grids to reduce dependence on fossil fuels and improve energy efficiency."},
    {"category": "SCIENCE", "language": "en", "pattern": "water management smart", "response": "Smart water management uses sensors to detect leaks, monitor quality, and optimize distribution, reducing waste by up to 30%."},
    {"category": "SCIENCE", "language": "en", "pattern": "waste management iot", "response": "IoT-enabled waste management uses sensors in bins to optimize collection routes, reducing costs and emissions from garbage trucks."},
    
    # Urban Planning & Architecture
    {"category": "SCIENCE", "language": "en", "pattern": "urban density planning", "response": "Urban density planning balances population concentration with infrastructure capacity. Higher density can improve transit efficiency but requires careful design."},
    {"category": "SCIENCE", "language": "en", "pattern": "mixed use development", "response": "Mixed-use development combines residential, commercial, and recreational spaces, reducing commute times and creating vibrant neighborhoods."},
    {"category": "SCIENCE", "language": "en", "pattern": "transit oriented development", "response": "TOD (Transit-Oriented Development) concentrates housing and commerce around public transit hubs, reducing car dependency."},
    {"category": "SCIENCE", "language": "en", "pattern": "green building standards", "response": "Green buildings (LEED, BREEAM certified) minimize environmental impact through energy efficiency, sustainable materials, and smart systems."},
    {"category": "SCIENCE", "language": "en", "pattern": "walkability score", "response": "Walkability measures how friendly an area is to walking. High scores indicate good pedestrian infrastructure, mixed uses, and safety."},
    {"category": "SCIENCE", "language": "en", "pattern": "public space design", "response": "Effective public spaces encourage social interaction, provide green areas, and are accessible to all citizens regardless of ability."},
    
    # Data Science & Analytics
    {"category": "SCIENCE", "language": "en", "pattern": "data visualization", "response": "Data visualization transforms complex data into charts, maps, and dashboards that help decision-makers understand city patterns quickly."},
    {"category": "SCIENCE", "language": "en", "pattern": "predictive analytics", "response": "Predictive analytics uses historical data and ML to forecast future events: traffic jams, equipment failures, or emergency incidents."},
    {"category": "SCIENCE", "language": "en", "pattern": "real time monitoring", "response": "Real-time monitoring systems collect and analyze data continuously, enabling immediate response to changing conditions."},
    {"category": "SCIENCE", "language": "en", "pattern": "sensor fusion", "response": "Sensor fusion combines data from multiple sensors (cameras, GPS, air quality) to create a comprehensive picture of city conditions."},
    {"category": "SCIENCE", "language": "en", "pattern": "geospatial analysis", "response": "Geospatial analysis maps data to locations, revealing patterns like crime hotspots, traffic bottlenecks, or pollution clusters."},
    {"category": "SCIENCE", "language": "en", "pattern": "time series analysis", "response": "Time series analysis examines data over time to identify trends, seasonality, and anomalies in city metrics."},
    
    # Cybersecurity & Privacy
    {"category": "SCIENCE", "language": "en", "pattern": "smart city security", "response": "Smart city cybersecurity protects critical infrastructure: traffic systems, power grids, and emergency services from cyber attacks."},
    {"category": "SCIENCE", "language": "en", "pattern": "data privacy smart city", "response": "Privacy in smart cities requires balancing data collection for services with protecting citizen personal information through anonymization and consent."},
    {"category": "SCIENCE", "language": "en", "pattern": "encryption data protection", "response": "Encryption protects data in transit and at rest. Smart cities use TLS, end-to-end encryption, and secure protocols."},
    
    # Transportation Science
    {"category": "SCIENCE", "language": "en", "pattern": "traffic flow theory", "response": "Traffic flow theory studies vehicle movement patterns. Key concepts: flow rate, density, speed relationships, and shockwave propagation."},
    {"category": "SCIENCE", "language": "en", "pattern": "intelligent transport systems", "response": "ITS (Intelligent Transport Systems) use technology to improve transport: adaptive signals, dynamic routing, and incident detection."},
    {"category": "SCIENCE", "language": "en", "pattern": "autonomous vehicles", "response": "Autonomous vehicles use sensors, AI, and mapping to navigate without human input. Levels range from driver assistance (L1) to full automation (L5)."},
    {"category": "SCIENCE", "language": "en", "pattern": "traffic signal optimization", "response": "Smart traffic signals adapt timing based on real-time traffic flow, reducing wait times and emissions by up to 25%."},
    {"category": "SCIENCE", "language": "en", "pattern": "multimodal transport", "response": "Multimodal transport integrates different modes (bus, metro, bike, walk) into seamless journeys with unified payment and information."},
    {"category": "SCIENCE", "language": "en", "pattern": "last mile delivery", "response": "Last mile delivery is the final leg of goods transport. Smart cities optimize with drones, lockers, and electric vehicles."},
    
    # ==========================================
    # ALMATY SPECIFIC KNOWLEDGE
    # ==========================================
    {"category": "GEOGRAPHY", "language": "en", "pattern": "almaty location", "response": "Almaty is located in southeastern Kazakhstan at the foot of the Trans-Ili Alatau mountains, at an elevation of 700-900 meters."},
    {"category": "GEOGRAPHY", "language": "en", "pattern": "almaty population", "response": "Almaty has a population of approximately 2 million people, making it the largest city in Kazakhstan."},
    {"category": "GEOGRAPHY", "language": "en", "pattern": "almaty climate", "response": "Almaty has a humid continental climate with cold winters (-15°C average) and warm summers (25°C average). Mountains create a unique microclimate."},
    {"category": "GEOGRAPHY", "language": "en", "pattern": "almaty districts", "response": "Almaty has 8 districts: Almaly, Auezov, Bostandyk, Zhetysu, Medeu, Nauryzbay, Turksib, and Alatau."},
    {"category": "GEOGRAPHY", "language": "en", "pattern": "almaty coordinates", "response": "Almaty is located at 43.2389°N latitude, 76.8897°E longitude, in the UTC+5 timezone."},
    
    {"category": "HISTORY", "language": "en", "pattern": "almaty founding", "response": "Almaty was founded as the fortress Verny in 1854 by Russian Empire. It became Alma-Ata in 1921 and was renamed Almaty in 1993."},
    {"category": "HISTORY", "language": "en", "pattern": "almaty capital history", "response": "Almaty was the capital of Kazakhstan from 1929 to 1997, when the capital moved to Astana (now Nur-Sultan)."},
    {"category": "HISTORY", "language": "en", "pattern": "1911 earthquake almaty", "response": "The 1911 Kebin earthquake (magnitude 7.7) destroyed most of Almaty. Zenkov Cathedral survived due to its flexible wooden construction."},
    {"category": "HISTORY", "language": "en", "pattern": "silk road almaty", "response": "The region around Almaty was part of the ancient Silk Road trade route connecting China to the Mediterranean."},
    {"category": "HISTORY", "language": "en", "pattern": "apple origin almaty", "response": "Almaty means 'father of apples'. The region is the genetic origin of the domestic apple (Malus sieversii)."},
    
    {"category": "CULTURE", "language": "en", "pattern": "kazakh cuisine", "response": "Traditional Kazakh dishes include beshbarmak (boiled meat with noodles), baursak (fried dough), kumys (fermented mare's milk), and shubat (camel milk)."},
    {"category": "CULTURE", "language": "en", "pattern": "nauryz festival", "response": "Nauryz (March 21) is the Kazakh New Year, celebrating spring equinox with traditional food, music, and games."},
    {"category": "CULTURE", "language": "en", "pattern": "kazakh traditions", "response": "Kazakh traditions include hospitality (guests are honored), dastarkhan (table full of food), and respect for elders."},
    {"category": "CULTURE", "language": "en", "pattern": "almaty arts scene", "response": "Almaty has vibrant arts: Central State Museum, Kasteyev Art Museum, Opera House, and numerous theaters and galleries."},
    
    {"category": "SIGHTS", "language": "en", "pattern": "medeu ice rink", "response": "Medeu is the world's highest Olympic ice rink at 1,691 meters elevation. It hosted speed skating championships and can accommodate 10,000 spectators."},
    {"category": "SIGHTS", "language": "en", "pattern": "shymbulak ski resort", "response": "Shymbulak is Almaty's premier ski resort at 2,260-3,163m elevation. Accessible by cable car from Medeu."},
    {"category": "SIGHTS", "language": "en", "pattern": "kok tobe hill", "response": "Kok-Tobe (Green Hill) is Almaty's landmark with TV tower, cable car, entertainment complex, and panoramic city views."},
    {"category": "SIGHTS", "language": "en", "pattern": "zenkov cathedral", "response": "Zenkov Cathedral (Ascension Cathedral) is a wooden Russian Orthodox church built in 1907, one of the world's tallest wooden buildings."},
    {"category": "SIGHTS", "language": "en", "pattern": "big almaty lake", "response": "Big Almaty Lake is a glacial lake at 2,511m elevation, known for its changing colors from turquoise to deep blue."},
    {"category": "SIGHTS", "language": "en", "pattern": "charyn canyon", "response": "Charyn Canyon is 200km from Almaty, often compared to Grand Canyon. The Valley of Castles features stunning rock formations."},
    {"category": "SIGHTS", "language": "en", "pattern": "green bazaar almaty", "response": "Green Bazaar (Zelyony Bazar) is Almaty's main market since 1875, selling local produce, spices, dried fruits, and traditional goods."},
    {"category": "SIGHTS", "language": "en", "pattern": "panfilov park", "response": "28 Panfilov Guardsmen Park honors WWII heroes. Contains Zenkov Cathedral, War Memorial, and eternal flame."},
    {"category": "SIGHTS", "language": "en", "pattern": "best places today", "response": "Today is a great day to visit the mountains or the botanical garden. Any outdoor sight would be perfect!"},
    {"category": "ECOLOGY", "language": "en", "pattern": "pollution today", "response": "Checking current pollution levels... The smog seems moderate today based on real-time sensor data."},
    {"category": "TRANSPORT", "language": "en", "pattern": "traffic today", "response": "Current traffic density is being monitored. Peak congestion usually occurs between 8-10 AM and 6-8 PM today."},
]

# Additional scientific patterns
SCIENCE_EXTENDED = [
    # Physics & Engineering
    {"category": "SCIENCE", "language": "en", "pattern": "sensors how they work", "response": "Sensors convert physical phenomena (temperature, pressure, light) into electrical signals that can be measured and processed digitally."},
    {"category": "SCIENCE", "language": "en", "pattern": "gps satellite navigation", "response": "GPS uses 24+ satellites orbiting Earth. Receivers calculate position by measuring signal travel time from multiple satellites."},
    {"category": "SCIENCE", "language": "en", "pattern": "lidar technology", "response": "LiDAR (Light Detection and Ranging) uses laser pulses to create 3D maps of environments. Used in autonomous vehicles and urban mapping."},
    {"category": "SCIENCE", "language": "en", "pattern": "radar systems", "response": "Radar uses radio waves to detect objects, measuring distance, speed, and direction. Used in traffic monitoring and weather prediction."},
    {"category": "SCIENCE", "language": "en", "pattern": "electric vehicle technology", "response": "EVs use lithium-ion batteries, electric motors, and regenerative braking. Range: 200-500km. Charging: Level 1 (slow) to Level 3 (fast)."},
    {"category": "SCIENCE", "language": "en", "pattern": "solar panel efficiency", "response": "Modern solar panels achieve 15-22% efficiency. Monocrystalline (most efficient), polycrystalline, and thin-film types exist."},
    {"category": "SCIENCE", "language": "en", "pattern": "led lighting technology", "response": "LED lights are 75% more efficient than incandescent, last 25x longer, and smart LEDs can adjust brightness and color automatically."},
    {"category": "SCIENCE", "language": "en", "pattern": "smart grid technology", "response": "Smart grids use digital communication to detect and react to local changes in usage, improving efficiency and reliability."},
    
    # Computer Science
    {"category": "SCIENCE", "language": "en", "pattern": "api application programming interface", "response": "APIs allow software systems to communicate. REST APIs use HTTP methods (GET, POST, PUT, DELETE) to exchange data in JSON format."},
    {"category": "SCIENCE", "language": "en", "pattern": "database systems", "response": "Databases store structured data. SQL databases (PostgreSQL, MySQL) use tables; NoSQL (MongoDB) use documents or key-value pairs."},
    {"category": "SCIENCE", "language": "en", "pattern": "cloud computing", "response": "Cloud computing provides on-demand computing resources (servers, storage, databases) over the internet. Examples: AWS, Azure, GCP."},
    {"category": "SCIENCE", "language": "en", "pattern": "microservices architecture", "response": "Microservices split applications into small, independent services that communicate via APIs. Easier to scale and maintain."},
    {"category": "SCIENCE", "language": "en", "pattern": "containerization docker", "response": "Containers package applications with dependencies for consistent deployment. Docker is the most popular containerization platform."},
    {"category": "SCIENCE", "language": "en", "pattern": "natural language processing", "response": "NLP enables computers to understand human language. Techniques: tokenization, stemming, sentiment analysis, named entity recognition."},
    {"category": "SCIENCE", "language": "en", "pattern": "computer vision", "response": "Computer vision enables machines to interpret images. Used for object detection, facial recognition, and autonomous navigation."},
    {"category": "SCIENCE", "language": "en", "pattern": "reinforcement learning", "response": "Reinforcement learning trains agents through trial and error, receiving rewards for good actions. Used in game AI and robotics."},
    
    # Statistics & Mathematics
    {"category": "SCIENCE", "language": "en", "pattern": "statistics data analysis", "response": "Statistics analyzes data using measures like mean, median, standard deviation, and correlation to find patterns and make predictions."},
    {"category": "SCIENCE", "language": "en", "pattern": "probability theory", "response": "Probability measures likelihood of events (0 to 1). Used in risk assessment, prediction models, and machine learning algorithms."},
    {"category": "SCIENCE", "language": "en", "pattern": "regression analysis", "response": "Regression finds relationships between variables. Linear regression predicts continuous values; logistic regression predicts categories."},
    {"category": "SCIENCE", "language": "en", "pattern": "optimization algorithms", "response": "Optimization finds best solutions from available options. Gradient descent, genetic algorithms, and linear programming are common methods."},
    
    # Environmental Science Extended
    {"category": "SCIENCE", "language": "en", "pattern": "greenhouse effect", "response": "Greenhouse gases (CO2, methane, N2O) trap heat in atmosphere. Human activities have increased concentrations, causing global warming."},
    {"category": "SCIENCE", "language": "en", "pattern": "biodiversity urban", "response": "Urban biodiversity includes plants, animals, and microorganisms in cities. Green corridors and parks support urban ecosystems."},
    {"category": "SCIENCE", "language": "en", "pattern": "noise pollution", "response": "Noise pollution from traffic and industry affects health: stress, sleep disturbance, hearing loss. Smart cities monitor and mitigate noise."},
    {"category": "SCIENCE", "language": "en", "pattern": "light pollution", "response": "Artificial light at night disrupts ecosystems, wastes energy, and reduces stargazing. Smart lighting reduces light pollution."},
    {"category": "SCIENCE", "language": "en", "pattern": "circular economy", "response": "Circular economy minimizes waste through reuse, recycling, and regeneration. Smart cities enable resource tracking and optimization."},
]

# Combine all website knowledge
WEBSITE_DATASET = WEBSITE_KNOWLEDGE_DATASET + SCIENCE_EXTENDED
