# Smart City Almaty

## Run Locally

### Prerequisites
- Node.js 18+
- npm
- Python 3.10+
- pip

### 1) Run Backend (FastAPI)
From project root:

```bat
cd backend
pip install -r requirements.txt
python main.py
```

Backend API runs at: `http://localhost:8000`

### Internet Fallback + External Knowledge (English Only)
The AI now supports automatic web fallback when local confidence is low.

Optional backend environment variables:

```bat
set ENABLE_INTERNET_SEARCH=true
set EXTERNAL_SITE_URLS=https://en.wikipedia.org/wiki/Almaty,https://your-site.com
set EXTERNAL_SITE_MAX_PAGES=30
set EXTERNAL_SITE_MAX_RECORDS=3000
set EXTERNAL_DATA_DIR=backend\datasets
set EXTERNAL_SMART_CITY_FILE=almaty_smart_city_english.json
set EXTERNAL_CHAT_FILE=general_chat_english_10k.json
```

### Train / Retrain the Neural Model
From project root:

```bat
cd backend
set TRAIN_EPOCHS=5
set TRAIN_TARGET_SIZE=8000
python train_model.py
```

You can also tune:
`TRAIN_BATCH_SIZE`, `TRAIN_LR`, `EXTERNAL_LIMIT_PER_FILE`.

### 2) Run Frontend (Vite + React)
Open a second terminal in project root:

```bat
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### Quick Start (Windows)
You can start both services automatically:

```bat
start_dev.bat
```
