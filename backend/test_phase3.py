import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_phase3():
    print("🔬 TESTING PHASE 3 UPGRADES (Map & Profile Data)")
    
    # 1. Fetch Reports (for Map)
    print("\n🗺️ Testing Reports API (for Map)...")
    try:
        r = requests.get(f"{BASE_URL}/reports")
        if r.status_code == 200:
            reports = r.json()
            print(f"✅ Success. Found {len(reports)} reports.")
            if len(reports) > 0:
                print(f"   Sample: {reports[0]['category']} - {reports[0]['ai_analysis'][:30]}...")
        else:
            print(f"❌ Failed: {r.status_code} {r.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

    # 2. Fetch User History (for Profile)
    # We need a user ID. Let's assume ID=1 or regsiter a temp one.
    # Let's try registering a dynamic one to be safe.
    print("\n👤 Testing User History API (for Profile)...")
    try:
        # Register temp user
        import random
        rnd = random.randint(1000,9999)
        reg_payload = {"email": f"history_test_{rnd}@smart.kz", "password": "pass", "username": "HistoryBot"}
        r_reg = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
        
        if r_reg.status_code == 200:
            user_id = r_reg.json()['user']['id']
            print(f"   Created temp user ID: {user_id}")
            
            # Fetch history (Should have REGISTER log)
            r_hist = requests.get(f"{BASE_URL}/users/{user_id}/history")
            if r_hist.status_code == 200:
                history = r_hist.json()
                print(f"✅ Success. Found {len(history)} history items.")
                found_register = any(h['action'] == 'REGISTER' for h in history)
                if found_register:
                    print("   ✅ Verified 'REGISTER' action in log.")
                else:
                    print("   ⚠️ Warning: 'REGISTER' action missing from log.")
            else:
                 print(f"❌ Failed to fetch history: {r_hist.status_code}")
        else:
             print(f"⚠️ Could not register temp user, skipping history test. (Status: {r_reg.status_code})")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_phase3()
