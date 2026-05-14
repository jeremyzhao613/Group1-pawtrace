# PawTrace

PawTrace is a full-stack campus pet care prototype. It combines a pet map, pet profiles, chat, health telemetry, AI assistance, YOLO video behavior-risk checks, and optional M5Stack smart-collar data.

## Start Here

| Need | Open |
| --- | --- |
| Understand the product in 2 minutes | [Product overview](docs/product/README.md) |
| See the app modules and source folders | [Project structure](docs/reference/project-structure.md) |
| Review technology choices and current limits | [Tech stack and known issues](docs/reference/technical-stack-and-known-issues.md) |
| Check validation evidence | [Validation report files](<validation-report（User testing and product improvement）/README.md>) |
| Deploy to Cloudflare | [Cloudflare deployment guide](docs/deployment/cloudflare.md) |
| Package mobile, desktop, or release builds | [Docs index](docs/README.md) |
| Keep the repository organized | [Repository maintenance guide](docs/reference/repository-maintenance.md) |
| Read release notes | [Plans and releases](plans/README.md) |

## What The App Does

- Shows a campus pet map with pet-friendly places, pet pins, and location cards.
- Lets owners create, edit, and manage pet profiles.
- Provides friend chat and pet-owner social interactions.
- Runs AI Assist for text, image, health, behavior, and diet support.
- Runs a standalone Video Check flow for YOLO-based behavior-risk hints.
- Displays health readings, vitals trends, and M5Stack Wi-Fi telemetry.
- Supports a monitor page, a digital-twin showcase app, and mobile/desktop packaging.

Safety boundary: PawTrace provides observation and behavior-risk hints only. It must not claim veterinary diagnosis.

## Run Locally

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

Open:

| Surface | URL |
| --- | --- |
| Main web app | `http://localhost:5173/` |
| Backend status | `http://localhost:3000/api/status` |
| Monitor | `http://localhost:3000/monitor/index.html` |
| Showcase app | `http://localhost:3001/` |
| YOLO video service | `http://127.0.0.1:8008/analyze-video` |

Demo account:

```text
username: demo
password: demo123
```

Guest access is also available from the login screen.

## Repository Map

| Path | Purpose |
| --- | --- |
| `frontend/` | Main Vite web app and Capacitor mobile shell files. |
| `backend/` | Express API, Prisma schema, migrations, auth, AI proxy, telemetry routes. |
| `pawtrace-glass/` | Separate digital-twin showcase app on port `3001`. |
| `ai-video-service/` | FastAPI, OpenCV, and YOLO video behavior-risk service. |
| `hardware/` | M5Stack firmware for Wi-Fi telemetry and BLE provisioning. |
| `hardware-design/` | Hardware shell diagrams and enclosure assets. |
| `cloudflare/` | Cloudflare Worker API and D1 schema. |
| `desktop/` | Electron desktop wrapper. |
| `monitor/` | Static monitor UI served at `/monitor`. |
| `docs/` | Product, architecture, deployment, packaging, and validation docs. |
| `plans/` | Release notes and project planning records. |

## Product And Evidence Files

Product and coursework materials are intentionally grouped under `docs/` instead of the repository root:

| Material | Location |
| --- | --- |
| Product overview and module map | [docs/product/README.md](docs/product/README.md) |
| MoSCoW prioritization PDF | [docs/product/pawtrace-moscow-prioritization.pdf](docs/product/pawtrace-moscow-prioritization.pdf) |
| Validation report evidence | [validation-report（User testing and product improvement）/README.md](<validation-report（User testing and product improvement）/README.md>) |
| Tech stack and known issues | [docs/reference/technical-stack-and-known-issues.md](docs/reference/technical-stack-and-known-issues.md) |
| Extended technical README | [docs/reference/extended-technical-readme.md](docs/reference/extended-technical-readme.md) |

## Common Commands

```bash
npm run run                         # prepare DB, then start backend and frontend
npm run stop                        # stop local services
npm run build                       # build frontend, glass app, and backend
npm run build:web                   # build main web app only
npm run dev:glass                   # start showcase app
npm run deploy:cloudflare:full      # Worker API, D1 schema, and Pages apps
npm run package:apk:debug           # Android debug APK
npm run package:desktop:dir         # unpacked desktop build
```

## Verification Checklist

Before a demo or submission, check:

- `npm run build --prefix frontend`
- `npm run build --prefix backend`
- `node --check frontend/public/app/app.js`
- `git diff --check`
- Main app, monitor, backend status, showcase app, Health, AI Assist, Video Check, and Profile pages open without console errors.

For detailed setup, Cloudflare, M5Stack, packaging, and release notes, start from [docs/README.md](docs/README.md).
