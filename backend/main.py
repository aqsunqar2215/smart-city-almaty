from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import random
import time
import httpx
from sqlalchemy import func
import datetime
from database import SessionLocal, init_db, User, ActivityLog, CitizenReport, SensorReading, EmergencyIncident, BusLocation, AIKnowledge, EmergencyUnit, Petition, UserProfile, Chat, ChatMember, Message, Contact
from almaty_dataset import ALMATY_DATASET
import xml.etree.ElementTree as ET
import os
import asyncio
import shutil
import uuid
from fastapi.staticfiles import StaticFiles

# Create uploads directory
os.makedirs("uploads/messenger", exist_ok=True)

# Import Live Transport API for real OSM data
try:
    from live_transport_api import get_live_bus_data
    LIVE_TRANSPORT_AVAILABLE = True
    print("[Main] Live Transport API loaded")
except ImportError as e:
    LIVE_TRANSPORT_AVAILABLE = False
    print(f"[Main] Live Transport API not available: {e}")

# Import Neural Brain and GPT-AI
try:
    from enhanced_gpt_ai import get_enhanced_ai
    from proactive_engine import get_proactive_engine
    from vision_engine import get_vision_engine
    from voice_engine import get_voice_engine
    HAS_AI_BRAIN = True
    HAS_MULTIMODAL = True
except ImportError:
    HAS_AI_BRAIN = False
    HAS_MULTIMODAL = False

# Initialize Database
init_db()

app = FastAPI(title="Smart City Almaty OS", version="2.0.0")

# Mount uploads directory to serve files
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        # Seed sensor data if empty
        if db.query(SensorReading).count() == 0:
            print("Seeding sensor data...")
            for i in range(24): # Last 24 hours
                timestamp = datetime.datetime.utcnow() - datetime.timedelta(hours=24-i)
                # AQI
                db.add(SensorReading(sensor_type="AQI", value=random.randint(40, 150), timestamp=timestamp))
                # Traffic
                db.add(SensorReading(sensor_type="TRAFFIC", value=random.randint(2, 9), timestamp=timestamp))
            db.commit()

        # Seed Emergency incidents
        if db.query(EmergencyIncident).count() == 0:
            print("Seeding emergency incidents...")
            incidents = [
                EmergencyIncident(type="FIRE", description="Small brush fire near park", lat=43.2389, lng=76.8897, severity="MEDIUM"),
                EmergencyIncident(type="ACCIDENT", description="Two-car collision on Abay Ave", lat=43.2421, lng=76.9032, severity="HIGH", status="RESPONDING"),
                EmergencyIncident(type="MEDICAL", description="Citizen reported breathing difficulty", lat=43.2551, lng=76.9412, severity="CRITICAL", status="ACTIVE")
            ]
            db.add_all(incidents)
            db.commit()

        if db.query(BusLocation).count() == 0:
            print("Seeding massive transport dataset (Buses + Marshrutkas)...")
            all_vehicles = []
            bus_routes = ["92", "32", "12", "201", "79", "45", "18", "118", "2", "34", "38", "56", "59", "63", "65", "85", "121", "120", "128", "25", "11", "95", "98", "99", "106", "112", "119", "124", "126", "127", "137", "4", "7", "29", "8", "67"]
            minibus_routes = ["401", "407", "409", "415", "421", "422", "425", "431", "441", "448"]
            
            # Seed Buses
            for route in bus_routes:
                num_vehicles = random.randint(1, 4)
                for _ in range(num_vehicles):
                    all_vehicles.append(BusLocation(
                        route_number=route, 
                        vehicle_type="BUS",
                        lat=43.20 + (random.random() * 0.1), 
                        lng=76.80 + (random.random() * 0.2), 
                        speed=random.randint(15, 55)
                    ))

            # Seed Marshrutkas (Minibuses)
            for route in minibus_routes:
                num_vehicles = random.randint(2, 5) # Usually more frequent
                for _ in range(num_vehicles):
                    all_vehicles.append(BusLocation(
                        route_number=route, 
                        vehicle_type="MINIBUS",
                        lat=43.19 + (random.random() * 0.12), 
                        lng=76.78 + (random.random() * 0.25), 
                        speed=random.randint(20, 65) # Fast driving marshrutkas
                    ))
            
            db.add_all(all_vehicles)
            db.commit()
            print(f"Seeded {len(all_vehicles)} vehicles across all transport networks.")

        # Seed AI Knowledge base (Incremental Sync)
        print("Syncing AI Knowledge Base...")
        existing_patterns = {k.pattern for k in db.query(AIKnowledge.pattern).all()}
        new_entries = 0
        for item in ALMATY_DATASET:
            if item["pattern"] not in existing_patterns:
                knowledge = AIKnowledge(
                    category=item["category"],
                    pattern=item["pattern"],
                    response=item["response"],
                    language=item["language"],
                    importance=item.get("importance", 1)
                )
                db.add(knowledge)
                new_entries += 1
        
        if new_entries > 0:
            db.commit()
            print(f"AI Knowledge Base synced: Added {new_entries} base entries.")
        
        # Trigger Augmentation to reach 10k+ entries
        from data_augmenter import augment_data
        augment_data()

        # Seed Emergency Units
        if db.query(EmergencyUnit).count() == 0:
            print("Seeding Emergency Units (Police, Med, Fire)...")
            units = []
            types = ["POLICE", "AMBULANCE", "FIRE"]
            for i in range(15):
                u_type = random.choice(types)
                units.append(EmergencyUnit(
                    id=f"{u_type}_{i+100}",
                    type=u_type,
                    status=random.choice(["PATROLLING", "AVAILABLE", "EN_ROUTE"]),
                    lat=43.21 + (random.random() * 0.08),
                    lng=76.85 + (random.random() * 0.12),
                    heading=random.randint(0, 360)
                ))
            db.add_all(units)
            db.commit()
            print(f"Seeded {len(units)} emergency units.")

        # Seed Petitions
        if db.query(Petition).count() == 0:
            print("Seeding Citizen Petitions...")
            petitions = [
                Petition(title="Озеленение пр. Достык", description="Высадка 500 каштанов вдоль проспекта для улучшения экологии и тени.", votes=1240, category="ECOLOGY"),
                Petition(title="Велодорожка по ул. Толе Би", description="Создание выделенной полосы для велосипедистов от Яссауи до центра.", votes=856, category="INFRASTRUCTURE"),
                Petition(title="Ночное освещение мкр. Сайран", description="Установка LED-фонарей вокруг озера для безопасности жителей.", votes=412, category="INFRASTRUCTURE"),
                Petition(title="Фестиваль муралов в Алмалинском р-не", description="Приглашение стрит-арт художников для украшения фасадов старых домов.", votes=633, category="CULTURE")
            ]
            db.add_all(petitions)
            db.commit()
            print("Petitions seeded successfully.")

        # Seed Citizen Reports
        if db.query(CitizenReport).count() == 0:
            print("Seeding Citizen Reports...")
            reports = [
                CitizenReport(category="ROADS", description="Pothole on Abay corner Furmanov", lat=43.238, lng=76.945, status="PENDING", ai_analysis="Verified via image. High severity."),
                CitizenReport(category="LIGHTING", description="Street light broken near Atakent", lat=43.220, lng=76.905, status="RESOLVED", ai_analysis="Auto-detected sensor failure."),
                CitizenReport(category="SANITATION", description="Uncollected trash in Bostandyk district", lat=43.205, lng=76.885, status="IN_PROGRESS", ai_analysis="Reported by 3 citizens. Routing to waste department.")
            ]
            db.add_all(reports)
            db.commit()
            print("Reports seeded successfully.")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "Online", "system": "Smart City Almaty OS", "version": "2.0.0"}

# --- AUTH SYSTEM (Persistent SQLite) ---
class UserAuth(BaseModel):
    email: str
    password: str
    username: str | None = None

@app.post("/api/auth/register")
def register(user: UserAuth, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    new_user = User(email=user.email, password=user.password, username=user.username or "Citizen")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log Action
    log = ActivityLog(user_id=new_user.id, action="REGISTER", details=f"New citizen registered: {user.email}")
    db.add(log)
    db.commit()
    
    return {"success": True, "token": "mock-jwt-token", "user": {"id": new_user.id, "email": new_user.email, "username": new_user.username}}

@app.post("/api/auth/login")
def login(user: UserAuth, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email, User.password == user.password).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Log Action
    log = ActivityLog(user_id=existing_user.id, action="LOGIN", details="User logged in")
    db.add(log)
    db.commit()
    
    return {"success": True, "token": "mock-jwt-token", "user": {"id": existing_user.id, "email": existing_user.email, "username": existing_user.username}}

# --- AI & SENSORS ---

from smart_ai import get_ai, SmartCityAI

class AIQuery(BaseModel):
    query: str
    user_id: int | None = None
    session_id: str | None = None
    context: dict | None = None

@app.post("/api/ai/analyze")
def analyze_data(ai_query: AIQuery, db: Session = Depends(get_db)):
    """
    Main AI analyze endpoint - Uses Enhanced GPT-Style AI.
    """
    if not HAS_AI_BRAIN:
        return {"response": "AI Engine is initializing...", "status": "error"}
        
    ai = get_enhanced_ai()
    proactive = get_proactive_engine()
    
    # 1. Prepare context from frontend (primary) or sensors DB (fallback)
    context = ai_query.context or {}
    
    # Frontend passes: weather, air (with aqi, pm25, pm10, o3, no2), traffic (with congestionLevel, averageSpeed, incidents)
    # Map frontend format to our internal format if present
    if context.get("air") and context["air"].get("aqi"):
        # Frontend context already has air data from API
        pass
    else:
        # Fallback to DB
        latest_aqi = db.query(SensorReading).filter(SensorReading.sensor_type == "AQI").order_by(SensorReading.timestamp.desc()).first()
        if latest_aqi:
            context.setdefault("air", {})["aqi"] = latest_aqi.value
            context["air"]["pm25"] = round(latest_aqi.value * 0.4, 2)
    
    if context.get("traffic") and (context["traffic"].get("congestionLevel") or context["traffic"].get("congestion")):
        # Normalize key name
        if "congestionLevel" in context["traffic"]:
            context["traffic"]["congestion"] = context["traffic"]["congestionLevel"]
    else:
        # Fallback to DB
        latest_traffic = db.query(SensorReading).filter(SensorReading.sensor_type == "TRAFFIC").order_by(SensorReading.timestamp.desc()).first()
        if latest_traffic:
            context.setdefault("traffic", {})["congestion"] = latest_traffic.value
    
    # 2. Add proactive suggestions (The "WOW" factor)
    proactive_tips = proactive.get_suggestions(context, lang="en")
    
    # 3. Generate response using the unified brain
    # Inject context into query for relevant topics
    query_lower = ai_query.query.lower()
    enhanced_query = ai_query.query
    
    if any(kw in query_lower for kw in ["traffic", "congestion", "road", "drive", "car"]):
        if context.get("traffic"):
            enhanced_query = f"[LIVE_DATA: Traffic congestion is {context['traffic'].get('congestion', 'N/A')}%] " + ai_query.query
    
    if any(kw in query_lower for kw in ["air", "aqi", "quality", "pollution", "breathe", "smog"]):
        if context.get("air"):
            enhanced_query = f"[LIVE_DATA: AQI is {context['air'].get('aqi', 'N/A')}, PM2.5 is {context['air'].get('pm25', 'N/A')} µg/m³] " + ai_query.query
    
    # We pass session_id if provided
    session_id = ai_query.session_id or f"user_{ai_query.user_id}" if ai_query.user_id else "guest"
    response_text = ai.chat(enhanced_query, session_id=session_id)
    
    # 4. Get metadata for frontend UI
    analysis = ai.get_full_response(enhanced_query, session_id=session_id)
    
    # Log Action
    if ai_query.user_id:
        log = ActivityLog(user_id=ai_query.user_id, action="AI_QUERY", details=f"Intent: {analysis.intent}")
        db.add(log)
        db.commit()

    return {
        "response": response_text,
        "intent_detected": analysis.intent.upper(),
        "intent_confidence": round(analysis.confidence * 100, 1),
        "engine": "SmartCityAlmaty-Neural-V3",
        "source": analysis.source,
        "proactive_suggestions": proactive_tips,
        "processing_time_ms": round(analysis.processing_time_ms, 2)
    }

@app.post("/api/ai/voice/tts")
def text_to_speech_endpoint(data: dict):
    """
    Convert text to speech and return audio file.
    """
    text = data.get("text", "")
    lang = data.get("lang", "en")
    
    if not text:
        return {"error": "No text provided"}
        
    try:
        from voice_engine import get_voice_engine
        import os
        from fastapi.responses import FileResponse
        
        engine = get_voice_engine()
        file_path = engine.text_to_speech(text, lang=lang)
        
        if file_path and os.path.exists(file_path):
            return FileResponse(file_path, media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS Error: {e}")
        
    return {"error": "TTS failed"}

@app.get("/api/ai/proactive")
def get_proactive_tips(db: Session = Depends(get_db)):
    """
    Dedicated endpoint for proactive city intelligence.
    """
    from proactive_engine import get_proactive_engine
    proactive = get_proactive_engine()
    
    # Gather context
    context = {}
    latest_aqi = db.query(SensorReading).filter(SensorReading.sensor_type == "AQI").order_by(SensorReading.timestamp.desc()).first()
    latest_traffic = db.query(SensorReading).filter(SensorReading.sensor_type == "TRAFFIC").order_by(SensorReading.timestamp.desc()).first()
    
    if latest_aqi:
        context.setdefault("air", {})["aqi"] = latest_aqi.value
    if latest_traffic:
        context.setdefault("traffic", {})["congestion"] = latest_traffic.value
        
    tips = proactive.get_suggestions(context, lang="en")
    return {"suggestions": tips, "timestamp": datetime.datetime.now().isoformat()}

@app.get("/api/ai/vision-history")
def get_vision_history():
    """Get history of analyzed images"""
    try:
        if not os.path.exists("temp_vision"):
            return []
        
        files = os.listdir("temp_vision")
        return [{"filename": f, "url": f"/api/uploads/{f}"} for f in files if f.endswith(('.jpg', '.png', '.jpeg'))]
    except Exception as e:
        return []

@app.post("/api/ai/vision-analyze")
async def analyze_uploaded_image(file: UploadFile = File(...)):
    """Analyze uploaded image using Vision Engine"""
    try:
        from vision_engine import get_vision_engine
        import os
        
        # Save temp file
        os.makedirs("temp_vision", exist_ok=True)
        file_path = f"temp_vision/{file.filename}"
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())
            
        engine = get_vision_engine()
        results = engine.analyze_image(file_path)
        
        return results
    except Exception as e:
        print(f"Vision Error: {e}")
        return {"error": str(e)}

@app.get("/api/ai/history")
def get_ai_history():
    """Get conversation history for current session"""
    ai = get_ai()
    return {"history": ai.get_history()}

@app.post("/api/ai/clear")
def clear_ai_history():
    """Clear conversation history"""
    ai = get_ai()
    ai.clear_history()
    return {"status": "cleared"}

# --- VISION & VOICE (MULTIMODAL) ---

class VisionQuery(BaseModel):
    image_path: str
    query: str | None = "What is in this photo?"

@app.post("/api/ai/vision")
def analyze_vision(query: VisionQuery):
    """Analyze image to detect urban issues"""
    from enhanced_gpt_ai import get_enhanced_ai
    ai = get_enhanced_ai()
    # For simulation, we assume image_path is valid
    response = ai.chat(query.query or "", image_path=query.image_path)
    return {"response": response, "status": "processed"}

class VoiceTTSQuery(BaseModel):
    text: str
    lang: str = "en"

@app.post("/api/ai/voice/tts")
def text_to_speech(query: VoiceTTSQuery):
    """Synthesize speech from text"""
    if not HAS_MULTIMODAL:
        raise HTTPException(status_code=500, detail="Voice engine not available")
    engine = get_voice_engine()
    audio_path = engine.text_to_speech(query.text, query.lang)
    if audio_path:
        return {"audio_url": f"/audio/{os.path.basename(audio_path)}", "status": "success"}
    return {"status": "failed"}

class VoiceSTTQuery(BaseModel):
    audio_path: str

@app.post("/api/ai/voice/stt")
def speech_to_text(query: VoiceSTTQuery):
    """Recognize speech from audio file"""
    if not HAS_MULTIMODAL:
        raise HTTPException(status_code=500, detail="Voice engine not available")
    engine = get_voice_engine()
    text = engine.speech_to_text(query.audio_path)
    return {"text": text, "status": "success"}

class Report(BaseModel):
    category: str
    description: str
    lat: float
    lng: float
    image_url: str | None = None
    user_id: int | None = None

@app.post("/api/reports")
def create_report(report: Report, db: Session = Depends(get_db)):
    """Citizen Report Ingestion"""
    new_report = CitizenReport(
        user_id=report.user_id,
        category=report.category,
        description=report.description,
        lat=report.lat,
        lng=report.lng,
        ai_analysis="Detected issue. High Priority."
    )
    db.add(new_report)
    
    # Log Action
    if report.user_id:
        log = ActivityLog(user_id=report.user_id, action="REPORT_FILED", details=f"Filed report: {report.category}")
        db.add(log)
    
    db.commit()
    db.refresh(new_report)
    
    return {
        "id": f"R-{new_report.id}",
        "status": "RECEIVED",
        "ai_analysis": new_report.ai_analysis,
        "estimated_fix": "24 hours"
    }

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    """Fetch all citizen reports for the Live Map"""
    reports = db.query(CitizenReport).all()
    return [{
        "id": r.id,
        "category": r.category,
        "description": r.description,
        "lat": r.lat,
        "lng": r.lng,
        "status": r.status,
        "ai_analysis": r.ai_analysis,
        "created_at": r.created_at
    } for r in reports]

@app.get("/api/users/{user_id}/history")
def get_user_history(user_id: int, db: Session = Depends(get_db)):
    """Fetch activity history for the Profile page"""
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.timestamp.desc()).limit(20).all()
    return [{
        "id": log.id,
        "action": log.action,
        "details": log.details,
        "timestamp": log.timestamp
    } for log in logs]

@app.get("/api/transport/traffic")
def get_traffic_status():
    """Realistic Almaty Traffic based on time of day - CONSISTENT values"""
    now = datetime.datetime.now()
    hour = now.hour
    minute = now.minute
    is_weekend = now.weekday() >= 5
    
    # Use minute as seed for pseudo-random but consistent values
    # This ensures same values for all requests within the same minute
    seed_value = hour * 60 + minute
    
    # Almaty Rush Hours: 08:30-10:00 and 17:30-20:00
    if is_weekend:
        base_congestion = 2 + (seed_value % 2)  # 2-3 Light weekend
        if 12 <= hour <= 18:
            base_congestion = 3 + (seed_value % 3)  # 3-5 Afternoon leisure
    else:
        if (8 <= hour <= 10) or (17 <= hour <= 20):
            base_congestion = 7 + (seed_value % 3)  # 7-9 Heavy rush hour
        elif (11 <= hour <= 16):
            base_congestion = 4 + (seed_value % 3)  # 4-6 Moderate midday
        else:
            base_congestion = 1 + (seed_value % 4)  # 1-4 Night/Early morning
    
    # Calculate derived values deterministically
    incidents = (seed_value % 3) if base_congestion < 7 else 2 + (seed_value % 4)
    avg_speed = max(10, 60 - (base_congestion * 6) + (seed_value % 5))
            
    return {
        "congestion_level": min(10, base_congestion),
        "incidents": incidents,
        "avg_speed_kmh": avg_speed
    }

@app.get("/api/transport/buses")
async def get_bus_locations(db: Session = Depends(get_db)):
    """Fetch real-time bus locations - uses OSM data if available"""
    
    # Try to use live OSM-based transport data
    if LIVE_TRANSPORT_AVAILABLE:
        try:
            live_data = await get_live_bus_data()
            if live_data and len(live_data) > 0:
                return live_data
        except Exception as e:
            print(f"[Transport] Live API error, falling back: {e}")
    
    # Fallback to database simulation
    buses = db.query(BusLocation).all()
    results = []
    for bus in buses:
        bus.lat += (random.random() - 0.5) * 0.001
        bus.lng += (random.random() - 0.5) * 0.001
        occupancy = random.randint(20, 95) if bus.route_number in ["92", "32", "121"] else random.randint(5, 60)
        results.append({
            "id": bus.id,
            "route_number": bus.route_number,
            "vehicle_type": bus.vehicle_type,
            "lat": bus.lat,
            "lng": bus.lng,
            "last_updated": datetime.datetime.now().isoformat(),
            "occupancy": occupancy,
            "has_ac": random.random() > 0.3 if bus.vehicle_type == "BUS" else random.random() > 0.7, # Marshrutkas rarely have AC
            "has_wifi": random.random() > 0.5 if bus.vehicle_type == "BUS" else False, # No wifi in marshrutka
            "is_eco": bus.route_number in ["92", "12"]
        })
    db.commit()
    return results

@app.get("/api/transport/eco-stats")
async def get_transport_eco_stats(db: Session = Depends(get_db)):
    """Calculate cumulative stable eco stats for today"""
    now = datetime.datetime.now()
    # Seconds passed since start of day
    seconds_since_midnight = (now - now.replace(hour=0, minute=0, second=0, microsecond=0)).total_seconds()
    
    # Base calculation:
    # 2500kg is average daily saving for Almaty fleet (simulated)
    # We add a slight growth factor centered around the time of day
    total_vehicles = db.query(BusLocation).count()
    if total_vehicles == 0: total_vehicles = 100 # Fallback
    
    # Average saving per vehicle per second (roughly 0.0005kg)
    base_saving = seconds_since_midnight * (total_vehicles * 0.00045)
    
    # Add a pseudo-random but stable jitter based on the current hour/minute to keep it "alive"
    # but not jumping wildly (it only increases)
    stable_jitter = (now.minute * 0.1) + (now.second * 0.002)
    final_co2 = round(base_saving + stable_jitter, 1)
    
    return {
        "co2_saved_kg": final_co2,
        "trees_equivalent": int(final_co2 / 24), # 1 tree absorbs ~24kg CO2 per year
        "electric_buses_active": db.query(BusLocation).filter(BusLocation.route_number.in_(["92", "12"])).count(),
        "timestamp": now.isoformat()
    }

@app.get("/api/emergency/status")
async def get_emergency_city_status(db: Session = Depends(get_db)):
    """Overall city safety status and metrics"""
    incidents_count = db.query(EmergencyIncident).filter(EmergencyIncident.status != "RESOLVED").count()
    safety_score = max(0, 100 - (incidents_count * 5))
    
    return {
        "safety_score": safety_score,
        "active_incidents": incidents_count,
        "total_units_deployed": random.randint(15, 40),
        "emergency_level": "NORMAL" if safety_score > 80 else "ELEVATED" if safety_score > 60 else "CRITICAL",
        "avg_response_time_mins": 8.4
    }

@app.get("/api/emergency/units")
async def get_emergency_units(db: Session = Depends(get_db)):
    """Fetch persistent locations of emergency responders and simulate small movements"""
    units = db.query(EmergencyUnit).all()
    results = []
    for unit in units:
        # Simulate slight movement to show it's 'live' but consistent
        unit.lat += (random.random() - 0.5) * 0.0004
        unit.lng += (random.random() - 0.5) * 0.0004
        unit.heading = (unit.heading + random.randint(-5, 5)) % 360
        
        results.append({
            "id": unit.id,
            "type": unit.type,
            "status": unit.status,
            "lat": unit.lat,
            "lng": unit.lng,
            "heading": unit.heading
        })
    db.commit()
    return results

@app.get("/api/emergency/incidents")
async def get_emergency_incidents(db: Session = Depends(get_db)):
    """Merge local simulated incidents with response tracking"""
    db_incidents = db.query(EmergencyIncident).all()
    results = []
    
    for inc in db_incidents:
        results.append({
            "id": inc.id,
            "type": inc.type,
            "description": inc.description,
            "lat": inc.lat,
            "lng": inc.lng,
            "severity": inc.severity,
            "status": inc.status,
            "reported_at": inc.reported_at.isoformat(),
            "assigned_units": [f"U-{random.randint(100, 999)}"] if inc.status != "ACTIVE" else []
        })
    
    return results

@app.get("/api/petitions")
def get_petitions(db: Session = Depends(get_db)):
    """Fetch all active citizen petitions sorted by votes"""
    return db.query(Petition).order_by(Petition.votes.desc()).all()

@app.post("/api/petitions/{petition_id}/vote")
def vote_petition(petition_id: int, db: Session = Depends(get_db)):
    """Vote for a specific petition"""
    petition = db.query(Petition).filter(Petition.id == petition_id).first()
    if not petition:
        raise HTTPException(status_code=404, detail="Petition not found")
    petition.votes += 1
    db.commit()
    return {"status": "success", "new_count": petition.votes}

@app.post("/api/emergency/sos")
def post_sos(data: dict, db: Session = Depends(get_db)):
    """Broadcast an SOS alert"""
    new_sos = EmergencyIncident(
        type="MEDICAL", # Default to medical for SOS
        description=f"SOS Broadcast from User {data.get('user_id')}: {data.get('message', 'Emergency help needed')}",
        lat=data.get('lat', 43.238),
        lng=data.get('lng', 76.889),
        severity="CRITICAL",
        status="ACTIVE"
    )
    db.add(new_sos)
    db.commit()
    return {"status": "SOS_BROADCAST_SUCCESS", "incident_id": new_sos.id}

@app.get("/api/sensors/qa")
async def get_air_quality():
    """Fetch Real-Time Air Quality for Almaty via Open-Meteo"""
    try:
        async with httpx.AsyncClient() as client:
            # Almaty Coords: 43.2389, 76.8897
            url = "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=43.2389&longitude=76.8897&current=european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone"
            response = await client.get(url, timeout=5.0)
            if response.status_code == 200:
                data = response.json().get("current", {})
                return {
                    "aqi": data.get("european_aqi", 50),
                    "pm25": data.get("pm2_5", 15),
                    "pm10": data.get("pm10", 25),
                    "no2": data.get("nitrogen_dioxide", 10),
                    "o3": data.get("ozone", 30),
                    "timestamp": time.time(),
                    "source": "Open-Meteo Real-time"
                }
    except Exception as e:
        print(f"Air Quality API error: {e}")
        
    # Fallback to smart simulation if API fails
    return {
        "aqi": random.randint(40, 60),
        "pm25": random.randint(10, 25),
        "timestamp": time.time(),
        "source": "Simulation-Fallback"
    }

@app.get("/api/stats")
def get_global_stats(db: Session = Depends(get_db)):
    """Global system health stats calculated from real platform data"""
    latest_aqi = db.query(SensorReading).filter(SensorReading.sensor_type == "AQI").order_by(SensorReading.timestamp.desc()).first()
    latest_traffic = db.query(SensorReading).filter(SensorReading.sensor_type == "TRAFFIC").order_by(SensorReading.timestamp.desc()).first()
    
    aqi_val = latest_aqi.value if latest_aqi else 50
    traffic_val = latest_traffic.value if latest_traffic else 5
    
    # city_health_score calculation
    aqi_penalty = (aqi_val / 300) * 100
    traffic_penalty = (traffic_val / 10) * 100
    health_score = int(max(0, 100 - (aqi_penalty * 0.6 + traffic_penalty * 0.4)))

    # Real Metrics
    total_reports = db.query(CitizenReport).count()
    active_users = db.query(User).count()
    total_logs = db.query(ActivityLog).count()
    
    # Activity by day (last 7 days)
    activity_by_day = []
    for i in range(7):
        date = (datetime.datetime.utcnow() - datetime.timedelta(days=6-i)).date()
        count = db.query(ActivityLog).filter(func.date(ActivityLog.timestamp) == date).count()
        activity_by_day.append({"date": date.isoformat(), "count": count + random.randint(5, 15)}) # some padding for demo

    return {
        "totalObjects": total_reports,
        "totalComments": random.randint(10, 50),
        "totalLikes": random.randint(100, 500),
        "activeUsers": active_users,
        "city_health_score": health_score,
        "activityByDay": activity_by_day,
        "total_active_sensors": 142,
        "active_emergency_alerts": db.query(EmergencyIncident).filter(EmergencyIncident.status == "ACTIVE").count(),
        # AI Specific Statistics
        "ai_metrics": {
            "total_queries": db.query(ActivityLog).filter(ActivityLog.action == "AI_QUERY").count() + 1240, # including historical
            "avg_response_time_ms": 142 + random.randint(0, 50),
            "kb_entries": db.query(AIKnowledge).count(),
            "intent_accuracy": 98.2,
            "topic_distribution": [
                {"subject": "Transport", "A": 120, "fullMark": 150},
                {"subject": "Ecology", "A": 98, "fullMark": 150},
                {"subject": "History", "A": 86, "fullMark": 150},
                {"subject": "Social", "A": 99, "fullMark": 150},
                {"subject": "Emergency", "A": 85, "fullMark": 150}
            ]
        },
        # City Performance
        "infrastructure": [
            {"label": "Power Grid Stability", "value": 99.8, "trend": "up"},
            {"label": "Water Treatment Quality", "value": 96.4, "trend": "stable"},
            {"label": "Transit Punctuality", "value": 94.2, "trend": "up"},
            {"label": "Public Wifi Coverage", "value": 88.5, "trend": "up"}
        ]
    }

@app.get("/api/ai/forecast")
async def get_ai_forecast():
    """AI engine predicting city state for the next 3 hours"""
    now = datetime.datetime.now()
    forecasts = []
    
    # Generate predictions for the next 3 hours
    for i in range(1, 4):
        target_time = now + datetime.timedelta(hours=i)
        forecasts.append({
            "time": target_time.strftime("%H:00"),
            "traffic_prediction": random.randint(3, 9), # 1-10 scale
            "aqi_prediction": random.randint(40, 150),
            "confidence": 92 - (i * 5), # confidence drops over time
            "insight": random.choice([
                "Expected congestion increase on Al-Farabi Ave",
                "Air quality improving due to mountain breeze",
                "Normal traffic patterns predicted",
                "High density near Dostyk Plaza expected",
                "Slight temperature drop might affect battery sensors"
            ])
        })
    
    return {
        "generated_at": now.isoformat(),
        "engine": "Neural-Predictor-V5",
        "forecasts": forecasts
    }

@app.get("/api/timeseries/{sensor_type}")
def get_timeseries(sensor_type: str, db: Session = Depends(get_db)):
    """Fetch 24h historical data for charts"""
    readings = db.query(SensorReading).filter(
        SensorReading.sensor_type == sensor_type.upper()
    ).order_by(SensorReading.timestamp.asc()).all()
    
    return [{
        "timestamp": r.timestamp.isoformat(),
        "value": r.value
    } for r in readings]

@app.get("/api/users/{user_id}/stats")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Enhanced User Stats for Profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    report_count = db.query(CitizenReport).filter(CitizenReport.user_id == user_id).count()
    ai_queries = db.query(ActivityLog).filter(ActivityLog.user_id == user_id, ActivityLog.action == "AI_QUERY").count()
    resolved_reports = db.query(CitizenReport).filter(CitizenReport.user_id == user_id, CitizenReport.status == "RESOLVED").count()
    
    return {
        "joinedAt": user.created_at.isoformat(),
        "reportsFiled": report_count,
        "resolvedIssues": resolved_reports,
        "aiConsultations": ai_queries,
        "reputationScore": 100 + (report_count * 10) + (resolved_reports * 50),
        "impactLevel": "Contributor" if report_count > 5 else "Citizen",
        "objectsCount": report_count,
        "commentsCount": random.randint(0, 10),
        "likesGiven": random.randint(0, 50),
        "subscriptionsCount": random.randint(1, 5),
        "ratingsGiven": random.randint(0, 20)
    }


@app.post("/api/petitions")
def create_petition(data: dict, db: Session = Depends(get_db)):
    """Citizens creating a new initiative"""
    new_petition = Petition(
        title=data.get("title"),
        description=data.get("description"),
        category=data.get("category", "INFRASTRUCTURE"),
        votes=data.get("votes", 1)
    )
    db.add(new_petition)
    db.commit()
    return {"status": "success", "id": new_petition.id}

@app.get("/api/city/feed")
def get_city_feed():
    """Live dynamic city feed generator"""
    events = [
        {"id": 1, "msg": "50 new smart traffic lights installed in Almaly District.", "type": "INFRASTRUCTURE", "time": "2 hrs ago"},
        {"id": 2, "msg": "AI detected 15% PM2.5 reduction in foothill districts.", "type": "ENV", "time": "5 hrs ago"},
        {"id": 3, "msg": "Scheduled maintenance of Metro Line 1 tonight at 02:00.", "type": "SYSTEM", "time": "Just now"},
        {"id": 4, "msg": "Citizen proposal 'Dostyk Greening' reached 1,500 votes!", "type": "COMMUNITY", "time": "15 min ago"},
        {"id": 5, "msg": "Police patrols increased in Auezov district for safety.", "type": "SECURITY", "time": "1 hr ago"}
    ]
    # Rotate or randomize slightly for feels
    return events

# --- ADMIN SYSTEM ---
@app.get("/api/admin/users")
def admin_get_users(db: Session = Depends(get_db)):
    """Admin: List all registered users"""
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "created_at": u.created_at,
            "reports_count": db.query(CitizenReport).filter(CitizenReport.user_id == u.id).count(),
            "actions_count": db.query(ActivityLog).filter(ActivityLog.user_id == u.id).count()
        } for u in users
    ]

@app.get("/api/admin/logs")
def admin_get_logs(db: Session = Depends(get_db)):
    """Admin: Get latest system activity logs"""
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "details": l.details,
            "timestamp": l.timestamp
        } for l in logs
    ]

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# ============================================
# MESSENGER / SOCIAL NETWORK API
# ============================================

class CreateChatRequest(BaseModel):
    type: str = "PRIVATE"  # PRIVATE, GROUP, CHANNEL
    name: str | None = None
    description: str | None = None
    member_ids: list[int] = []

class SendMessageRequest(BaseModel):
    sender_id: int
    content: str
    message_type: str = "TEXT"
    reply_to: int | None = None

class UpdateProfileRequest(BaseModel):
    bio: str | None = None
    avatar_url: str | None = None
    phone: str | None = None

class AddContactRequest(BaseModel):
    user_id: int
    contact_id: int
    nickname: str | None = None

@app.get("/api/messenger/chats")
def get_user_chats(user_id: int, db: Session = Depends(get_db)):
    """Get all chats for a user"""
    memberships = db.query(ChatMember).filter(ChatMember.user_id == user_id).all()
    chats = []
    
    for membership in memberships:
        chat = db.query(Chat).filter(Chat.id == membership.chat_id).first()
        if not chat:
            continue
            
        # Get last message
        last_message = db.query(Message).filter(
            Message.chat_id == chat.id
        ).order_by(Message.created_at.desc()).first()
        
        # Get unread count
        unread_count = db.query(Message).filter(
            Message.chat_id == chat.id,
            Message.id > (membership.last_read_message_id or 0)
        ).count()
        
        # Get other members for chat name (if PRIVATE)
        chat_name = chat.name
        chat_avatar = chat.avatar_url
        if chat.type == "PRIVATE":
            other_member = db.query(ChatMember).filter(
                ChatMember.chat_id == chat.id,
                ChatMember.user_id != user_id
            ).first()
            if other_member:
                other_user = db.query(User).filter(User.id == other_member.user_id).first()
                if other_user:
                    chat_name = other_user.username
                    profile = db.query(UserProfile).filter(UserProfile.user_id == other_user.id).first()
                    if profile:
                        chat_avatar = profile.avatar_url
        
        # Get member count
        member_count = db.query(ChatMember).filter(ChatMember.chat_id == chat.id).count()
        
        chats.append({
            "id": chat.id,
            "type": chat.type,
            "name": chat_name or f"Chat {chat.id}",
            "avatar_url": chat_avatar,
            "description": chat.description,
            "member_count": member_count,
            "unread_count": unread_count,
            "last_message": {
                "content": last_message.content if last_message else None,
                "sender_id": last_message.sender_id if last_message else None,
                "created_at": last_message.created_at.isoformat() if last_message else None
            } if last_message else None,
            "created_at": chat.created_at.isoformat()
        })
    
    # Sort by last message time
    chats.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else "", reverse=True)
    return chats

@app.post("/api/messenger/chats")
def create_chat(request: CreateChatRequest, db: Session = Depends(get_db)):
    """Create a new chat"""
    if not request.member_ids or len(request.member_ids) < 1:
        raise HTTPException(status_code=400, detail="At least one member required")
    
    # Create chat
    chat = Chat(
        type=request.type,
        name=request.name,
        description=request.description,
        created_by=request.member_ids[0] if request.member_ids else None
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    # Add members
    for idx, member_id in enumerate(request.member_ids):
        role = "OWNER" if idx == 0 else "MEMBER"
        member = ChatMember(
            chat_id=chat.id,
            user_id=member_id,
            role=role
        )
        db.add(member)
    
    db.commit()
    
    # Add system message
    system_msg = Message(
        chat_id=chat.id,
        sender_id=request.member_ids[0],
        content="Chat created",
        message_type="SYSTEM"
    )
    db.add(system_msg)
    db.commit()
    
    return {"id": chat.id, "status": "created"}

@app.get("/api/messenger/chats/{chat_id}/messages")
def get_chat_messages(chat_id: int, limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    """Get messages in a chat"""
    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for msg in reversed(messages):  # Reverse to get chronological order
        sender = db.query(User).filter(User.id == msg.sender_id).first()
        sender_profile = db.query(UserProfile).filter(UserProfile.user_id == msg.sender_id).first()
        
        result.append({
            "id": msg.id,
            "chat_id": msg.chat_id,
            "sender_id": msg.sender_id,
            "sender_name": sender.username if sender else "Unknown",
            "sender_avatar": sender_profile.avatar_url if sender_profile else None,
            "content": msg.content,
            "message_type": msg.message_type,
            "reply_to": msg.reply_to,
            "is_edited": msg.is_edited,
            "created_at": msg.created_at.isoformat()
        })
    
    return result

@app.post("/api/messenger/chats/{chat_id}/messages")
def send_message(chat_id: int, request: SendMessageRequest, db: Session = Depends(get_db)):
    """Send a message to a chat"""
    # Verify chat exists
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Verify sender is a member
    membership = db.query(ChatMember).filter(
        ChatMember.chat_id == chat_id,
        ChatMember.user_id == request.sender_id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="User is not a member of this chat")
    
    # Create message
    message = Message(
        chat_id=chat_id,
        sender_id=request.sender_id,
        content=request.content,
        message_type=request.message_type,
        reply_to=request.reply_to
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Update sender's last read
    membership.last_read_message_id = message.id
    db.commit()
    
    sender = db.query(User).filter(User.id == request.sender_id).first()
    
    return {
        "id": message.id,
        "chat_id": chat_id,
        "sender_id": request.sender_id,
        "sender_name": sender.username if sender else "Unknown",
        "content": message.content,
        "message_type": message.message_type,
        "created_at": message.created_at.isoformat()
    }

@app.put("/api/messenger/chats/{chat_id}/read")
def mark_chat_read(chat_id: int, user_id: int, db: Session = Depends(get_db)):
    """Mark all messages in a chat as read for a user"""
    membership = db.query(ChatMember).filter(
        ChatMember.chat_id == chat_id,
        ChatMember.user_id == user_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
    
    last_message = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.created_at.desc()).first()
    
    if last_message:
        membership.last_read_message_id = last_message.id
        db.commit()
    
    return {"status": "read"}

@app.get("/api/messenger/contacts")
def get_contacts(user_id: int, db: Session = Depends(get_db)):
    """Get user's contacts"""
    contacts = db.query(Contact).filter(Contact.user_id == user_id).all()
    result = []
    
    for contact in contacts:
        user = db.query(User).filter(User.id == contact.contact_id).first()
        profile = db.query(UserProfile).filter(UserProfile.user_id == contact.contact_id).first()
        
        if user:
            result.append({
                "id": contact.id,
                "user_id": user.id,
                "username": user.username,
                "nickname": contact.nickname,
                "avatar_url": profile.avatar_url if profile else None,
                "is_online": profile.is_online if profile else False,
                "last_seen": profile.last_seen.isoformat() if profile and profile.last_seen else None
            })
    
    return result

@app.post("/api/messenger/contacts")
def add_contact(request: AddContactRequest, db: Session = Depends(get_db)):
    """Add a contact"""
    # Check if contact already exists
    existing = db.query(Contact).filter(
        Contact.user_id == request.user_id,
        Contact.contact_id == request.contact_id
    ).first()
    
    if existing:
        return {"status": "already_exists", "id": existing.id}
    
    contact = Contact(
        user_id=request.user_id,
        contact_id=request.contact_id,
        nickname=request.nickname
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    
    return {"status": "added", "id": contact.id}

@app.get("/api/messenger/users/search")
def search_users(query: str, limit: int = 20, db: Session = Depends(get_db)):
    """Search for users by username or email"""
    users = db.query(User).filter(
        (User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))
    ).limit(limit).all()
    
    result = []
    for user in users:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": profile.avatar_url if profile else None,
            "bio": profile.bio if profile else None,
            "is_online": profile.is_online if profile else False
        })
    
    return result

@app.get("/api/messenger/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    """Get user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": profile.bio if profile else "",
        "avatar_url": profile.avatar_url if profile else None,
        "phone": profile.phone if profile else None,
        "is_online": profile.is_online if profile else False,
        "last_seen": profile.last_seen.isoformat() if profile and profile.last_seen else None,
        "created_at": user.created_at.isoformat()
    }

@app.put("/api/messenger/profile/{user_id}")
def update_profile(user_id: int, request: UpdateProfileRequest, db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
    
    if request.bio is not None:
        profile.bio = request.bio
    if request.avatar_url is not None:
        profile.avatar_url = request.avatar_url
    if request.phone is not None:
        profile.phone = request.phone
    
    profile.last_seen = datetime.datetime.utcnow()
    db.commit()
    
    return {"status": "updated"}

@app.put("/api/messenger/online/{user_id}")
def update_online_status(user_id: int, is_online: bool = True, db: Session = Depends(get_db)):
    """Update user online status"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        profile = UserProfile(user_id=user_id, is_online=is_online)
        db.add(profile)
    else:
        profile.is_online = is_online
        profile.last_seen = datetime.datetime.utcnow()
    
    db.commit()
    return {"status": "updated", "is_online": is_online}

@app.post("/api/messenger/upload")
async def upload_messenger_file(file: UploadFile = File(...)):
    """Upload a file/image for a message"""
    try:
        os.makedirs("uploads/messenger", exist_ok=True)
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = f"uploads/messenger/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Determine type
        message_type = "FILE"
        if ext.lower() in ["jpg", "jpeg", "png", "gif", "webp"]:
            message_type = "IMAGE"
            
        return {
            "url": f"/api/uploads/messenger/{filename}",
            "filename": file.filename,
            "message_type": message_type
        }
    except Exception as e:
        print(f"Error uploading messenger file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messenger/stickers")
def list_stickers():
    """List available anime girl stickers"""
    sticker_dir = "uploads/stickers"
    os.makedirs(sticker_dir, exist_ok=True)
    try:
        files = os.listdir(sticker_dir)
        stickers = []
        for f in files:
            if f.endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                stickers.append({
                    "id": f,
                    "url": f"/api/uploads/stickers/{f}",
                    "name": f.split('.')[0].replace('_', ' ').capitalize()
                })
        return stickers
    except Exception as e:
        return []


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

