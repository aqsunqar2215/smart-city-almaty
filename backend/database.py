from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'smart_city.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String)
    password = Column(String) # In production this must be hashed!
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    logs = relationship("ActivityLog", back_populates="user")
    reports = relationship("CitizenReport", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # "LOGIN", "REPORT", "AI_QUERY"
    details = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="logs")

class CitizenReport(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category = Column(String)
    description = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String, default="RECEIVED")
    ai_analysis = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id = Column(Integer, primary_key=True, index=True)
    sensor_type = Column(String) # "AQI", "TRAFFIC", "WEATHER"
    value = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class EmergencyIncident(Base):
    __tablename__ = "emergency_incidents"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String) # "FIRE", "MEDICAL", "POLICE", "ACCIDENT"
    description = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    severity = Column(String) # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    status = Column(String, default="ACTIVE") # "ACTIVE", "RESPONDING", "RESOLVED"
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)

class BusLocation(Base):
    __tablename__ = "bus_locations"
    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String)
    vehicle_type = Column(String, default="BUS") # "BUS" or "MINIBUS"
    lat = Column(Float)
    lng = Column(Float)
    speed = Column(Float)
    last_update = Column(DateTime, default=datetime.datetime.utcnow)

class EmergencyUnit(Base):
    __tablename__ = "emergency_units"
    id = Column(String, primary_key=True) # e.g., "POLICE_01"
    type = Column(String) # "POLICE", "AMBULANCE", "FIRE"
    status = Column(String) # "AVAILABLE", "EN_ROUTE", "ON_SCENE"
    lat = Column(Float)
    lng = Column(Float)
    heading = Column(Float)
    last_update = Column(DateTime, default=datetime.datetime.utcnow)

class Petition(Base):
    __tablename__ = "petitions"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    votes = Column(Integer, default=0)
    category = Column(String) # "INFRASTRUCTURE", "ECOLOGY", "CULTURE"
    status = Column(String, default="COLLECTING_VOTES") # "COLLECTING_VOTES", "IN_REVIEW", "IMPLEMENTED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AIKnowledge(Base):
    __tablename__ = "ai_knowledge"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String) # "HISTORY", "TRANSPORT", "CULTURE", "SIGHTS", "ECONOMY"
    pattern = Column(Text)    # Keywords or common questions
    response = Column(Text)   # Detailed localized response
    language = Column(String) # "en" or "ru"
    importance = Column(Integer, default=1) # 1-5 for relevance ranking

# ============================================
# MESSENGER / SOCIAL NETWORK MODELS
# ============================================

class UserProfile(Base):
    """Extended user profile for messenger"""
    __tablename__ = "user_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio = Column(String, default="")
    avatar_url = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    is_online = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="profile")

class Chat(Base):
    """Chat/Channel/Group"""
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, default="PRIVATE")  # "PRIVATE", "GROUP", "CHANNEL"
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    members = relationship("ChatMember", back_populates="chat", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")

class ChatMember(Base):
    """Membership in a chat"""
    __tablename__ = "chat_members"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="MEMBER")  # "OWNER", "ADMIN", "MEMBER"
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_read_message_id = Column(Integer, nullable=True)
    
    chat = relationship("Chat", back_populates="members")
    user = relationship("User")

class Message(Base):
    """Messages in chats"""
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    message_type = Column(String, default="TEXT")  # "TEXT", "IMAGE", "FILE", "VOICE", "SYSTEM"
    reply_to = Column(Integer, ForeignKey("messages.id"), nullable=True)
    is_edited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User")

class Contact(Base):
    """User contacts"""
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    contact_id = Column(Integer, ForeignKey("users.id"))
    nickname = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

