# PawTrace

GitHub homepage: `README.md`.

This text file is kept as the extended technical README. For the fastest review
path, start with `README.md`, then use `docs/product/README.md`,
`docs/reference/project-structure.md`, and `docs/README.md`.

PawTrace is a full-stack pet community and health-management prototype. It combines a campus pet map, pet profiles, social chat, Qwen-powered AI Assist, and a standalone YOLO-based pet video behavior-risk check.

The main web app is a Vite + Tailwind single-page frontend. The backend is Node.js + Express + TypeScript with Prisma + PostgreSQL and JWT auth. By default, the backend runs as an API and monitor service only. It does not serve the frontend on port 3000 unless `SERVE_WEB=1` is enabled.

## Current Release: 10.1.0

10.1.0 is the cloud-connected, realtime telemetry, and cross-platform packaging release candidate.

Important updates:

- Added Cloudflare Worker + D1 API deployment alongside the Pages frontends.
- Added runtime API configuration for web, Android, iOS, and desktop packages.
- Added realtime M5Stack Wi-Fi telemetry with SSE plus polling fallback.
- Added one-command M5 demo/test tooling: `connect:m5`, `test:m5`, and `live:m5`.
- Hardened mobile/LAN/packaged-app network behavior and Cloudflare Pages access diagnostics.
- Kept the standalone YOLO Video Check safety wording from the 8.0.0 release line.

Safety positioning:

`This result is only a behavior-risk hint and does not constitute veterinary diagnosis.`

The app should not directly claim conditions such as ear mites, bacterial infection, fracture, or illness. It should only suggest observation-based risk hints, such as possible discomfort or the need to monitor changes.

## Entrypoints

- Main web app: `http://localhost:5173/`
- Backend API status: `http://localhost:3000/api/status`
- Monitor: `http://localhost:3000/monitor/index.html`
- Showcase app: `http://localhost:3001/`
- Python YOLO service: `http://127.0.0.1:8008/analyze-video`

Same Wi-Fi / phone-hotspot demos use the computer LAN IP instead of `localhost`:

- Main web app: `http://<computer-lan-ip>:5173/`
- Backend API: `http://<computer-lan-ip>:3000/api/status`
- Showcase app: `http://<computer-lan-ip>:3001/`

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
plans/                Release notes and project logs
```

For a fuller folder map, source/generated folder guide, and common task paths,
see `docs/reference/project-structure.md`.

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

## Cloudflare Deployment

The fastest production-style path is Cloudflare Pages for both frontends plus a
Cloudflare Worker API backed by D1:

Check Cloudflare auth:

```bash
npm run cloudflare:whoami
```

Deploy the Worker API, D1 schema, main frontend, and glass frontend:

```bash
npm run deploy:cloudflare:full
```

Deploy only the two Pages frontends after UI-only changes:

```bash
npm run deploy:cloudflare:pages
```

Preview deploy:

```bash
npm run deploy:cloudflare:preview
```

Production Cloudflare builds write `PAWTRACE_API_BASE_URL` into
`frontend/dist/app/runtime-config.js`; the default is the current Worker API.
For a custom Node/Express API, set `PAWTRACE_API_BASE_URL` to that HTTPS URL and
include the Pages domains in the backend `CORS_ORIGIN` value.
See `docs/deployment/cloudflare.md` for the complete Cloudflare architecture.

If `pages.dev` cannot open on a Mac with Shadowrocket/VPN enabled, check for
fake-ip DNS and apply the local hosts fix:

```bash
npm run cloudflare:fix-access
sudo node ./scripts/fix-cloudflare-pages-access.mjs --apply
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

For another phone/computer on the same Wi-Fi, find this computer's LAN IP and open `http://<computer-lan-ip>:5173/` or `http://<computer-lan-ip>:3001/`. The 3001 showcase page proxies `/api` to the backend on port `3000`, so it shows the same M5Stack Wi-Fi telemetry as the main app.

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
- `DEVICE_INGEST_TOKEN`: shared token for M5Stack `/api/device/telemetry` ingest.
- `DEVICE_INGEST_ALLOW_LAN=true`: local hotspot/LAN demo mode that lets private-network M5Stack clients upload without a token.
- `SERVE_WEB=0`: default API-only backend.
- `SERVE_WEB=1`: serve built frontend assets from the backend for single-port deployment.
- `WEB_APP=frontend | glass`: selects which built web app to serve when `SERVE_WEB=1`.

## M5Stack Telemetry

M5StickC Plus 1.1 with GPS v1.1 and Heart Rate HAT now uses Wi-Fi as the primary transport. After joining the same hotspot/LAN as the backend, it can POST JSON telemetry to:

```text
POST /api/device/telemetry
```

The frontend polls:

```text
GET /api/device/telemetry/latest
```

and merges the latest device data into the map, health panel, and pet cards. The backend persists telemetry to PostgreSQL and keeps a temporary latest-value cache for fast display. See `docs/hardware/m5stack-telemetry.md`.

BLE is provisioning-only: use `Health -> BLE WiFi Setup` to send the M5 Wi-Fi SSID, password, backend host, and token. BLE packets are not stored as telemetry.

The Wi-Fi firmware also exposes a same-network M5 API at `http://<m5-ip>:8080/status`, `/message`, and `/upload` for local demos without Bluetooth.

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

The default model is `yolov8n.pt`. If the machine cannot download weights on first run, put the model file under `ai-video-service/models/` and start with:

```bash
YOLO_MODEL_NAME=./models/yolov8n.pt uvicorn app:app --host 0.0.0.0 --port 8008
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

Same Wi-Fi check:

```bash
ipconfig getifaddr en0
npm run dev:glass
```

Then open `http://<computer-lan-ip>:3001/` from a device on the same Wi-Fi.

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
- `http://<computer-lan-ip>:3001/` opens the showcase app from another same-Wi-Fi device.
- `http://localhost:3000/api/status` returns backend status JSON.
- `POST /api/device/telemetry` rejects BLE telemetry and accepts Wi-Fi telemetry.
- `POST /api/ai/video-behavior` without a file returns a clear validation error.
- Mobile width around `390px` has no page-level horizontal scrolling.
- `Map / Pets / Chat / Health / Video Check / AI Assist / Profile` are accessible.
- Console should not show uncaught frontend exceptions.

## Known MVP Limits

- Video Check is an MVP and uses sampled-frame YOLO detection plus simple movement scoring.
- It does not perform full pet pose estimation or veterinary diagnosis.
- Rapid movement can be caused by excitement, shaking, scratching, unstable video, or camera motion.
- Historical comparison is currently demo-oriented and should be backed by saved per-pet baselines in a future release.
- The Python YOLO service may download `yolov8n.pt` model weights on first run.
- The Python environment should use `numpy<2.0`; NumPy 2.x can break older OpenCV wheels with `_ARRAY_API` or `numpy.core.multiarray` import errors.

## Release Notes

- 8.0.0: `plans/pawtrace-8.0.0.plan.md`
- 7.1.0: `plans/pawtrace-7.1.0.plan.md`
- 7.0.0: `plans/pawtrace-7.0.0.plan.md`
- 6.0.0: `plans/pawtrace-6.0.0.plan.md`
