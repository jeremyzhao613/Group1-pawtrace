---
name: pawtrace-7-0-0-entry-architecture-hardening-release
overview: 7.0.0 是一次入口架构、端口职责和仓库卫生的大版本收口：彻底移除会误弹出的错误 React 前端，固定主站唯一入口，隔离后端 API 端口与网页端口，并清理旧 demo、旧后端、误导性 legacy 路径和不必要依赖。 / 7.0.0 is a major entry-architecture and repository-hardening release: it removes the incorrect React frontend that could appear by mistake, locks the main site to a single canonical entry, separates backend API ports from web ports, and cleans up old demos, legacy backend files, misleading legacy paths, and unnecessary dependencies.
todos:
  - id: remove-wrong-frontend
    content: 移除错误 React 前端源码、依赖和 Vite React 插件，避免“进入宠物面板”界面再次出现。 / Remove the incorrect React frontend source, dependencies, and Vite React plugin so the unwanted "pet panel" page cannot reappear.
    status: completed
  - id: canonical-main-entry
    content: 将主站资源从 `public/legacy` 收口到 `public/app`，明确 `5173` 是唯一主站入口。 / Move the main-site assets from `public/legacy` into `public/app` and make `5173` the only canonical main-site entry.
    status: completed
  - id: backend-api-only-default
    content: 让 `3000` 默认只作为后端 API 与 Monitor 端口，前端托管必须显式开启。 / Make `3000` API-and-Monitor-only by default, with frontend serving enabled only explicitly.
    status: completed
  - id: startup-deploy-scripts
    content: 补齐安装、构建、展示页启动和本地数据库启动脚本，降低快速部署失败概率。 / Tighten install, build, showcase startup, and local database scripts to reduce fast-deploy failures.
    status: completed
  - id: repository-cleanup
    content: 删除旧后端 JS、旧前端备份、旧 Gemini demo、`.DS_Store` 和不必要依赖。 / Delete old backend JS files, frontend backups, old Gemini demo files, `.DS_Store`, and unnecessary dependencies.
    status: completed
  - id: verification
    content: 完成构建、类型检查、端口响应和错误入口阻断验证。 / Verify builds, type checks, port responses, and blocking of the wrong frontend entry.
    status: completed
  - id: ui-hotfix-login-and-ai-copy
    content: 修复主站登录首屏移动端裁切、首屏顺序、暗色默认和 Qwen/Gemini 文案/接口命名不一致问题。 / Fix main-site login first-screen mobile clipping, first-screen order, dark-mode default, and Qwen/Gemini copy/API naming mismatch.
    status: completed
isProject: false
---

# PawTrace 7.0.0 大版本入口架构升级日志 / PawTrace 7.0.0 Major Entry Architecture Release Log

## 版本定位 / Release Positioning

- **7.0.0 核心目标 / 7.0.0 Core Goal**：从“多个入口共存、容易开错页面”收口为“主站、后端、Monitor、展示页职责清晰”的稳定结构 / Move from multiple confusing entry points to a stable structure where the main site, backend, Monitor, and showcase each have a clear role.
- **本次是大更新 / This Is a Major Release**：不是只改一个页面，而是清理了会错误启动、会误导部署、会再次冒出错误界面的入口链路 / This is not a single page change; it removes the startup and deployment paths that could surface the wrong interface again.
- **版本关键词 / Release Keywords**：入口收口、端口隔离、API-only 后端、主站唯一入口、错误前端移除、legacy 路径重命名、依赖瘦身、快速部署稳定化 / entry consolidation, port isolation, API-only backend, single main-site entry, wrong frontend removal, legacy path rename, dependency slimming, and faster deploy stability.

## 正确入口 / Correct Entrypoints

- **主站 / Main Site**：`http://localhost:5173/`
- **后端 API 状态 / Backend API Status**：`http://localhost:3000/api/status`
- **后端根路径 / Backend Root**：`http://localhost:3000/`
- **Monitor**：`http://localhost:3000/monitor/index.html`
- **展示页 / Showcase Page**：`http://localhost:3001/`

## 7.0.0 完整更新内容 / Full Update Scope in 7.0.0

### 1) 错误 React 前端被彻底移除 / The Incorrect React Frontend Was Removed

- 删除 `frontend/src` 下的 React 路由版页面，避免 `src/main.tsx` 再次被误挂载 / Removed the React routed frontend under `frontend/src` so `src/main.tsx` can no longer be accidentally mounted.
- 移除 `react`、`react-dom`、`react-router-dom`、`@tanstack/react-query` 和 `@vitejs/plugin-react`，安装层也不再带回这套错误入口 / Removed `react`, `react-dom`, `react-router-dom`, `@tanstack/react-query`, and `@vitejs/plugin-react`, so installs no longer bring back that wrong entry path.
- `frontend/tsconfig.json` 改为只检查当前真实存在的 Vite/Capacitor 配置，避免无源码目录时误报项目损坏 / `frontend/tsconfig.json` now checks only the real Vite/Capacitor config files, avoiding false project-failure signals after removing the old source tree.

### 2) 主站入口固定为唯一页面 / The Main Site Now Has One Canonical Entry

- 主站继续使用 [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1) 作为唯一入口 / The main site continues to use [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1) as its only entry.
- 当前主站逻辑从 `frontend/public/legacy` 迁移到 [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1) / The current main-site logic moved from `frontend/public/legacy` to [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1).
- 当前主站样式从 `frontend/public/legacy` 迁移到 [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1) / The current main-site style layer moved from `frontend/public/legacy` to [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1).
- `frontend/index.html` 现在加载 `/app/app.js` 和 `/app/style.tailwind.css`，不再出现 `/legacy` 路径 / `frontend/index.html` now loads `/app/app.js` and `/app/style.tailwind.css`, with no `/legacy` path left.

### 3) 后端端口默认不再托管前端 / The Backend Port No Longer Serves Frontend by Default

- `http://localhost:3000/` 默认返回后端状态 JSON，而不是返回任何网页 / `http://localhost:3000/` now returns backend status JSON by default instead of any frontend page.
- `3000` 默认职责变为 API + Monitor，避免用户把后端端口当作网页端口 / `3000` is now API + Monitor by default, preventing users from treating the backend port as a web UI port.
- 新增 `SERVE_WEB` 开关：只有设置 `SERVE_WEB=1` 或 `SERVE_WEB=true` 时，后端才托管构建产物 / Added the `SERVE_WEB` switch: the backend serves build output only when `SERVE_WEB=1` or `SERVE_WEB=true`.
- `WEB_APP=frontend | glass` 仍保留给单端口部署使用，但不再影响本地默认开发入口 / `WEB_APP=frontend | glass` remains available for single-port deployment, but no longer changes the default local development entry.

### 4) 启动和部署脚本完成收口 / Startup and Deployment Scripts Were Tightened

- 根目录新增 `install:all`，一次安装 backend、frontend 和 pawtrace-glass 的依赖 / Added root-level `install:all` to install backend, frontend, and pawtrace-glass dependencies in one pass.
- 根目录新增 `dev:glass`、`build:web`、`build:glass`，让主站和展示页启动/构建职责更清楚 / Added `dev:glass`, `build:web`, and `build:glass` so main-site and showcase startup/build responsibilities are explicit.
- `npm run build` 现在构建主站、展示页和后端，避免部署时漏掉展示端 / `npm run build` now builds the main site, showcase, and backend, reducing the risk of missing a deploy surface.
- 本地数据库脚本改为自动查找 PostgreSQL bin 路径，并支持 `PG_BIN` 覆盖 / The local database script now discovers the PostgreSQL binary path automatically and supports `PG_BIN` override.
- 新增 `ensure-backend-env.mjs` 和 `with-local-db-url.mjs`，让首次初始化和本地数据库环境变量更稳 / Added `ensure-backend-env.mjs` and `with-local-db-url.mjs` for more reliable first-time setup and local database environment handling.

### 5) 仓库卫生和旧代码删除 / Repository Hygiene and Old Code Removal

- 删除 `frontend-legacy` 整个旧备份目录，减少“到底开哪个前端”的歧义 / Removed the entire `frontend-legacy` backup directory to reduce ambiguity over which frontend should be opened.
- 删除旧后端 JS 实现、旧 SQL.js 数据层和旧设备认证中间件，统一到 `backend/src` TypeScript 实现 / Removed old backend JS files, SQL.js data layer, and device-auth middleware, consolidating backend behavior under `backend/src` TypeScript.
- 删除 `pawtrace-glass` 根目录下旧 Gemini demo 组件和服务，保留当前 `src` 数字孪生展示页 / Removed old Gemini demo components and services from the pawtrace-glass root, keeping the current `src` digital-twin showcase.
- 移除 `@google/genai` 前端依赖，避免浏览器端误持有或误引入 AI SDK / Removed the frontend `@google/genai` dependency to avoid accidental browser-side AI SDK usage.
- 清理 `.DS_Store`，减少系统垃圾文件进入仓库和部署包的概率 / Cleaned `.DS_Store` files to reduce OS junk entering the repo and deployment artifacts.

### 6) 文档同步为当前真实架构 / Documentation Now Matches the Real Architecture

- README 明确说明后端默认只作为 API/Monitor，不在 `3000` 托管前端页面 / README now states that the backend is API/Monitor-only by default and does not serve frontend pages on `3000`.
- 启动说明更新为“主站 5173、后端 3000、Monitor 3000/monitor、展示页 3001” / Startup docs now use the clear model: main site on `5173`, backend on `3000`, Monitor under `3000/monitor`, and showcase on `3001`.
- `pawtrace-window-page-startup-guide` 改写为当前入口说明，不再描述已移除的 React 主站入口 / `pawtrace-window-page-startup-guide` was rewritten around the current entrypoints and no longer describes the removed React main-site entry.
- 新增 Windows/macOS 启动说明，明确哪些脚本适合 macOS/WSL2，哪些步骤适合原生 Windows + Docker / Added a Windows/macOS startup guide that clarifies which scripts fit macOS/WSL2 and which steps fit native Windows + Docker.
- 旧版本文档中的主站资源引用从 `frontend/public/legacy` 更新为 `frontend/public/app` / Old release docs now reference `frontend/public/app` instead of `frontend/public/legacy` for main-site assets.

### 7) UI 快速修复 / UI Hotfixes

- 登录首屏移动端从“登录框先出现”改为“品牌与主说明先出现”，避免用户一打开页面就看到被截断的表单 / The login first screen now shows the brand and main message before the form on mobile, preventing users from landing on a clipped form.
- 移动端登录容器改为专用 `login-shell`，并在窄屏下限制实际宽度，修复右侧按钮、表单和说明文字被裁切的问题 / The mobile login container now uses a dedicated `login-shell` with strict narrow-screen width, fixing clipped buttons, fields, and copy.
- 首屏不再默认跟随系统暗色模式，避免首次打开出现低对比度深色界面；用户仍可手动切换暗色 / The first screen no longer defaults to system dark mode, avoiding low-contrast first loads while keeping the manual dark toggle.
- 删除首屏 `Logo` 占位和 `True Focus / PawTrace OS / Signature glass UI` 这类不匹配文案，统一为 PawTrace、Pet Map 和真实功能说明 / Removed mismatched first-screen copy such as `Logo`, `True Focus`, `PawTrace OS`, and `Signature glass UI`, replacing it with PawTrace, Pet Map, and real feature language.
- 前端视觉诊断请求改为 `/api/ai/qwen-diagnosis`，后端保留旧 `gemini-*` 路径作为兼容别名，避免 Qwen 文案和 Gemini 路径互相冲突 / Frontend visual diagnosis now calls `/api/ai/qwen-diagnosis`; the backend keeps old `gemini-*` paths as compatibility aliases so Qwen copy no longer conflicts with Gemini route names.

## 涉及文件范围 / File Scope

- 主站入口 / Main-site entry:
  [index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1),
  [app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1),
  [style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1),
  [vite.config.ts](/Users/jeremy/Desktop/Group1-pawtrace/frontend/vite.config.ts:1),
  [package.json](/Users/jeremy/Desktop/Group1-pawtrace/frontend/package.json:1),
  [tsconfig.json](/Users/jeremy/Desktop/Group1-pawtrace/frontend/tsconfig.json:1)
- 后端入口与配置 / Backend entry and config:
  [index.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/index.ts:1),
  [config.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/config.ts:1),
  [.env.example](/Users/jeremy/Desktop/Group1-pawtrace/backend/.env.example:1),
  [registerRoutes.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/registerRoutes.ts:1)
- 根脚本与本地数据库 / Root scripts and local database:
  [package.json](/Users/jeremy/Desktop/Group1-pawtrace/package.json:1),
  [local-db.sh](/Users/jeremy/Desktop/Group1-pawtrace/scripts/local-db.sh:1),
  [ensure-backend-env.mjs](/Users/jeremy/Desktop/Group1-pawtrace/scripts/ensure-backend-env.mjs:1),
  [with-local-db-url.mjs](/Users/jeremy/Desktop/Group1-pawtrace/scripts/with-local-db-url.mjs:1)
- 展示页清理 / Showcase cleanup:
  [pawtrace-glass/package.json](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/package.json:1),
  [pawtrace-glass/index.html](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/index.html:1),
  [mockTwinData.ts](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/data/mockTwinData.ts:1),
  [index.css](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/index.css:1)
- 文档 / Documentation:
  [README.txt](/Users/jeremy/Desktop/Group1-pawtrace/README.txt:1),
  [pawtrace-window-page-startup-guide.md](/Users/jeremy/Desktop/Group1-pawtrace/plans/plans/pawtrace-window-page-startup-guide.md:1),
  [pawtrace-windows-macos-startup-guide.md](/Users/jeremy/Desktop/Group1-pawtrace/plans/plans/pawtrace-windows-macos-startup-guide.md:1)

## 验证状态 / Verification Status

- 已完成 `npm run build`，主站、`pawtrace-glass` 和后端均构建通过 / Completed `npm run build`; the main site, `pawtrace-glass`, and backend all build successfully.
- 已完成 `frontend` TypeScript 配置检查 / Completed the frontend TypeScript config check.
- 已完成 `backend` TypeScript 检查 / Completed the backend TypeScript check.
- 已验证 `http://localhost:5173/` 只加载 `/app/app.js`，不再加载 `/legacy` 或 `/src/main.tsx` / Verified that `http://localhost:5173/` loads only `/app/app.js`, not `/legacy` or `/src/main.tsx`.
- 已验证 `http://localhost:3000/` 返回后端 API 状态 JSON / Verified that `http://localhost:3000/` returns backend API status JSON.
- 已验证 `http://localhost:3000/app/app.js` 默认返回 `404`，说明后端端口不会泄露主站资源 / Verified that `http://localhost:3000/app/app.js` returns `404` by default, proving the backend port does not leak main-site assets.
- 已通过 Chrome headless 截图复查移动端登录首屏，确认右侧裁切修复 / Rechecked the mobile login first screen with Chrome headless screenshots and confirmed the right-side clipping is fixed.

## 已知边界 / Known Boundaries

- `pawtrace-glass` 仍有 Vite 大包 warning，但不影响页面启动与本次入口架构收口 / `pawtrace-glass` still has a Vite large-bundle warning, but it does not block startup or this entry-architecture release.
- `npm install` 仍提示依赖审计风险；本次未自动 `audit fix`，避免引入不可控破坏性升级 / `npm install` still reports audit issues; this release does not run automatic `audit fix` to avoid uncontrolled breaking upgrades.
- `SERVE_WEB=1` 仍可用于单端口部署，但本地开发默认应继续使用 `5173` 主站和 `3000` API 分离 / `SERVE_WEB=1` remains available for single-port deployment, but local development should keep the `5173` main site and `3000` API separated by default.

## 交付总结 / Delivery Summary

- 7.0.0 把 PawTrace 从“多个历史入口共存”推进到“入口明确、端口隔离、错误界面无法再被挂出”的结构状态 / 7.0.0 moves PawTrace from a repo with multiple historical entries into a structure with clear entries, isolated ports, and no path for the wrong interface to reappear.
- 主站、后端、Monitor、展示页现在各有明确职责，启动和部署心智负担明显降低 / The main site, backend, Monitor, and showcase now each have a clear responsibility, reducing startup and deployment confusion.
- 这次更新重点不是视觉升级，而是让项目更适合长期维护、答辩演示和快速本地启动 / This update is less about visual polish and more about long-term maintainability, presentation reliability, and fast local startup.
