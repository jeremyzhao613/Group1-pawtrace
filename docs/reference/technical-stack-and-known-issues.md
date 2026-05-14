# PawTrace — Tech Stack & Known Issues

> A GitHub-ready overview of the PawTrace platform: every technology we ship, every known limitation, and the bugs we have already fixed.

- **Current Release:** 10.1.0
- **Project Type:** Full-stack pet community & health-management prototype
- **Repository Layout:** Monorepo
- **Audience:** New contributors, reviewers, and product stakeholders

---

## Table of Contents

1. [Product Snapshot](#1-product-snapshot)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Full Tech Stack](#3-full-tech-stack)
4. [Module Inventory](#4-module-inventory)
5. [Deployment Targets](#5-deployment-targets)
6. [Fixed Bugs / Resolved Issues](#6-fixed-bugs--resolved-issues)
7. [Known Issues & MVP Limits](#7-known-issues--mvp-limits)
8. [Safety & Disclaimer](#8-safety--disclaimer)
9. [References](#9-references)

---

## 1. Product Snapshot

PawTrace is a multi-tier prototype that combines a campus pet map, pet profiles, social chat, an AI assistant (Qwen / Qwen-VL), a standalone YOLO video behaviour-risk checker, and an optional M5Stack smart-vest telemetry pipeline. The same compiled web bundle is shipped to the browser, Android, iOS (via Capacitor) and Windows / macOS (via Electron).

---

## 2. High-Level Architecture

```text
                ┌──────────────────────────────────────────┐
                │              User Clients                │
                │  Web │ Android │ iOS │ Windows │ macOS    │
                └──────────────┬───────────────────────────┘
                               │  HTTPS / SSE
                ┌──────────────▼───────────────────────────┐
                │            PawTrace Platform             │
                │  Vite + React 18 + TS + Tailwind (web)   │
                │  Express + TS + Prisma + JWT (backend)   │
                │  Realtime telemetry hub (SSE)            │
                └───┬─────────────────────────────┬────────┘
                    │                             │
       ┌────────────▼──────────┐      ┌───────────▼────────────┐
       │   AI Intelligence     │      │   Persistence Tier     │
       │  DashScope Qwen/VL    │      │  PostgreSQL via Prisma │
       │  FastAPI + YOLOv8n    │      │  Cloudflare D1 (edge)  │
       └───────────────────────┘      │  Supabase Storage      │
                                      └────────────────────────┘
                    ▲
                    │  Wi-Fi HTTP/JSON  (BLE = provisioning only)
       ┌────────────┴───────────┐
       │   Field Device         │
       │  M5StickC Plus 1.1 +   │
       │  GPS v1.1 + MAX30102   │
       │  + 6-axis IMU          │
       └────────────────────────┘
```

> The full Mermaid source lives in `architecture-diagram.mmd` and can be rendered / exported as PNG at <https://mermaid.live>.

---

## 3. Full Tech Stack

### 3.1 Frontend

| Area | Technology | Notes |
| --- | --- | --- |
| Build tool | **Vite** | Sub-second HMR; dev server on `5173`. |
| UI framework | **React 18 + TypeScript** | Main entry `frontend/public/app/app.js`. |
| Styling | **Tailwind CSS** | Mobile-first; complemented by `app.css` + `style.tailwind.css`. |
| Mobile shell | **Capacitor** (Android + iOS) | Reuses the same web bundle. |
| Desktop shell | **Electron** | `desktop/main.cjs`; produces `nsis` / `dmg`. |
| Map | **Leaflet + OpenStreetMap tiles** | Tiles can be proxied through the Worker. |
| Realtime | **EventSource (SSE)** + polling fallback | M5Stack telemetry stream. |
| Showcase app | **`pawtrace-glass`** (separate Vite + React app) | Digital-twin dashboard on port `3001`. |
| Icons | Font Awesome CDN + local inline-SVG fallback | Core icons still render when the CDN is blocked. |

### 3.2 Backend API

| Area | Technology | Notes |
| --- | --- | --- |
| Runtime | **Node.js 18+** | |
| Framework | **Express 4 + TypeScript** | API server on port `3000`. |
| ORM | **Prisma** | PostgreSQL schema and migrations. |
| Validation | **Zod** | Route-boundary request validation. |
| Auth | **JWT (RFC 7519)** | Configured through the `JWT_SECRET` env var. |
| Uploads | **Multer** | Handles `multipart/form-data` for pet images and videos. |
| Realtime | **Server-Sent Events** | `/api/device/telemetry/stream`. |
| Static serving | `SERVE_WEB=1` enables single-port hosting of the built frontend | API-only mode by default. |

### 3.3 Persistence & Storage

| Layer | Choice | Notes |
| --- | --- | --- |
| Self-hosted DB | **PostgreSQL 14+** (project-local helper on `55432`) | `scripts/local-db.sh` for one-command startup. |
| Edge DB | **Cloudflare D1** (SQLite-compatible) | Accessed by the Worker API. |
| Object storage | **Supabase Storage** | Pet photos, chat attachments, uploaded videos. |
| Container option | Docker Compose | `docker-compose.yml` as a fallback path. |

### 3.4 AI Services

| Service | Stack | Purpose |
| --- | --- | --- |
| AI Assist | **Alibaba DashScope Qwen + Qwen-VL** through an OpenAI-compatible SDK | Text Q&A, image understanding, health / behaviour / diet suggestions. |
| Video Check | **Python 3.10 + FastAPI + OpenCV + Ultralytics YOLOv8n** | Behaviour-risk hints, movement score, timeline, abnormal events. |
| Default model | `yolov8n.pt` (auto-downloaded on first run, or placed under `ai-video-service/models/`) | Offline-friendly. |
| Service endpoint | `http://127.0.0.1:8008/analyze-video` | Configured via the `VIDEO_AI_URL` env var. |

### 3.5 Hardware

| Component | Detail |
| --- | --- |
| Controller | **M5StickC Plus 1.1** |
| GPS | **GPS v1.1** module |
| Heart-rate sensor | **MAX30102** Heart Rate HAT |
| Motion | Onboard **6-axis IMU** |
| Telemetry path | **Wi-Fi HTTP / JSON** POST to `/api/device/telemetry` |
| Provisioning | **BLE provisioning-only** (Wi-Fi creds / token / host; not stored as telemetry) |
| Firmware sources | `hardware/m5stack/pawtrace_wifi_telemetry.ino`, `pawtrace_ble_telemetry.ino` |

### 3.6 Edge / Cloud Deployment

| Capability | Cloudflare Service |
| --- | --- |
| Web hosting | **Cloudflare Pages** (main app + `pawtrace-glass`) |
| API runtime | **Cloudflare Worker** (`cloudflare/pawtrace-api/worker.js`) |
| Database | **Cloudflare D1** (`cloudflare/pawtrace-api/schema.sql`) |
| Deploy CLI | **Wrangler 4.x**, driven by `npm run deploy:cloudflare:*` |
| Alternative | Run the full Node + PostgreSQL backend on Railway / Fly / Render |

### 3.7 Tooling

- Package management: npm (root + backend + frontend + glass workspaces).
- Process orchestration: `concurrently`.
- Desktop packaging: `electron-builder`.
- One-command scripts: `npm run init`, `npm run run`, `npm run stop`, `npm run package:apk:debug`, `npm run package:exe`, `npm run package:dmg`, `npm run connect:m5`, `npm run test:m5`, `npm run live:m5`.
- CORS: automatically allows localhost, Electron, and Capacitor origins.

---

## 4. Module Inventory

```text
frontend/             Main web app (Vite + React + TS + Tailwind)
pawtrace-glass/       Digital-twin showcase app (standalone Vite app, port 3001)
backend/              Express backend, Prisma schema and migrations
ai-video-service/     Python FastAPI YOLOv8 video behaviour-analysis service
hardware/m5stack/     M5StickC Plus 1.1 Wi-Fi / BLE firmware
monitor/              Static operational monitor page served at `/monitor`
cloudflare/           Cloudflare Worker API + D1 schema
desktop/              Electron desktop shell
assets/               Shared static assets across sub-projects
scripts/              One-command scripts (DB, APK, Cloudflare, M5, runtime config)
docs/                 Architecture, deployment, packaging, M5Stack telemetry docs
plans（Product update and iteration logs）/  Product update and iteration logs
```

> See `docs/reference/project-structure.md` for the detailed sub-folder map.

---

## 5. Deployment Targets

| Target | Command | Notes |
| --- | --- | --- |
| Local development | `npm run run` | Starts the local DB, backend, and frontend. |
| Cloudflare (full) | `npm run deploy:cloudflare:full` | Worker API + D1 + Pages main app + Glass. |
| Cloudflare (UI only) | `npm run deploy:cloudflare:pages` | Frontend-only redeploys. |
| Android Debug APK | `npm run package:apk:debug` | Locates JDK 21 and the Android SDK automatically. |
| Windows EXE | `npm run package:exe` | `electron-builder --win nsis --x64`. |
| macOS DMG | `npm run package:dmg` | `electron-builder --mac dmg --arm64`. |
| Docker | `docker compose up -d` | Boots a local Postgres instance. |
| Single-port hosting | `SERVE_WEB=1` + `WEB_APP=frontend\|glass` | Backend serves the built frontend on `:3000`. |

---

## 6. Fixed Bugs / Resolved Issues

> Curated from the release notes in `plans（Product update and iteration logs）/`, listed from older to newer.

### 6.1 YOLO / Video Service

- **[8.1.1]** Fixed YOLOv8 default-loading configuration so first-run startup no longer fails when the model path, weights, or parameters are incomplete.
- **[8.1.1]** Improved video-service startup messages so environments without a cached model can locate the problem more easily.
- **[8.1.2]** Hardened the YOLO dependency declarations (`ai-video-service/requirements.txt`) to reduce runtime breakage caused by Python / OpenCV / Ultralytics version drift.
- **[8.1.2]** Locked `frontend/package-lock.json` and `backend/package-lock.json` so builds are reproducible across machines.
- **[README]** Documented the `numpy<2.0` requirement to avoid `_ARRAY_API` / `numpy.core.multiarray` import errors from older OpenCV wheels.

### 6.2 M5Stack Realtime Telemetry

- **[10.1.0]** Disabled gzip compression on the SSE route so realtime packets are no longer buffered before reaching the frontend.
- **[10.1.0]** Rejected BLE and USB-serial telemetry from being stored, preventing duplicate / low-quality data from polluting `HealthMeasurement` and `LocationPoint` tables.
- **[10.1.0]** Strictly filtered invalid GPS: rows with `gps_fix=0`, `location_valid=false`, or coordinates equal to `0,0` are no longer written to location history.
- **[10.1.0]** Added compact device responses (`x-device-response: compact` / `response=compact`) so embedded firmware spends less CPU parsing acknowledgements.
- **[10.1.0]** Recovered from network jitter by accepting batched `{"samples":[...]}` payloads; firmware now caches up to 24 packets locally and resends in batches of 4.
- **[10.1.0]** Stopped the firmware from masquerading board temperature as real body temperature: `temp_c` is now written into `board_temp_c` and the body-temperature field stays empty until a dedicated sensor is added.
- **[10.1.0]** Auto-allowed localhost, Electron and Capacitor origins in CORS, unblocking desktop / mobile debugging.
- **[10.1.0]** Added OpenStreetMap frame support to the CSP so the embedded map can load.

### 6.3 Frontend UX

- **[9.0.0]** Fixed the mobile Chat contacts toggle: the icon and `span` are now preserved instead of being destroyed by `textContent`.
- **[9.0.0]** Removed empty `src` attributes on Chat avatars so the browser no longer fires meaningless image requests.
- **[9.0.0]** Unified image preview and avatar updates through `setPreviewImageSource()` to eliminate empty src, leftover fallbacks, and inconsistent preview state.
- **[9.0.0]** The Share-image modal now clears the camera input on close, removing a stale-input bug.
- **[9.0.0]** AI Assist Photo / Video mode: results are now explicitly hidden while loading, fixing a UI overlap between the spinner and the previous result.
- **[9.0.0]** AI Assist preview failures now show a clear "JPG / PNG only" hint and the response surfaces a source label (`Qwen3.6`, `Qwen3.6 Vision`, or `Local fallback`).
- **[9.0.0]** Mobile bottom navigation: the active tab no longer stretches horizontally, and extra bottom padding prevents the bar from covering page content.
- **[9.0.0]** The legacy `#behaviour` hash route now redirects to the AI tab in video mode instead of 404-ing the user.
- **[10.1.0]** Added a local inline-SVG icon fallback so core navigation, map, health, and chat icons still render when the Font Awesome CDN is unreachable.
- **[10.1.0]** Hardened image fallbacks for user avatars, chat images, stickers, the map, pet photos, and NFC cards.
- **[10.1.0]** Mobile inputs and modals now suppress the bottom chrome, so the on-screen keyboard no longer occludes input fields.
- **[10.1.0]** Chat contact hover cards: fixed close / focus behaviour, improved avatar fallback, and added alt text + fallback for image / sticker messages.

### 6.4 Map & Glass Dashboard

- **[10.1.0]** Migrated the Glass map from an iframe to a controlled OSM tile layer, fixing tile load state and attribution rendering.
- **[10.1.0]** Corrected geofence projection so circular geofences are computed against the actual overlay aspect ratio and stay accurate at any viewport.
- **[10.1.0]** Marker labels are now auto-placed above or below the marker based on screen position to reduce overlap.
- **[10.1.0]** Reduced Glass polling overhead: realtime packets refresh the UI immediately and polling drops to a 15-second safety net.

### 6.5 Monitor Static Page

- **[9.0.0]** Added `align-items: start` to `hero-grid` and `section-grid` so cards no longer stretch to the tallest sibling.
- **[9.0.0]** Explicitly set `.chart-frame[hidden] { display: none }` to remove blank space when charts are hidden.
- **[9.0.0]** Forced `.chart-frame > canvas` to `display: block; width/height 100%` for stable chart rendering.
- **[9.0.0]** Added an inline-SVG favicon to silence the browser's 404 favicon request.

### 6.6 Cloudflare / Pages Access

- **[10.1.0]** Diagnosed and worked around the macOS Shadowrocket / VPN fake-ip DNS (198.18.0.x) issue that prevented `pages.dev` from opening; ships as `npm run cloudflare:fix-access` and `scripts/fix-cloudflare-pages-access.mjs`.
- **[10.1.0]** Cloudflare Pages production builds no longer generate unusable relative `/api` URLs: the build fails fast when `PAWTRACE_API_BASE_URL` is missing.
- **[10.1.0]** Fixed `/monitor/index.html` returning 404 on Pages by adding a `build:monitor` step that copies monitor assets into `frontend/dist/monitor`.

### 6.7 Packaging / Runtime Config

- **[10.1.0]** Fixed Android / desktop builds being unable to reach the local LAN backend: `scripts/write-runtime-config.mjs` now writes target-specific API defaults via `--target desktop|mobile|android|ios`.
- **[10.1.0]** Fixed missing Android permissions: `scripts/ensure-android-network.mjs` automatically writes `INTERNET`, `ACCESS_NETWORK_STATE`, `network_security_config`, and `usesCleartextTraffic`.
- **[10.1.0]** Fixed iOS App Transport Security rejecting local HTTP during development: `Info.plist` opens local-network HTTP exceptions (debug only).
- **[10.1.0]** Fixed broken NFC public pet cards across devices: `PAWTRACE_PUBLIC_APP_URL` is now written into runtime config alongside the API base URL.

### 6.8 Privacy & Auth

- **[9.0.0]** Fixed leftover persisted auth tokens in guest mode: guest sessions no longer write to local storage and in-memory state is cleared on logout.
- **[9.0.0]** Added missing `autocomplete` metadata (`username`, `current-password`, `new-password`, `name`) to login and signup inputs.
- **[9.0.0]** Made the Data & Privacy Agreement checkbox mandatory for login, signup, and guest mode to prevent accidental data sharing.
- **[9.0.0]** Guest sessions no longer report to the monitor collector, fixing unintended telemetry collection from guest users.

### 6.9 Pet Profile Validation

- **[9.0.0]** Fixed dirty / oversized pet form input: added length caps and regex validation for pet name, species, breed, status, health notes, location, emergency contact, and care notes.
- **[9.0.0]** Fixed duplicated / overlong traits: traits are split on English / Chinese commas and semicolons, deduplicated, and capped at 6 entries.
- **[9.0.0]** Birthday / adoption-date inputs no longer accept future dates.
- **[9.0.0]** Image uploads are now validated by type and size (max 5 MB).
- **[9.0.0]** Pet cards now show `Birth/adoption` so adopted pets are no longer mislabelled as `Birthday`.

### 6.10 NFC Emergency Pet Card

- **[9.0.0]** Some NFC scanner apps do not pass query strings; deep links also accept the hash form `#pets?nfc=...`.
- **[9.0.0]** Deep-link traffic no longer hits the login wall — guest sessions can open emergency cards directly.
- **[9.0.0]** Contact links auto-convert: URLs open directly, email-like strings become `mailto:`, and phone-like strings become `tel:`.

---

## 7. Known Issues & MVP Limits

> Boundaries we explicitly call out before publishing the prototype. These also live in the project README.

### 7.1 Video Check

- Video Check is an **MVP**: it uses sampled-frame YOLO detection plus a simple movement score and does **not** perform full pet pose estimation or veterinary diagnosis.
- Rapid movement can come from excitement, shaking, scratching, unstable video, or camera motion. Results are *behaviour-risk hints* only.
- Historical comparison currently uses demo data; a future release should back it with per-pet saved baselines.
- The Python service downloads `yolov8n.pt` on first run. Offline environments must place the file under `ai-video-service/models/`.
- The Python environment must pin `numpy<2.0`; NumPy 2.x breaks older OpenCV wheels with `_ARRAY_API` or `numpy.core.multiarray` import errors.

### 7.2 AI Assist

- AI output can hallucinate. The system prompt restricts answers to supportive guidance, and every response is rendered with a "consult a veterinarian" disclaimer.
- The app must not assert concrete conditions such as ear mites, bacterial infection, fracture, or illness — only observation-based risk hints are allowed.

### 7.3 Hardware (M5Stack)

- The physical M5StickC Plus 1.1 GPS needs an **outdoor sky view** to produce valid coordinates.
- The Heart Rate HAT must be detected correctly and have skin contact to return readings.
- Onboard `board_temp_c` is **not real body temperature**; no dedicated body-temperature sensor is currently installed.
- BLE is provisioning-only (Wi-Fi creds / token / host). Telemetry must use Wi-Fi HTTP.

### 7.4 Cloudflare Worker API

- The Worker API is a Cloudflare-native subset and is **not** a 100% drop-in replacement for the full Node + Express + Prisma + PostgreSQL + Multer + Python YOLO stack.
- Video analysis on Cloudflare is a placeholder; full YOLO inference still requires the standalone Python service.
- `npm run cloudflare:d1:init` must be executed before the first production deploy.
- The Worker requires `JWT_SECRET`, `DASHSCOPE_API_KEY`, and `DEVICE_INGEST_TOKEN` secrets to be configured.

### 7.5 Mobile / Desktop Packaging

- Android / iOS currently allow **local LAN HTTP** (debug-only ATS / cleartext exceptions). Production store builds must tighten these to HTTPS.
- The Windows EXE is **not code-signed**; SmartScreen will warn users on first install.
- iOS signing is currently set to development team `YSVHWXY9N6`; third parties must switch this before building.

### 7.6 Database & Storage

- The project-local PostgreSQL runs on port `55432` to stay isolated from system Postgres. Do not write production data to this instance.
- Supabase Storage uploads require `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_BUCKET`.
- Cloudflare D1 is SQLite-compatible; complex queries may diverge from PostgreSQL behaviour.

### 7.7 Frontend / Browser

- Web NFC requires HTTPS and a compatible browser (works mainly on Android Chrome today); iOS Safari does not support it.
- Some browsers still drop long-idle EventSource connections; the frontend mitigates this with 1-second latest polling and 30-second history backfill.
- Font Awesome CDN may be unreachable on restricted networks. The local SVG fallback only covers **core** icons.

### 7.8 General

- This project is a **student / competition / demo prototype** and does not constitute medical, veterinary, legal, or commercial advice.
- The root `package.json` is synchronized to `10.1.0`; subpackage versions may still lag.
- A historical duplicate `plans（Product update and iteration logs）/archive/pawtrace-10.1.0-duplicate-no-extension.md` is kept for archival reasons only and should not be edited further.

---

## 8. Safety & Disclaimer

```
This result is only a behavior-risk hint and does not constitute veterinary diagnosis.
```

- The disclaimer is attached to every AI Assist and Video Check output.
- The app must not directly claim conditions such as ear mites, bacterial infection, fracture, or illness — only *observation-based risk hints*.
- In an emergency, contact a veterinarian instead of relying on PawTrace.

---

## 9. References

- GitHub homepage: `README.md`
- Extended technical README: `docs/reference/extended-technical-readme.md`
- Project structure: `docs/reference/project-structure.md`
- Cloudflare deployment: `docs/deployment/cloudflare.md`
- M5Stack telemetry: `docs/hardware/m5stack-telemetry.md`
- Desktop EXE packaging: `docs/packaging/desktop-exe.md`
- Mobile packaging: `docs/packaging/mobile.md` and `docs/packaging/release-checklist.md`
- Release notes: `plans（Product update and iteration logs）/pawtrace-4.0.1.plan.md` -> `plans（Product update and iteration logs）/pawtrace-10.1.0.md`

---

_Last updated: 2026-05-14 · Document curated from docs/reference/extended-technical-readme.md and the `plans（Product update and iteration logs）/` release-notes folder._
