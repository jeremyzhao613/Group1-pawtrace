---
name: pawtrace-10-1-0-release-notes
version: 10.1.0
type: release-notes
status: draft
languages: zh-CN,en-US
generated_at: 2026-05-05
source_branch: main
comparison_base: origin/main
comparison_method: git fetch origin main --prune; local working tree and untracked files compared against current GitHub origin/main
---

> Archived duplicate. The canonical 10.1.0 release note is
> `plans/pawtrace-10.1.0.md`.

# PawTrace 10.1.0 更新日志 / PawTrace 10.1.0 Release Notes

## 中文

### 比较范围

本日志按当前本地工作区相对 GitHub 远端 `origin/main` 的差异整理。范围包括已跟踪文件的修改，以及本地新增但尚未提交到 GitHub 的文件。

- 远端基准：`origin/main`，已在 2026-05-05 执行 `git fetch origin main --prune` 刷新。
- 当前分支：`main`，本地分支与 `origin/main` 无 ahead/behind，仅工作区存在差异。
- 差异规模：26 个已跟踪文件修改，29 个本地新增文件；新增范围包括 Cloudflare、脚本、文档、静态资源、Pages 配置和版本日志。
- 注意：根目录 `package.json` 已同步为 `"version": "10.1.0"`。

### 版本定位

- **版本**：10.1.0
- **版本类型**：minor feature / release-candidate update
- **一句话说明**：10.1.0 将 PawTrace 从本地演示版推进到可联网展示、可 Cloudflare 上线、可移动/桌面打包、可接入 M5Stack 实时遥测的发布候选版本。

### 主要更新

#### 1. M5Stack 实时遥测链路

- 新增 `/api/device/telemetry/stream` 服务端事件流，用于把 Wi-Fi 遥测实时推送到已登录前端。
- 主应用和 `pawtrace-glass` 已接入 `EventSource`，收到新包后直接刷新健康卡片、历史列表、地图点位和数字孪生面板。
- `/api/device/telemetry` 支持单包和 `{"samples":[...]}` 批量上报，便于设备在网络抖动后批量补传。
- 设备上报支持 `x-device-response: compact` 或 `response=compact`，可返回更轻量的确认结果，减少嵌入式设备解析压力。
- 后端明确拒绝 BLE 和 USB/serial-bridge 遥测入库，BLE 仅保留为 Wi-Fi 配置通道，正式遥测必须走 Wi-Fi HTTP。
- 扩展遥测字段：`packet_seq`、`board_temp_c`、`temperature_valid`、`temperature_source`、`movement_score`、`filtered_accel_magnitude_g`、`activity_confidence`、`signal_quality`、`sample_interval_ms` 等。
- 位置入库更严格：无效 GPS、`0,0` 坐标、`gps_fix=0` 或显式无效位置不会写入 `LocationPoint` 和 `LastLocation`。
- SSE 路由关闭压缩，避免事件流被缓冲；CSP 增加 OpenStreetMap frame 支持。
- 后端 CORS 自动放行本机、Electron/Capacitor 常见 origin，降低桌面和移动调试成本。

#### 2. M5Stack 固件和演示工具

- Wi-Fi 固件更新为 `10.4.3-stable-wifi-interface` 行为，默认 1 秒上传一次，更适合手机热点和 HTTPS 链路。
- 默认上传目标改为 Cloudflare Worker API：`https://pawtrace-api.jeremyzhao613.workers.dev/api/device/telemetry`。
- 固件加入 HTTPS 上传、FreeRTOS 队列、最多 24 条本地缓存、最多 4 条批量发送、失败重试和队列回灌。
- 增加 GPS v1.1、MAX30102 Heart Rate HAT、IMU 平滑、信号质量和活动置信度逻辑。
- `temp_c` 不再伪装为真实体温；板载温度记录到 `board_temp_c`，真实体温字段保持空值直到有独立传感器。
- 设备 UI 改为多页稳定刷新界面，包含启动动画、上传状态、GPS、心率、队列、Wi-Fi 和配置状态。
- 增加云端命令轮询，Web 端可排队发送消息或触发上传。
- BLE provisioning 固件默认热点配置更新为 Jeremy iPhone 演示环境，并更新默认上传地址。
- 新增一键演示脚本：
  - `npm run connect:m5`：准备数据库、后端、主前端、glass 前端，配置 M5 串口，执行端到端遥测测试并打开页面。
  - `npm run test:m5`：验证登录、遥测写入、批量写入、latest/history、前端代理、glass 代理和实时流。
  - `npm run live:m5`：按固定间隔持续发送变化的演示遥测数据。

#### 3. Cloudflare 上线能力

- 新增 Cloudflare Worker API：`cloudflare/pawtrace-api/worker.js`。
- 新增 D1 表结构：用户、宠物、健康测量、位置点、聊天消息、监控事件和设备命令。
- Worker 覆盖核心接口：认证、宠物、位置、遥测 ingest/latest/history/stream、设备命令、AI 状态、AI 文本/图片、视频占位分析、聊天、监控采集和地图瓦片代理。
- 新增 Wrangler 配置：
  - `wrangler.pawtrace-api.jsonc`
  - `wrangler.pawtrace-glass.jsonc`
  - `cloudflare/pawtrace-api/wrangler.toml`
- 新增部署命令：
  - `npm run cloudflare:d1:init`
  - `npm run cloudflare:api:dry-run`
  - `npm run deploy:cloudflare:api`
  - `npm run deploy:cloudflare:glass`
  - `npm run deploy:cloudflare:pages`
  - `npm run deploy:cloudflare:full`
  - `npm run deploy:cloudflare:all`
- Cloudflare Pages 生产构建现在要求明确可用的 API base，避免 Pages-only 部署生成不可用的相对 `/api`。
- Cloudflare 主站构建新增 `build:monitor`，会把 `monitor/index.html` 和静态资源复制到 `frontend/dist/monitor`，确保 `/monitor/index.html` 随 Pages 一起发布。
- `pawtrace-glass` 构建支持 `PAWTRACE_API_BASE_URL`，默认指向当前 Worker API。
- 新增 Pages `_redirects` / `_headers`，支持 SPA fallback、基础安全头和 Web NFC 所需的 `Permissions-Policy: nfc=(self)`。
- 新增 `scripts/fix-cloudflare-pages-access.mjs` 和 `npm run cloudflare:fix-access`，用于诊断和修复 macOS/VPN fake-ip DNS 导致 `pages.dev` TLS 无法打开的问题。
- README 新增 Cloudflare 主站 + glass 一起部署说明，并指向完整 Cloudflare 架构文档。

#### 4. 跨平台打包和运行时 API 配置

- `scripts/write-runtime-config.mjs` 扩展为真正的运行时配置写入器：
  - 自动读取 `.env.local`、`.env`、`backend/.env.local`、`backend/.env`。
  - 支持 `--target desktop|mobile|android|ios`。
  - 支持 `--require-api-base`，生产 Cloudflare 构建缺少 API 地址时直接失败。
  - 桌面默认连接 `http://localhost:3000`。
  - Android/iOS 默认使用当前电脑 LAN IP 的 `http://<lan-ip>:3000`，方便同 Wi-Fi 或手机热点调试。
  - Cloudflare 默认使用 Worker API。
- 运行时配置同时写入 `PAWTRACE_PUBLIC_APP_URL`，用于 NFC 公开宠物卡等需要跨设备访问的链接。
- 新增 `scripts/run-with-env.mjs`，统一从环境文件加载变量，并支持必填变量和默认变量。
- Android 打包流程增加运行时 API 写入、网络权限和 cleartext/LAN HTTP 配置。
- 新增 `scripts/ensure-android-network.mjs` 自动写入 Android `INTERNET`、`ACCESS_NETWORK_STATE`、`network_security_config` 和 `usesCleartextTraffic`。
- 新增 `scripts/package-android-debug.mjs` 和 `npm run package:apk:debug`，自动定位 JDK 21 与 Android SDK 后构建 debug APK。
- iOS Capacitor 配置更新：
  - app id 改为 `com.jeremy.pawtrace.ysvhwxy9n6`。
  - Xcode project 设置 `DEVELOPMENT_TEAM=YSVHWXY9N6`。
  - `Info.plist` 打开本地/LAN HTTP 调试所需的 ATS 例外。
- 桌面打包文档更新为已有 Electron 壳的实际状态，说明 `package:desktop:dir`、`package:exe`、`package:dmg` 和远程 API 配置方式。

#### 5. 前端主应用体验

- API 连接状态现在会检查 `/api/status`，顶部连接状态可点击修改 API base URL，并持久化到 `localStorage`。
- 支持通过 `?apiBase=` 或 `?api=` 临时覆盖 API 地址。
- 新增本地 SVG 图标 fallback，降低 Font Awesome CDN 加载失败时核心导航、地图、健康和聊天图标缺失的风险。
- 本地 M5 演示路由支持自动登录 demo 账号并打开健康页，例如 `?openApp=profile&m5Demo=1#health`。
- 健康页改为实时优先：SSE 实时流 + 1 秒 latest fallback + 30 秒 history backfill。
- M5 Wi-Fi 面板支持 LAN 直连和云端命令两种模式，可检查云端最新包、发送消息、触发上传、查看队列与 payload。
- 健康指标更准确区分 GPS、心率、SpO2、板载温度、活动分数、Wi-Fi、上传状态和数据时间。
- 地图和宠物卡会合并最新遥测，带 GPS 有效性、最后有效位置、电子围栏和设备状态。
- 新增主界面迷你游戏弹窗，支持键盘、按钮、指针拖动、暂停、重新开始和本地最高分。
- 深色/浅色模式切换从简单按钮改成完整 switch 控件，并在个人页移动端补充切换入口。
- 移动端输入和弹窗状态会压低/隐藏底部 chrome，减少键盘遮挡。
- 图片 fallback 更完整：用户头像、聊天图片、贴纸、地图、宠物照片和 NFC 卡片都有默认回退图。
- 新增 8 张 `frontend/public/assets/people/person*.png` 人物头像资源，并替换旧的外链/占位头像。
- 聊天体验补强：联系人 hover 卡支持关闭/焦点行为，头像 fallback 更准确，图片/贴纸消息带 alt 和 fallback。
- 宠物列表和社区宠物 Feed 更新为更紧凑的响应式网格布局，移动端避免长文本撑破卡片。
- AI 诊断和 AI 服务输出改为统一的可视加载状态，替换简单 skeleton。
- `frontend/public/app/README.md` 记录 `/app/*` 文件职责和 CSS 编辑顺序。

#### 6. 地图和 glass 展示页

- 地图瓦片请求支持通过 API base 代理，便于 Cloudflare Worker 转发 OpenStreetMap 瓦片。
- 地图地点标记改为内联 SVG 图标，减少对 Font Awesome 的依赖。
- 地图 marker label 会根据屏幕位置自动上下摆放，降低遮挡。
- 电子围栏投影修正为按实际 overlay 宽高比计算，圆形范围在不同视口下更准确。
- `pawtrace-glass` 支持 `PAWTRACE_API_BASE_URL`，并接入遥测 SSE。
- `pawtrace-glass` 地图从 iframe 方式改为可控 OSM tile layer，补充瓦片加载状态和地图 attribution 样式。
- glass 面板在实时包到达时即时更新 latest、history 和地图点，同时把轮询间隔降为 15 秒兜底。
- glass 新增 Cloudflare Pages `_headers` 和 `_redirects`。

#### 7. 文档更新

- `README.txt` 新增 Cloudflare 主站 + glass 联合部署说明、Cloudflare 架构文档入口和 macOS `pages.dev` DNS 修复说明。
- `docs/cloudflare-deployment.md` 新增完整 Cloudflare Pages + Worker + D1 上线设计。
- `docs/pawtrace-m5stack-telemetry.md` 大幅更新 M5Stack 实时链路、一键热点连接、物理设备状态、固件行为、传感器准确性策略和演示命令。
- `docs/pawtrace-release-packaging.md` 更新 Android/iOS/桌面打包说明，补充运行时 API、debug APK、本地网络权限、Electron 和 CORS。
- `docs/pawtrace-desktop-exe.md` 从“尚无桌面壳”更新为已有 Electron 壳和实际 EXE 打包路径。

### 文件清单

#### 已修改文件

- `.env.example`
- `README.txt`
- `backend/.env.example`
- `backend/src/index.ts`
- `backend/src/registerRoutes.ts`
- `docs/pawtrace-desktop-exe.md`
- `docs/pawtrace-m5stack-telemetry.md`
- `docs/pawtrace-release-packaging.md`
- `frontend/capacitor.config.ts`
- `frontend/index.html`
- `frontend/ios/App/App.xcodeproj/project.pbxproj`
- `frontend/ios/App/App/Info.plist`
- `frontend/public/_headers`
- `frontend/public/app/app.css`
- `frontend/public/app/app.js`
- `frontend/public/app/runtime-config.js`
- `frontend/public/app/style.tailwind.css`
- `frontend/public/map.js`
- `hardware/m5stack/pawtrace_ble_telemetry.ino`
- `hardware/m5stack/pawtrace_wifi_telemetry.ino`
- `package.json`
- `pawtrace-glass/src/App.tsx`
- `pawtrace-glass/src/index.css`
- `pawtrace-glass/src/vite-env.d.ts`
- `pawtrace-glass/vite.config.ts`
- `scripts/write-runtime-config.mjs`

#### 新增文件

- `10.1.0.md`
- `10.1.0md`（当前为重复占位稿，发布前建议删除或同步）
- `cloudflare/pawtrace-api/schema.sql`
- `cloudflare/pawtrace-api/worker.js`
- `cloudflare/pawtrace-api/wrangler.toml`
- `docs/cloudflare-deployment.md`
- `frontend/ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- `frontend/public/_redirects`
- `frontend/public/app/README.md`
- `frontend/public/assets/people/person1.png`
- `frontend/public/assets/people/person2.png`
- `frontend/public/assets/people/person3.png`
- `frontend/public/assets/people/person4.png`
- `frontend/public/assets/people/person5.png`
- `frontend/public/assets/people/person6.png`
- `frontend/public/assets/people/person7.png`
- `frontend/public/assets/people/person8.png`
- `pawtrace-glass/public/_headers`
- `pawtrace-glass/public/_redirects`
- `scripts/connect-m5stack-one-click.mjs`
- `scripts/copy-monitor-page.mjs`
- `scripts/ensure-android-network.mjs`
- `scripts/fix-cloudflare-pages-access.mjs`
- `scripts/package-android-debug.mjs`
- `scripts/run-with-env.mjs`
- `scripts/stream-m5stack-telemetry.mjs`
- `scripts/test-m5stack-telemetry.mjs`
- `wrangler.pawtrace-api.jsonc`
- `wrangler.pawtrace-glass.jsonc`

### 发布前确认

- `package.json` 已同步为 `10.1.0`；发布前只需确认是否同步子包版本。
- `10.1.0md` 是无扩展名的重复版本；当前已同步内容，提交前建议保留一个规范文件名或明确两个都要保留。
- Cloudflare Worker 需要配置 `JWT_SECRET`、`DASHSCOPE_API_KEY`、`DEVICE_INGEST_TOKEN` 等 secrets。
- Cloudflare D1 需要执行 `npm run cloudflare:d1:init` 初始化表结构。
- Android/iOS 当前允许本地/LAN HTTP，正式商店发布建议使用 HTTPS 后端并收紧网络策略。
- Windows EXE 当前未配置代码签名证书。
- Worker API 是 Cloudflare 原生替代实现，不等于完整 Node/Express + Prisma/PostgreSQL + 磁盘上传 + YOLO 服务的 100% 迁移。
- 物理 M5Stack 的 GPS 需要室外视野才会产生有效坐标；Heart Rate HAT 需要硬件被正确检测并有接触读数。

### 建议验证

- `npm run test:m5`
- `npm run connect:m5 -- --no-open`
- `npm run live:m5 -- --count=5`
- `npm run build:cloudflare:deploy`
- `npm run cloudflare:api:dry-run`
- `npm run package:apk:debug`
- `npm run package:desktop:dir`

## English

### Comparison Scope

These notes summarize the local working tree compared with the current GitHub `origin/main` branch. The comparison includes tracked modifications and new untracked files.

- Base: refreshed `origin/main` after `git fetch origin main --prune` on 2026-05-05.
- Branch: `main`, with no ahead/behind commits against `origin/main`.
- Scope: 26 tracked files modified plus 29 new local files across Cloudflare, scripts, docs, static assets, Pages config, and release notes.
- Caveat: root `package.json` is now synchronized to `"version": "10.1.0"`.

### Release Positioning

- **Version**: 10.1.0
- **Release Type**: minor feature / release-candidate update
- **Summary**: 10.1.0 moves PawTrace toward a deployable, cloud-connected, cross-platform demo release with Cloudflare hosting, runtime API configuration, packaged app support, and realtime M5Stack telemetry.

### Key Changes

#### 1. Realtime M5Stack Telemetry

- Added `/api/device/telemetry/stream` for server-sent realtime Wi-Fi telemetry.
- Main app and `pawtrace-glass` now consume telemetry through `EventSource`, with polling fallback.
- Telemetry ingest accepts both single payloads and batched `{"samples":[...]}` payloads.
- Added compact device responses through `x-device-response: compact` / `response=compact`.
- BLE and USB serial telemetry are rejected for storage; BLE remains provisioning-only.
- Added richer telemetry metadata for packet sequence, board temperature, movement, signal quality, sample interval, and sensor validity.
- Invalid GPS coordinates are filtered before writing location history and last-location state.
- SSE compression is disabled to avoid buffering; packaged app origins are automatically allowed by CORS.

#### 2. M5Stack Firmware and Demo Tools

- Wi-Fi firmware now follows `10.4.3-stable-wifi-interface` behavior with 1 second upload cadence.
- Default upload target points to the Cloudflare Worker API.
- Firmware adds HTTPS upload, local queueing, batched resend, retry handling, GPS, heart sensor, motion smoothing, and cloud command polling.
- Added one-command demo/test tooling: `connect:m5`, `test:m5`, and `live:m5`.

#### 3. Cloudflare Deployment

- Added a Cloudflare Worker API and D1 schema for auth, pets, telemetry, locations, chat, monitoring, device commands, AI endpoints, and map tile proxying.
- Added Wrangler configs for the API worker and glass Pages app.
- Added deployment commands for D1 init, API deploy, main Pages deploy, glass Pages deploy, and full deploy.
- Cloudflare production builds now require a usable API base URL.
- Main Pages builds now include `build:monitor`, copying `monitor/index.html` and assets into `frontend/dist/monitor` so `/monitor/index.html` ships with Pages.
- Pages headers now include Web NFC permission support through `Permissions-Policy: nfc=(self)`.
- Added macOS `pages.dev` fake-ip DNS diagnosis and hosts-file repair tooling.

#### 4. Packaging and Runtime Configuration

- `write-runtime-config.mjs` now loads env files, resolves target-specific API defaults, and supports required API-base validation.
- Runtime config now also writes `PAWTRACE_PUBLIC_APP_URL` for cross-device public links such as NFC pet cards.
- Android packaging writes runtime config and enables LAN HTTP debug networking.
- Added debug APK packaging helper.
- iOS Capacitor app id, signing team, and local-network ATS settings were updated.
- Desktop packaging docs now reflect the existing Electron shell and real `package:desktop:dir`, `package:exe`, and `package:dmg` commands.

#### 5. Frontend App Experience

- API connection status checks `/api/status`; users can override API base URL from query params or the header status control.
- Added a local SVG icon fallback so core app icons still render if the Font Awesome CDN is unavailable.
- Local M5 demo routes can auto-login the demo account and open the health tab.
- Health page updates from realtime telemetry, latest polling, and history backfill.
- M5 Wi-Fi controls support cloud commands, LAN status, upload triggers, queue details, and payload previews.
- Added responsive theme switch controls, mobile keyboard chrome suppression, image fallback handling, new local people avatars, improved chat media handling, tighter pet/community layouts, and a new mini-game modal.

#### 6. Map and Glass Dashboard

- Map tiles can route through the API base / Worker proxy.
- Location markers use inline SVG icons, better label placement, and corrected geofence projection.
- `pawtrace-glass` accepts `PAWTRACE_API_BASE_URL` and updates realtime latest/history/map state through SSE.
- `pawtrace-glass` now uses a controlled OSM tile layer instead of an iframe map, with tile load state and attribution styling.

#### 7. Documentation

- README, Cloudflare deployment docs, M5Stack telemetry docs, release packaging docs, desktop EXE docs, and app-folder README were updated to match the new deployment, hardware, runtime config, and packaging flows.

### Files Changed

Tracked modified files:

- `.env.example`, `README.txt`, `backend/.env.example`
- `backend/src/index.ts`, `backend/src/registerRoutes.ts`
- `docs/pawtrace-desktop-exe.md`, `docs/pawtrace-m5stack-telemetry.md`, `docs/pawtrace-release-packaging.md`
- `frontend/capacitor.config.ts`, `frontend/index.html`, `frontend/ios/App/App.xcodeproj/project.pbxproj`, `frontend/ios/App/App/Info.plist`
- `frontend/public/_headers`, `frontend/public/app/app.css`, `frontend/public/app/app.js`, `frontend/public/app/runtime-config.js`, `frontend/public/app/style.tailwind.css`, `frontend/public/map.js`
- `hardware/m5stack/pawtrace_ble_telemetry.ino`, `hardware/m5stack/pawtrace_wifi_telemetry.ino`
- `package.json`
- `pawtrace-glass/src/App.tsx`, `pawtrace-glass/src/index.css`, `pawtrace-glass/src/vite-env.d.ts`, `pawtrace-glass/vite.config.ts`
- `scripts/write-runtime-config.mjs`

New files:

- `10.1.0.md`, `10.1.0md`
- `cloudflare/pawtrace-api/schema.sql`, `cloudflare/pawtrace-api/worker.js`, `cloudflare/pawtrace-api/wrangler.toml`
- `docs/cloudflare-deployment.md`
- `frontend/ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`
- `frontend/public/_redirects`, `frontend/public/app/README.md`, `frontend/public/assets/people/person1.png` through `person8.png`
- `pawtrace-glass/public/_headers`, `pawtrace-glass/public/_redirects`
- `scripts/connect-m5stack-one-click.mjs`, `scripts/copy-monitor-page.mjs`, `scripts/ensure-android-network.mjs`, `scripts/fix-cloudflare-pages-access.mjs`, `scripts/package-android-debug.mjs`, `scripts/run-with-env.mjs`, `scripts/stream-m5stack-telemetry.mjs`, `scripts/test-m5stack-telemetry.mjs`
- `wrangler.pawtrace-api.jsonc`, `wrangler.pawtrace-glass.jsonc`

### Release Caveats

- Root `package.json` is synchronized to `10.1.0`; confirm whether subpackage versions should also be bumped.
- `10.1.0md` is a duplicate no-extension copy; it is synced now, but the release commit should intentionally keep one canonical filename or keep both.
- Configure Cloudflare secrets and initialize D1 before production deploy.
- Tighten mobile cleartext networking for production store builds.
- Configure Windows code signing before distributing EXE builds.
- Treat the Worker API as a Cloudflare-native subset/replacement path, not a complete migration of every Node backend capability.

### Suggested Verification

- `npm run test:m5`
- `npm run connect:m5 -- --no-open`
- `npm run live:m5 -- --count=5`
- `npm run build:cloudflare:deploy`
- `npm run cloudflare:api:dry-run`
- `npm run package:apk:debug`
- `npm run package:desktop:dir`
