# AGENTS.md

## Project Goal
- Построить и поддерживать Smart City Almaty как рабочий full-stack проект:
  - frontend (Vite + React + TypeScript),
  - backend API (FastAPI + SQLAlchemy),
  - рабочий end-to-end пользовательский путь (auth + основной сценарий),
  - проверяемое качество через обязательные quality gates.

## Active Stack
- Frontend: React 18, TypeScript, Vite, npm
- Backend: Python, FastAPI, Uvicorn, SQLAlchemy
- Data/API: REST API (`http://localhost:8000/api`)
- Auth: backend endpoints (`/api/auth/*`)
- Tests: backend test scripts (`backend/test_*.py`), e2e framework пока не стандартизован

## Mandatory Workflow
1. Verify before claiming done.
2. Не считать задачу завершенной без запуска и наблюдения результата.
3. Перед финалом проходить quality gates (lint/build/e2e/api smoke).
4. DEBUG.md должен содержать только фактически выполненные команды и результаты.

## Runtime Commands
- install (frontend): `npm install`
- install (backend): `cd backend && pip install -r requirements.txt`
- dev (both, Windows): `start_dev.bat`
- dev (backend): `cd backend && python main.py`
- dev (frontend): `npm run dev`
- lint (frontend): `npm run lint`
- build (frontend): `npm run build`
- api smoke (example): `curl http://localhost:8000/api/reports`
- backend smoke tests (example): `cd backend && python test_integration.py`
- e2e: `not configured` (обязательно добавить Playwright/Cypress для стабильного user-flow теста)

## Required Environment Variables
- Frontend (`.env.example`):
  - `VITE_API_BASE_URL`
  - `VITE_USE_MOCK_DATA`
- Backend:
  - Явный `backend/.env.example` отсутствует (если добавляется интеграция с внешними сервисами, обязателен шаблон env).

## Definition of Done
- Фича работает end-to-end (UI -> API -> data -> UI).
- Пройдены обязательные проверки:
  - lint = green
  - build = green
  - api smoke = green
  - e2e = green (или зафиксировано отсутствие e2e и добавлен план/минимум тестов)
- Обновлен `DEBUG.md` только подтвержденными фактами (команда + наблюдаемый результат).

## Safety Rules
- Не логировать секреты, токены, персональные данные.
- Все debug hooks только для dev-режима и легко удаляемые.
- Не писать "готово", если проверки не запускались.
- Любые ограничения/провалы проверок фиксировать явно, без скрытия.
