# PawTrace Product Overview

This folder collects the product-facing materials for PawTrace. Use it when you need to understand what the app is, what it includes, and which supporting files matter for review or presentation.

## Product Purpose

PawTrace is a campus pet care and health-management prototype. It helps pet owners, student volunteers, and project reviewers see pet profiles, map activity, health readings, AI support, and optional smart-collar telemetry in one system.

## Core Users

| User | Main need |
| --- | --- |
| Pet owner | Track pets, manage health records, ask AI care questions, and share contact information when needed. |
| Campus helper or volunteer | View map context, pet status, recent activity, and care notes. |
| Project evaluator | See a complete full-stack app with product logic, telemetry, AI features, deployment paths, and validation evidence. |
| Developer | Find the right module quickly and run or package the app without hunting through root files. |

## App Modules

| Module | Purpose | Main code path |
| --- | --- | --- |
| Map | Pet-friendly places, pet pins, location cards, and map search. | `frontend/public/app/`, `frontend/public/map.js` |
| Pets | Create, edit, and manage pet profiles. | `frontend/public/app/app.js`, `backend/src/` |
| Chat | Pet-owner social chat and contextual conversations. | `frontend/public/app/app.js`, `backend/src/` |
| Health | Manual readings, vitals trends, status summary, and M5Stack telemetry display. | `frontend/public/app/app.js`, `hardware/m5stack/`, `backend/src/` |
| AI Assist | Text, image, health, behavior, and diet assistance through backend AI routes. | `backend/src/services/aiService.ts`, `frontend/public/app/app.js` |
| Video Check | YOLO-based uploaded-video behavior-risk hints. | `ai-video-service/`, `backend/src/`, `frontend/public/app/` |
| NFC/Public card | Shareable pet information and owner contact flow. | `frontend/public/app/app.js`, `backend/src/` |
| Monitor | Operational API and telemetry monitor. | `monitor/`, `backend/src/` |
| Glass showcase | Digital-twin showcase dashboard. | `pawtrace-glass/` |

## Product Documents

| Document | Use |
| --- | --- |
| [Product requirements page](product-requirements.md) | Web-readable PRD covering product purpose, user stories, must-have features, technical architecture, and success criteria. |
| [PRD PDF](PRD.pdf) | Original uploaded Product Requirements Document. |
| [Feature prioritization page](feature-prioritization.md) | Web-readable MoSCoW feature priority table. |
| [MoSCoW prioritization PDF](pawtrace-moscow-prioritization.pdf) | Original uploaded feature priority and scope document. |
| [Validation evidence index](<../../validation-report（User testing and product improvement）/README.md>) | Survey summary and user validation documents. |
| [Tech stack and known issues](../reference/technical-stack-and-known-issues.md) | Technology choices, resolved bugs, known MVP limits, and safety notes. |
| [Project structure](../reference/project-structure.md) | Source folder guide for contributors. |

## Demo Flow

1. Open the main app at `http://localhost:5173/`.
2. Log in with `demo / demo123` or use guest mode.
3. Show Map, Pets, Chat, Health, AI Assist, Video Check, and Profile.
4. Open Monitor at `http://localhost:3000/monitor/index.html`.
5. If the M5Stack demo is active, show the latest telemetry in Health and on the map.
6. Open the showcase app at `http://localhost:3001/`.

## Product Boundaries

- AI and video outputs are behavior-risk hints, not diagnosis.
- Guest mode should remain local-only unless the user explicitly signs in.
- BLE is provisioning-only; Wi-Fi HTTP telemetry is the main M5Stack data path.
- Some evidence files are coursework artifacts, so they live in the root `validation-report（User testing and product improvement）/` folder instead of the runtime source folders.
