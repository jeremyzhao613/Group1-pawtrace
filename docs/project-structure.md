# PawTrace Project Structure

Use this file as the folder map for the repo. The codebase is a monorepo: it
contains the main web app, API server, showcase dashboard, desktop wrapper,
mobile packaging files, Cloudflare deployment code, hardware firmware, and a
Python video-analysis service.

## Start Here

| Need to work on | Main path | Notes |
| --- | --- | --- |
| Main PawTrace web app | `frontend/public/app/` | Static Vite app source. `app.js` is the main browser app logic. |
| Main app entry HTML | `frontend/index.html` | Vite entrypoint for the main web app. |
| Backend API | `backend/src/` | Express + TypeScript API, Prisma, auth, AI proxy, telemetry. |
| Database schema and seed | `backend/prisma/` | Prisma schema, migrations, seed scripts. |
| Digital twin showcase | `pawtrace-glass/` | Separate React + Three.js Vite app on port `3001`. |
| Cloudflare Worker API | `cloudflare/pawtrace-api/` | Worker API and D1 schema used by Cloudflare deployment. |
| Cloudflare config | `wrangler*.jsonc` | Root deployment configs for Pages and Worker targets. |
| Desktop wrapper | `desktop/` | Electron main and preload scripts. |
| Mobile packaging | `frontend/android/`, `frontend/ios/` | Capacitor generated/synced platform projects. |
| M5Stack firmware | `hardware/m5stack/` | Arduino sketches for BLE and Wi-Fi telemetry. |
| Hardware enclosure files | `hardware-design/` | Blender and Python design assets. |
| Monitor page | `monitor/` | Static monitor UI served at `/monitor`. |
| Python video service | `ai-video-service/` | FastAPI + OpenCV + YOLO service on port `8008`. |
| Shared images/assets | `assets/` | Source static assets copied or served by app builds. |
| Automation scripts | `scripts/` | Local DB, runtime config, packaging, telemetry test tools. |
| Documentation | `docs/` | Deployment, packaging, telemetry, and structure docs. |
| Product materials | `docs/product/` | Product overview, app module map, and MoSCoW prioritization. |
| Validation evidence | `docs/validation-report/` | Survey summary and user validation documents. |
| Plans and releases | `plans/` | Version plans, release notes, and startup guides. |

## Source vs Generated Folders

The following folders are source or hand-maintained project files:

- `frontend/public/app/`
- `frontend/index.html`
- `backend/src/`
- `backend/prisma/`
- `pawtrace-glass/src/`
- `cloudflare/pawtrace-api/`
- `desktop/`
- `hardware/`
- `hardware-design/`
- `monitor/`
- `ai-video-service/`
- `assets/`
- `docs/`
- `docs/product/`
- `docs/validation-report/`
- `scripts/`
- `plans/`

The following folders are generated, local, or dependency-heavy. They are useful
locally, but they should not be treated as primary source folders:

- `node_modules/`, `backend/node_modules/`, `frontend/node_modules/`, `pawtrace-glass/node_modules/`
- `frontend/dist/`, `backend/dist/`, `pawtrace-glass/dist/`
- `frontend/android/`, `frontend/ios/` after Capacitor sync
- `.local-pg/`
- `.wrangler/`
- `release/`
- `output/`
- `ai-video-service/.venv/`

## Common Workflows

### Run the full local app

```bash
npm run local:prepare
npm run dev
```

Open:

- Main app: `http://localhost:5173/`
- Backend API status: `http://localhost:3000/api/status`
- Monitor: `http://localhost:3000/monitor/index.html`

### Run the showcase dashboard

```bash
npm run dev:glass
```

Open `http://localhost:3001/`.

### Build for Cloudflare

```bash
npm run build:cloudflare
```

The build writes runtime API config into
`frontend/dist/app/runtime-config.js`.

### Package apps

```bash
npm run package:desktop:dir
npm run package:apk:debug
npm run package:ios
```

## Naming Notes

Release notes and plan Markdown belong in `plans/`, using names like
`pawtrace-10.1.0.md`. Duplicate or legacy copies belong in
`plans/archive/`, not in the repo root.

Product and validation files belong under `docs/product/` and
`docs/validation-report/`. Avoid adding PRD, MoSCoW, survey, or validation
evidence files directly to the repository root.

Avoid moving existing runtime folders casually. Several scripts and deployment
configs reference paths directly, especially `frontend/dist`,
`frontend/public/app`, `monitor`, `cloudflare/pawtrace-api`, and
`pawtrace-glass`.
