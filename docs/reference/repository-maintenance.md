# PawTrace Repository Maintenance

Use this guide when adding new files to the repository. The goal is to keep the GitHub homepage readable while preserving stable runtime paths for the app.

## Do Not Move Without Checking Scripts

These paths are part of the runtime, build, or deployment contract:

| Path | Why it stays stable |
| --- | --- |
| `frontend/` | Main Vite app, Capacitor files, and Cloudflare Pages build input. |
| `backend/` | Express API, Prisma schema, migrations, and local DB scripts. |
| `pawtrace-glass/` | Separate showcase app and Cloudflare Pages project. |
| `cloudflare/` | Worker API, D1 schema, and Wrangler deployment config. |
| `monitor/` | Static monitor page copied into frontend builds. |
| `hardware/` | M5Stack firmware source paths used by hardware docs and scripts. |
| `desktop/` | Electron entry files used by desktop packaging. |
| `scripts/` | Root automation commands called by `package.json`. |

## Where New Files Should Go

| File type | Location |
| --- | --- |
| Product overview, PRD, MoSCoW, screenshots for review | `docs/product/` |
| User research, surveys, validation reports, interview notes | `validation-report（User testing and product improvement）/` |
| Cloudflare, API hosting, domain, and deployment notes | `docs/deployment/` |
| Android, iOS, desktop, and release packaging notes | `docs/packaging/` |
| M5Stack, sensors, firmware behavior, and hardware data-flow docs | `docs/hardware/` |
| Long technical references, structure maps, known issues | `docs/reference/` |
| Version logs and historical implementation records | `plans/` |
| Shared source images used by the app | `assets/` |
| Hardware shell and enclosure design assets | `hardware-design（Core files for 3D printing and product modeling based on m5 hardware）/` |

## Root Directory Rule

The root should stay small. Keep only files that a reviewer or build tool expects immediately:

- `README.md`
- `package.json`
- `package-lock.json`
- `.env.example`
- `.gitignore`
- `docker-compose.yml`
- `wrangler*.jsonc`
- runtime source folders

Do not add loose PDFs, DOCX files, survey spreadsheets, screenshots, logs, generated builds, or local testing artifacts to the root. The exception is the root `validation-report（User testing and product improvement）/` folder, which intentionally keeps review evidence easy to open.

## Local Artifacts To Keep Out Of Git

The repository ignores common local outputs:

- `logs/`
- `output/`
- `.codex-artifacts/`
- `frontend/public/assets/perf/`
- `m5stack/`
- `.local-pg/`
- `release/`
- dependency and build folders such as `node_modules/` and `dist/`

If a generated file is needed for a submission, put the final artifact under the right `docs/` folder with a clear name instead of committing a temporary output directory.

## Naming Rules

- Prefer lowercase hyphenated filenames for new docs, for example `cloudflare-domain-notes.md`.
- Keep evidence file names descriptive, for example `user-6-validation.docx`.
- Keep release notes in `plans/` using `pawtrace-<version>.md`.
- Avoid duplicate names that differ only by spaces, capitalization, or file extension.
