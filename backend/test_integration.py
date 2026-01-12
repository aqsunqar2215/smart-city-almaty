import requests
import random
import string
import time
import os
import sqlite3

BASE_URL = "http://localhost:8000"

def generate_random_email():
    return f"test_{''.join(random.choices(string.ascii_lowercase, k=8))}@smart.kz"

def test_api():
    print("🚀 STARTING SMART CITY PLATFORM SELF-TEST\n")
    
    # 1. Check Backend Health
    try:
        r = requests.get(f"{BASE_URL}/")
        if r.status_code == 200:
            print(f"✅ Backend Online: {r.json()}")
        else:
            print(f"❌ Backend Error: {r.status_code}")
            return
    except requests.exceptions.ConnectionError:
        print("❌ CRITICAL: Could not connect to localhost:8000.")
        print("   Please run 'start_dev.bat' in a terminal first!")
        return

    # 2. Test Registration
    email = generate_random_email()
    password = "password123"
    username = "TestCitizen"
    
    print(f"\n👤 Testing Registration for {email}...")
    auth_payload = {"email": email, "password": password, "username": username}
    r = requests.post(f"{BASE_URL}/api/auth/register", json=auth_payload)
    if r.status_code == 200:
        data = r.json()
        print("✅ Registration Success!")
        user_id = data['user']['id']
    else:
        print(f"❌ Registration Failed: {r.text}")
        return

    # 3. Test Login (Double check)
    print(f"\n🔑 Testing Login...")
    login_payload = {"email": email, "password": password}
    r = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    if r.status_code == 200:
        print("✅ Login Success!")
    else:
        print(f"❌ Login Failed: {r.text}")

    # 4. Test Sensors
    print(f"\n📡 Testing Sensors...")
    r = requests.get(f"{BASE_URL}/api/sensors/qa")
    if r.status_code == 200:
        print(f"✅ Air Quality Sensor: {r.json()}")
    else:
        print("❌ Sensor Error")

    # 5. Test AI Brain
    print(f"\n🧠 Testing AI Assistant...")
    ai_payload = {"query": "Is there heavy traffic?", "user_id": user_id}
    r = requests.post(f"{BASE_URL}/api/ai/analyze", json=ai_payload)
    if r.status_code == 200:
        print(f"✅ AI Response: {r.json()['response']}")
    else:
        print(f"❌ AI Error: {r.text}")

    # 6. Test Reporting (Database Write)
    print(f"\n📸 Testing Issue Reporting (Database Write)...")
    report_payload = {
        "category": "Pothole",
        "description": "Integration Test Pothole",
        "lat": 43.25,
        "lng": 76.95,
        "user_id": user_id
    }
    r = requests.post(f"{BASE_URL}/api/reports", json=report_payload)
    if r.status_code == 200:
        print(f"✅ Report Filed: {r.json()}")
    else:
        print(f"❌ Report Error: {r.text}")

    # 7. Verify SQLite Persistence
    print(f"\n💾 Verifying Database Persistence (Direct SQL Check)...")
    if os.path.exists("./backend/smart_city.db"):
        try:
            conn = sqlite3.connect("./backend/smart_city.db")
            c = conn.cursor()
            c.execute("SELECT action, details FROM activity_logs WHERE user_id=? ORDER BY id DESC", (user_id,))
            logs = c.fetchall()
            print(f"✅ Found {len(logs)} activity logs for this user:")
            for log in logs:
                print(f"   - {log[0]}: {log[1]}")
            conn.close()
        except Exception as e:
            print(f"❌ Database Read Error: {e}")
    else:
        print("❌ Database file not found!")

    print("\n✨ TEST COMPLETE ✨")

if __name__ == "__main__":
    test_api()
