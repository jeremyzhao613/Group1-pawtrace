# PawTrace

PawTrace is a full-stack pet community and health-management prototype. It combines a campus pet map, pet profiles, social chat, Qwen-powered AI Assist, and a standalone YOLO-based pet video behavior-risk check.

The main web app is a Vite + Tailwind single-page frontend. The backend is Node.js + Express + TypeScript with Prisma + PostgreSQL and JWT auth. By default, the backend runs as an API and monitor service only. It does not serve the frontend on port 3000 unless `SERVE_WEB=1` is enabled.

## Current Release: 8.0.0

8.0.0 is the YOLO Video Check and responsive UI hardening release.

Important updates:

- Added standalone `Video Check` for pet video behavior-risk analysis.
- Added `POST /api/ai/video-behavior` in the Express backend.
- Added `ai-video-service/`, a Python FastAPI service using OpenCV and Ultralytics YOLO.
- Separated `Video Check` from `AI Assist`: `AI Assist` is for AI API features, while `Video Check` is for YOLO video analysis.
- Added behavior-risk disclaimer language and avoided unsupported medical diagnosis claims.
- Reworked mobile bottom navigation into `Map / Pets / Chat / Health / More`.
- Moved `Video Check / AI Assist / Profile` into the mobile `More` panel.
- Fixed responsive layout issues across Map, Profile, Health, AI Assist, Video Check, login, and mobile pages.
- Fixed modal focus restore console errors.
- Added 8.0.0 release documentation in `plans/plans/pawtrace-8.0.0.plan.md`.

Safety positioning:

`This result is only a behavior-risk hint and does not constitute veterinary diagnosis.`

The app should not directly claim conditions such as ear mites, bacterial infection, fracture, or illness. It should only suggest observation-based risk hints, such as possible discomfort or the need to monitor changes.

## Entrypoints

- Main web app: `http://localhost:5173/`
- Backend API status: `http://localhost:3000/api/status`
- Monitor: `http://localhost:3000/monitor/index.html`
- Showcase app: `http://localhost:3001/`
- Python YOLO service: `http://127.0.0.1:8008/analyze-video`

## Tech Stack

- Frontend: Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript + Prisma + PostgreSQL
- AI text/image: DashScope Qwen text and Qwen-VL vision, configured only on the backend
- AI video: standalone FastAPI + OpenCV + Ultralytics YOLO service
- Database: PostgreSQL
- Showcase app: separate `pawtrace-glass` workspace

## Project Structure

```text
frontend/             Main PawTrace web app
pawtrace-glass/       Separate digital-twin showcase app, default port 3001
backend/              Express API, Prisma schema, migrations
ai-video-service/     Python FastAPI YOLO video behavior-analysis service
assets/               Shared static assets, mounted as /assets in production
monitor/              Static monitor UI, served at /monitor
scripts/local-db.sh   Project-local PostgreSQL helper
plans/plans/          Release notes and project logs
```

## Quick Start

First-time setup:

```bash
npm install
npm run install:all
npm run init
```

Daily startup:

```bash
npm run run
```

Stop services:

```bash
npm run stop
```

## Local Development Without Docker Desktop

Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Start the project-local database on port `55432`:

```bash
npm run db:local:start
```

Prepare the local database:

```bash
npm run db:migrate:local
npm run db:seed:local
```

Start backend and frontend:

```bash
npm run dev
```

Then open:

- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:3000/api/status`
- Monitor: `http://localhost:3000/monitor/index.html`

## Environment Variables

Copy `backend/.env.example` to `backend/.env`.

Recommended local values:

```bash
DATABASE_URL="postgresql://pawtrace@localhost:55432/pawtrace"
JWT_SECRET="replace-with-a-strong-local-secret"
DASHSCOPE_API_KEY="your-qwen-api-key"
VIDEO_AI_URL="http://127.0.0.1:8008/analyze-video"
VIDEO_AI_TIMEOUT_MS="120000"
SERVE_WEB="0"
```

Important variables:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: use a strong random value outside local development.
- `DASHSCOPE_API_KEY`: enables Qwen and Qwen-VL features.
- `VIDEO_AI_URL`: Python YOLO video analysis service URL.
- `VIDEO_AI_TIMEOUT_MS`: backend timeout for video analysis requests.
- `MONITOR_API_TOKEN`: optional protection for `/api/monitor/*`.
- `SERVE_WEB=0`: default API-only backend.
- `SERVE_WEB=1`: serve built frontend assets from the backend for single-port deployment.
- `WEB_APP=frontend | glass`: selects which built web app to serve when `SERVE_WEB=1`.

## Pet Video Behavior Analysis

Architecture:

```text
Frontend Video Check page
  -> POST /api/ai/video-behavior
  -> Express backend upload proxy
  -> VIDEO_AI_URL
  -> Python FastAPI /analyze-video
  -> OpenCV + Ultralytics YOLO sampled-frame analysis
  -> JSON summary, timeline, events, advice, disclaimer
  -> Frontend result cards
```

Start the Python YOLO service:

```bash
cd ai-video-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8008
```

Configure the backend:

```bash
VIDEO_AI_URL=http://127.0.0.1:8008/analyze-video
```

Start PawTrace:

```bash
npm run run
```

Test the upload flow:

1. Open the frontend.
2. Open the standalone `Video Check` tab.
3. Upload an `mp4`, `mov`, `avi`, or `webm` clip.
4. Click `Start YOLO Check`.

The result includes:

- `riskLevel`
- `activityType`
- `durationSec`
- `detectionRate`
- `movementScore`
- abnormal event count
- abnormal event list with time, type, confidence, and note
- behavior timeline
- observation advice
- disclaimer

## AI Assist vs Video Check

`AI Assist`:

- Uses backend AI API routes.
- Handles Qwen-VL visual assistance.
- Handles text-based health, behavior, and diet reports.
- Works with image and text inputs.

`Video Check`:

- Uses the Python YOLO service.
- Handles uploaded pet videos.
- Samples frames and detects cat/dog subjects.
- Calculates movement score, detection rate, timeline, events, and behavior-risk hints.
- Does not diagnose disease.

## Features

- Campus pet map: pet-friendly places, search, reminders, pet pins, and location cards.
- Pet management: create, edit, and remove private pet cards.
- Friends chat: virtual pet-owner conversations with pet context.
- AI Assist: Qwen-VL visual assistance plus text health, behavior, and diet reports.
- Video Check: short-video upload, YOLO behavior-risk analysis, timeline, events, advice, and disclaimer.
- Health monitoring: manual readings, recent vitals, trend charts, and status summary.
- Profile center: owner card, pet manager, settings, behavior insight, and care snapshot.
- Responsive UI: desktop, tablet, and mobile layouts with mobile `More` navigation.
- Dark mode: manual toggle in the top-right header.

## Demo Account

- Username: `demo`
- Password: `demo123`

Guest access is also available from the login screen.

## Common Commands

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
- Build backend: `npm run build --prefix backend`
- Build frontend: `npm run build --prefix frontend`

## Verification Checklist

Recommended checks before presenting or pushing:

```bash
npm run build --prefix frontend
npm run build --prefix backend
node --check frontend/public/app/app.js
git diff --check
```

Manual checks:

- `http://localhost:5173/` opens the main PawTrace app.
- `http://localhost:3000/api/status` returns backend status JSON.
- `POST /api/ai/video-behavior` without a file returns a clear validation error.
- Mobile width around `390px` has no page-level horizontal scrolling.
- `Map / Pets / Chat / Health / Video Check / AI Assist / Profile` are accessible.
- Console should not show uncaught frontend exceptions.

## Known MVP Limits

- Video Check is an MVP and uses sampled-frame YOLO detection plus simple movement scoring.
- It does not perform full pet pose estimation or veterinary diagnosis.
- Rapid movement can be caused by excitement, shaking, scratching, unstable video, or camera motion.
- Historical comparison is currently demo-oriented and should be backed by saved per-pet baselines in a future release.
- The Python YOLO service may download model weights on first run.

## Release Notes

- 8.0.0: `plans/plans/pawtrace-8.0.0.plan.md`
- 7.1.0: `plans/plans/pawtrace-7.1.0.plan.md`
- 7.0.0: `plans/plans/pawtrace-7.0.0.plan.md`
- 6.0.0: `plans/plans/pawtrace-6.0.0.plan.md`
