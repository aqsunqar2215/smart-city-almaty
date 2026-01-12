@echo off
echo [SMART CITY ALMATY] Starting System...

echo Starting Backend (FastAPI)...
start cmd /k "cd backend && pip install -r requirements.txt && python main.py"

echo Starting Frontend (Vite)...
start cmd /k "npm run dev"

echo System Online.
