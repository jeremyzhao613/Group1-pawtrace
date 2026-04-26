PawTrace is a full-stack pet community and health-management prototype. It combines a campus pet map, social features, pet profiles, AI chat, image-based AI health assistance, and video-based behavior-risk hints.

The main web app is a Vite + Tailwind single-page frontend. The backend is Node.js + Express + TypeScript with Prisma + PostgreSQL and JWT auth. By default, the backend runs as an API/monitor service only and does not serve the frontend on port 3000 unless `SERVE_WEB=1` is enabled.


PawTrace Web App

Quick Start
- First-time setup: `npm install && npm run install:all && npm run init`
- Daily startup: `npm run run`
- Stop services: `npm run stop`

Tech Stack
- Frontend: Vite + Tailwind
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- AI text/image: DashScope Qwen text + Qwen-VL vision, configured only on the backend
- AI video: standalone FastAPI + Ultralytics YOLO service for pet behavior-risk hints, not veterinary diagnosis

Project Structure
- frontend/             Main PawTrace web app
- pawtrace-glass/       Separate digital-twin showcase app, default port 3001
- backend/              Express API, Prisma schema, migrations
- ai-video-service/     Python FastAPI YOLO video behavior-analysis service
- assets/               Shared static assets, mounted as /assets in production
- monitor/              Static monitor UI, served at /monitor
- scripts/local-db.sh   Project-local PostgreSQL helper

Backend Environment Variables
- Copy `backend/.env.example` to `backend/.env`
- Recommended local DB: `DATABASE_URL="postgresql://pawtrace@localhost:55432/pawtrace"`
- Docker Compose DB: `DATABASE_URL="postgresql://pawtrace:pawtrace@localhost:5432/pawtrace"`
- `JWT_SECRET`: use a strong random value outside local development
- `DASHSCOPE_API_KEY`: Qwen/Qwen-VL features
- `VIDEO_AI_URL`: default `http://127.0.0.1:8008/analyze-video`
- `VIDEO_AI_TIMEOUT_MS`: default `120000`
- `MONITOR_API_TOKEN`: optional protection for `/api/monitor/*`
- `SERVE_WEB=0`: default API-only backend; set to `1` for single-port deployment

Local Development Without Docker
1. Install dependencies
- Root: `npm install`
- Backend: `npm install --prefix backend`
- Frontend: `npm install --prefix frontend`

2. Start the project-local database on port 55432
- `npm run db:local:start`

3. Initialize the database
- `npm run db:migrate`
- `npm run db:seed`

4. Start backend and frontend
- `npm run dev`
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api/status`
- Monitor: `http://localhost:3000/monitor/index.html`

Pet Video Behavior Analysis
Architecture:

`Frontend -> Node/Express /api/ai/video-behavior -> Python FastAPI /analyze-video -> JSON result -> Frontend display`

1. Start the Python YOLO service

```bash
cd ai-video-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8008
```

2. Configure the backend

Add this to `backend/.env`:

```bash
VIDEO_AI_URL=http://127.0.0.1:8008/analyze-video
```

3. Start PawTrace

```bash
npm run run
```

4. Test the upload flow
- Open the frontend.
- Open the standalone `Video Check` tab.
- Upload an `mp4`, `mov`, `avi`, or `webm` clip.
- Click `Start YOLO Check`.

The result includes risk level, activity type, duration, detection rate, movement score, abnormal events, timeline, advice, and this disclaimer:

`This result is only a behavior-risk hint and does not constitute veterinary diagnosis.`

Common Commands
- One-command startup: `npm run run`
- First-time initialization: `npm run init`
- Stop all services: `npm run stop`
- Prepare and start development: `npm run local:dev`
- Local DB status: `npm run db:local:status`
- Reset local DB: `npm run db:local:reset`
- Stop local DB: `npm run db:local:stop`
- Build all apps: `npm run build`
- Build main web app: `npm run build:web`
- Build showcase app: `npm run build:glass`
- Start showcase app: `npm run dev:glass`

Demo Account
- Username: `demo`
- Password: `demo123`

Features
- Campus pet map: pet-friendly places, search, notes
- Pet management: create, edit, and remove pet cards
- AI chat: virtual pet-owner conversations powered by Qwen
- AI Assist area: Qwen-VL visual assistance plus text health, behavior, and diet reports through AI API routes
- Video Check: uploads short videos, forwards them to the Python YOLO service, and returns activity type, risk level, events, timeline, and observation advice
- Dark mode: manual toggle in the top-right header
- Paw animation easter egg: bottom-right paw button
