---
name: pawtrace-8-0-0-yolo-video-check-responsive-ui-release
overview: 8.0.0 是 PawTrace 的 YOLO Video Check 与全站响应式 UI 稳定版：新增独立的宠物视频行为风险分析链路，将 Video Check 明确区分于 AI Assist 的 API 能力，同时系统修复地图、Profile、Health、AI、登录页和移动端底部导航的对齐、溢出与控制台错误。 / 8.0.0 is the PawTrace YOLO Video Check and responsive UI hardening release: it adds a standalone pet video behavior-risk analysis pipeline, separates Video Check from AI Assist API features, and systematically fixes alignment, overflow, and console issues across Map, Profile, Health, AI, login, and mobile navigation.
todos:
  - id: yolo-video-check-module
    content: 新增 Video Check 功能模块，支持视频上传、YOLO 服务分析、行为时间线、风险等级、事件列表、建议和免责声明。 / Add the Video Check module with video upload, YOLO-service analysis, behavior timeline, risk level, event list, advice, and disclaimer.
    status: completed
  - id: backend-video-api
    content: 新增 Express 上传接口 `/api/ai/video-behavior`，使用 multer 接收视频并转发到 Python FastAPI YOLO 服务。 / Add the Express upload endpoint `/api/ai/video-behavior`, using multer to receive video files and forward them to the Python FastAPI YOLO service.
    status: completed
  - id: python-yolo-service
    content: 新增 `ai-video-service`，用 FastAPI、OpenCV 和 Ultralytics YOLO 进行抽帧检测与简单运动评分。 / Add `ai-video-service` using FastAPI, OpenCV, and Ultralytics YOLO for sampled-frame detection and simple movement scoring.
    status: completed
  - id: product-safety-copy
    content: 将视频结果定位为行为风险提示，避免直接诊断疾病，并加入 veterinary diagnosis 免责声明。 / Position video results as behavior-risk hints, avoid direct disease diagnosis, and include the veterinary diagnosis disclaimer.
    status: completed
  - id: responsive-ui-hardening
    content: 修复地图、Profile、Health、AI、Video Check、登录页和移动端底部导航的对齐、适配、空白和遮挡问题。 / Fix alignment, responsiveness, empty-space, and overlap issues across Map, Profile, Health, AI, Video Check, login, and mobile bottom navigation.
    status: completed
  - id: verification
    content: 完成前端构建、后端构建、JS 语法检查、diff 空白检查、控制台审计和 390/834/1440 响应式截图审计。 / Complete frontend build, backend build, JS syntax check, diff whitespace check, console audit, and 390/834/1440 responsive screenshot audits.
    status: completed
isProject: false
---

# PawTrace 8.0.0 YOLO Video Check 与响应式 UI 稳定日志 / PawTrace 8.0.0 YOLO Video Check and Responsive UI Release Log

## 版本定位 / Release Positioning

- **8.0.0 核心目标 / 8.0.0 Core Goal**：把 PawTrace 从“AI Assist 视觉/文本 API 工具”扩展到“独立 YOLO 视频行为检查能力”，并把主站 UI 调整到更适合答辩演示和移动端检查的稳定状态 / Extend PawTrace beyond AI Assist visual/text API tools into a standalone YOLO video behavior-check capability, while hardening the main-site UI for presentation and mobile review.
- **功能边界 / Product Boundary**：`AI Assist` 继续承担 AI API 接口能力；`Video Check` 单独承担 YOLO 模型视频分析，不混用定位 / `AI Assist` remains the AI API surface; `Video Check` is the separate YOLO-model video analysis feature.
- **安全表达 / Safety Positioning**：视频分析只提供行为风险提示，不输出疾病诊断、病因判断或确定性医疗结论 / Video analysis provides behavior-risk hints only and does not make disease diagnoses, cause judgments, or definitive medical claims.
- **版本关键词 / Release Keywords**：YOLO Video Check、FastAPI video service、Express upload proxy、behavior timeline、risk hint、responsive UI audit、mobile bottom More menu、Profile layout、Health trend cards、console bug fix / YOLO Video Check, FastAPI video service, Express upload proxy, behavior timeline, risk hint, responsive UI audit, mobile bottom More menu, Profile layout, Health trend cards, and console bug fix.

## 8.0.0 更新内容 / 8.0.0 Updates

### 1) 新增独立 Video Check 模块 / New Standalone Video Check Module

- 新增 `Video Behaviour Health Check` 页面，支持上传 `mp4 / mov / avi / webm` 视频 / Added the `Video Behaviour Health Check` page with support for `mp4 / mov / avi / webm` uploads.
- 页面展示检测宠物、视频时长、检测率、运动评分、异常事件数量、行为时间线、风险等级、观察建议和历史对比区域 / The page displays detected pet, duration, detection rate, movement score, abnormal event count, behavior timeline, risk level, observation advice, and history comparison areas.
- 保留 Demo 分析状态，方便没有本地 YOLO 服务或没有视频素材时演示 UI / Kept a demo analysis state so the UI remains presentable without a local YOLO service or sample video.
- `Video Check` 不再放在 `AI Assist` 的 API 卡片里，而是成为独立导航入口，避免产品定位混淆 / `Video Check` is no longer treated as an `AI Assist` API card; it is now a separate navigation entry to avoid product-positioning confusion.

### 2) 后端新增视频分析代理接口 / Backend Video Analysis Proxy

- 新增 `POST /api/ai/video-behavior`，前端通过 `FormData` 字段 `video` 上传文件 / Added `POST /api/ai/video-behavior`, where the frontend uploads the file through the `video` FormData field.
- 使用 `multer` 接收视频上传，并限制文件大小约 `150MB` / Uses `multer` for video uploads with an upload limit around `150MB`.
- 后端通过环境变量 `VIDEO_AI_URL` 转发到 Python YOLO 服务，默认值为 `http://127.0.0.1:8008/analyze-video` / The backend forwards the file to the Python YOLO service through `VIDEO_AI_URL`, defaulting to `http://127.0.0.1:8008/analyze-video`.
- 增加缺少文件、上传失败、服务失败和非 JSON 响应的错误处理，避免破坏现有后端路由 / Added handling for missing files, upload failures, service failures, and non-JSON responses without breaking existing backend routes.

### 3) 新增 Python FastAPI YOLO 服务 / New Python FastAPI YOLO Service

- 新增 `ai-video-service/` 目录，包含 `app.py`、`requirements.txt` 和 `README.md` / Added the `ai-video-service/` folder with `app.py`, `requirements.txt`, and `README.md`.
- 服务暴露 `POST /analyze-video`，接收 multipart 表单字段 `video` / The service exposes `POST /analyze-video` and accepts the multipart field `video`.
- 使用 OpenCV 抽帧读取视频，并使用 Ultralytics YOLO 默认模型检测猫/狗主体 / Uses OpenCV to sample video frames and an Ultralytics YOLO default model to detect cat/dog subjects.
- 通过宠物检测框中心点变化估算运动强度，返回 `durationSec`、`analyzedFrames`、`detectedFrames`、`detectionRate` 和 `movementScore` / Estimates movement intensity from pet bounding-box center changes and returns `durationSec`, `analyzedFrames`, `detectedFrames`, `detectionRate`, and `movementScore`.
- MVP 行为分类包括 `normal_movement`、`low_activity_or_resting`、`frequent_fast_movement` 和 `poor_video_quality` / MVP behavior categories include `normal_movement`, `low_activity_or_resting`, `frequent_fast_movement`, and `poor_video_quality`.

### 4) 行为风险提示与免责声明 / Behavior-Risk Hints and Disclaimer

- 视频分析输出统一使用行为风险语言，不直接判断耳螨、细菌感染、骨折、生病等医疗结论 / Video analysis uses behavior-risk language and does not directly claim ear mites, bacterial infection, fracture, illness, or other medical conclusions.
- 异常行为提示保持观察建议口径，例如甩头、抓耳、舔爪、跛行、低活动、弓背等只提示可能存在不适或建议持续观察 / Abnormal behavior hints keep an observation-advice tone, such as head shaking, ear scratching, paw licking, limping, low activity, or hunched posture only suggesting possible discomfort or continued observation.
- 前端和服务结果都保留免责声明：`This result is only a behavior-risk hint and does not constitute veterinary diagnosis.` / Both frontend and service results keep the disclaimer: `This result is only a behavior-risk hint and does not constitute veterinary diagnosis.`

### 5) 全站 UI 适配与对齐修复 / Full-Site UI Responsiveness and Alignment Fixes

- 地图区修复小屏适配问题，地图容器不再造成页面级横向溢出 / The map area was adjusted for small screens so the map container no longer causes page-level horizontal overflow.
- Profile 页面重构为更稳定的 owner card、pet manager、settings、behavior insight 和 care snapshot 布局 / The Profile page was reorganized into a more stable owner card, pet manager, settings, behavior insight, and care snapshot layout.
- 移动端底部导航从拥挤的多入口改为主入口 + `More` 面板，`Video Check / AI Assist / Profile` 收进 More 菜单 / The mobile bottom navigation was changed from many crowded entries into primary tabs plus a `More` panel, with `Video Check / AI Assist / Profile` inside More.
- Video Check 上传按钮和 Demo 按钮加强对比度，避免在浅色玻璃背景下发虚 / Video Check upload and demo buttons now have stronger contrast so they do not fade into the light glass background.
- 登录页右侧卡片改为内容自适应高度，减少大块空白 / The login right-side card now adapts to content height, reducing large empty areas.
- Health 页面趋势卡改成纵向堆叠，解决 Low / Avg / High 数值在窄卡片内挤压的问题 / Health trend cards now stack vertically, fixing Low / Avg / High value squeezing in narrow cards.
- AI Assist 的 `NEW` 标识收进卡片内部，避免小卡片轻微内部溢出 / The AI Assist `NEW` badge is now inside the card, preventing minor internal overflow.
- Chat hover 预览卡隐藏态增加 `visibility: hidden`，避免透明元素仍被布局审计识别 / The hidden chat hover preview now uses `visibility: hidden`, preventing transparent elements from being detected in layout audits.

### 6) 控制台错误修复 / Console Error Fix

- 修复关闭 modal 后异步恢复焦点时报错的问题 / Fixed an async focus-restore error after closing modals.
- 原问题是 `lastModalTrigger` 被清空后，`requestAnimationFrame` 内仍读取它并调用 `focus()` / The issue came from reading `lastModalTrigger` inside `requestAnimationFrame` after it had already been cleared.
- 新逻辑先保存 `triggerToRestore`，再在下一帧确认节点仍连接后恢复焦点 / The new logic stores `triggerToRestore` first, then restores focus only if the element is still connected on the next frame.

## 最近重要更新 / Recent Important Updates

这一部分记录 8.0.0 最后几轮集中修复的重点内容，适合在展示、答辩或版本汇报中优先说明。 / This section records the final important updates in 8.0.0 and is suitable for demos, presentations, or release summaries.

### A) Video Check 与 AI Assist 边界明确 / Video Check and AI Assist Separation

- `AI Assist` 保持为 AI API 功能区，负责 Qwen 视觉诊断、健康报告、行为洞察和饮食建议 / `AI Assist` remains the AI API area for Qwen visual diagnosis, health reports, behavior insight, and diet advice.
- `Video Check` 单独作为 YOLO 模型功能，不再被描述成 AI API 卡片 / `Video Check` is now a standalone YOLO-model feature and is no longer described as an AI API card.
- 移动端 `More` 面板中保留 `Video Check / AI Assist / Profile`，既节省底部导航空间，也保持功能入口清晰 / The mobile `More` panel keeps `Video Check / AI Assist / Profile`, saving bottom-nav space while keeping feature access clear.

### B) 移动端底部导航重构 / Mobile Bottom Navigation Rework

- 原来的移动端底栏入口过多，容易挤压和错位；现在收敛为 `Map / Pets / Chat / Health / More` / The previous mobile bottom bar had too many entries and could feel crowded; it is now reduced to `Map / Pets / Chat / Health / More`.
- `More` 面板使用独立浮层，包含不适合常驻底栏的功能入口 / The `More` menu uses a separate floating panel for features that should not permanently occupy the bottom bar.
- 当前移动端页面增加底部安全留白，减少内容被底部导航遮挡的问题 / Mobile pages now include bottom safe spacing to reduce content being covered by the bottom navigation.

### C) Profile 页面重新整理 / Profile Page Reorganization

- Profile 从信息堆叠改成更清晰的 owner card、pet manager、settings、behavior insight、care snapshot 结构 / Profile was changed from a stacked information block into owner card, pet manager, settings, behavior insight, and care snapshot sections.
- 宠物数量、好友数量和 main focus 会同步到侧边 summary，减少 Profile 页面信息空缺 / Pet count, friend count, and main focus are synchronized into the side summary, reducing empty information areas.
- 移动端 Profile 改为单列自然流，避免卡片横向挤压 / Mobile Profile now uses a single-column natural flow to avoid card compression.

### D) 地图与页面适配修复 / Map and Page Responsiveness Fixes

- 地图容器增加更严格的宽度、裁剪和 aspect-ratio 控制，避免小屏产生页面级横向滚动 / The map container now has stricter width, clipping, and aspect-ratio controls to prevent page-level horizontal scrolling on small screens.
- 地图、宠物位置列表、地点卡片和提醒卡片统一在当前玻璃卡片体系中对齐 / The map, pet location list, location card, and reminder card now align within the current glass-card system.
- 390px、834px、1440px 宽度审计确认主页面没有页面级横向溢出 / Audits at 390px, 834px, and 1440px confirmed no page-level horizontal overflow.

### E) Health、AI 和 Video Check 细节修复 / Health, AI, and Video Check Detail Fixes

- Health 趋势卡从两列改成纵向堆叠，解决 Low / Avg / High 数值在窄卡片中挤压的问题 / Health trend cards changed from two columns to vertical stacking, fixing Low / Avg / High value compression in narrow cards.
- AI Assist 的 `NEW` 标签移动到卡片内部，避免小屏和桌面窄卡片出现内部溢出 / The AI Assist `NEW` badge was moved inside the card to avoid internal overflow on narrow cards.
- Video Check 的 `Choose Video` 和 `Start YOLO Check` 按钮增强对比度，避免在浅色玻璃背景中不够明显 / The `Choose Video` and `Start YOLO Check` buttons now have stronger contrast against the light glass background.
- Video Check 的检测指标卡、时间线、风险提示和观察建议都加入移动端尺寸约束，减少文字和卡片错位 / Video Check metric cards, timeline, risk hints, and advice sections now have mobile constraints to reduce text and card misalignment.

### F) 登录页与控制台稳定性 / Login and Console Stability

- 登录页右侧卡片改为内容自适应高度，减少桌面端大块空白 / The login right-side card now adapts to content height, reducing large empty desktop space.
- Chat hover 预览卡隐藏时加入 `visibility: hidden`，避免透明元素仍被布局审计识别 / The hidden chat hover preview now uses `visibility: hidden` so transparent elements are not detected by layout audits.
- 修复 modal 关闭后的异步 focus 报错，最终控制台审计无 `uncaught` error / Fixed the async focus error after closing modals; the final console audit has no `uncaught` errors.

### G) 最终响应式审计结论 / Final Responsive Audit Result

- `390px` 手机宽度下，`Map / Pets / Chat / Health / Video Check / AI / Profile` 均未出现页面级横向滚动 / At `390px` mobile width, `Map / Pets / Chat / Health / Video Check / AI / Profile` show no page-level horizontal scrolling.
- `834px` 平板宽度下，页面主内容、顶部栏、Profile 双列和 Health 卡片都能保持可读布局 / At `834px` tablet width, main content, top bar, Profile columns, and Health cards remain readable.
- `1440px` 桌面宽度下，侧边栏、顶部栏、内容卡片和地图区域保持当前玻璃 UI 风格一致 / At `1440px` desktop width, sidebar, top bar, content cards, and map area remain consistent with the current glass UI style.
- 审计中仍可能出现少量内部测量提示，例如地图 marker 标签或 Online badge 的内部 `scrollWidth` 差异，但它们不会造成页面错位或横向滚动 / The audit may still report small internal measurement hints, such as map marker labels or Online badge `scrollWidth` differences, but they do not create page misalignment or horizontal scrolling.

### H) 演示优先流程 / Recommended Demo Flow

1. 打开主站并进入 `Map`，展示地图容器已经适配移动端和桌面端 / Open the main site and start with `Map` to show that the map container adapts to mobile and desktop.
2. 切到 `Video Check`，说明这是独立 YOLO 模型功能，不是 AI Assist API 卡片 / Switch to `Video Check` and explain that it is a standalone YOLO-model feature, not an AI Assist API card.
3. 展示视频上传、检测指标、时间线、风险等级和免责声明 / Show video upload, detection metrics, timeline, risk level, and the disclaimer.
4. 切到 `AI Assist`，对比说明这里是 Qwen API 文本/视觉辅助能力 / Switch to `AI Assist` and explain that this area is for Qwen API text/vision assistance.
5. 切到 `Profile`，展示 owner card、pet manager、settings、behavior insight 和 care snapshot / Switch to `Profile` and show owner card, pet manager, settings, behavior insight, and care snapshot.
6. 在移动端打开 `More` 面板，展示底部导航已经避免拥挤和重叠 / On mobile, open the `More` panel to show that bottom navigation avoids crowding and overlap.

### I) 8.0.0 答辩重点话术 / 8.0.0 Presentation Talking Points

- “我们把 AI Assist 和 Video Check 拆开了：前者是 API 辅助，后者是本地 YOLO 视频分析链路。” / “We separated AI Assist and Video Check: the former is API assistance, while the latter is a local YOLO video analysis pipeline.”
- “视频结果只做 behavior-risk hint，不做 veterinary diagnosis，所以不会直接说耳螨、骨折、感染或生病。” / “Video results are only behavior-risk hints, not veterinary diagnosis, so the app does not directly claim ear mites, fracture, infection, or illness.”
- “8.0.0 不只是加了一个页面，还修复了地图、Profile、Health、AI、登录页和移动端底栏的适配问题。” / “8.0.0 is not just a new page; it also fixes responsiveness across Map, Profile, Health, AI, login, and mobile navigation.”
- “后端通过 Express 接收视频，再转发给 FastAPI YOLO 服务，这样主应用和模型服务可以独立运行和替换。” / “The backend receives videos through Express and forwards them to a FastAPI YOLO service, so the main app and model service can run and evolve independently.”

### J) 核心影响范围 / Core Impact Area

- 前端页面层：新增 Video Check 页面、移动端 More 菜单、Profile 新布局、Health 趋势卡和 AI 卡片修复 / Frontend page layer: new Video Check page, mobile More menu, Profile layout, Health trend cards, and AI card fixes.
- 前端交互层：视频上传、Demo 分析、结果渲染、移动端导航切换、modal focus 修复 / Frontend interaction layer: video upload, demo analysis, result rendering, mobile navigation switching, and modal focus fix.
- 后端 API 层：新增视频上传代理接口，并通过 `VIDEO_AI_URL` 对接模型服务 / Backend API layer: new video upload proxy endpoint connected to the model service through `VIDEO_AI_URL`.
- Python 模型层：新增 FastAPI 服务，使用 OpenCV 抽帧和 Ultralytics YOLO 检测猫/狗主体 / Python model layer: new FastAPI service using OpenCV frame sampling and Ultralytics YOLO cat/dog detection.
- 文档层：README、环境变量说明、Python 服务 README 和 8.0.0 版本日志同步更新 / Documentation layer: README, environment variable notes, Python service README, and the 8.0.0 release log are aligned.

### K) 当前验收标准 / Current Acceptance Criteria

- 前端构建必须通过，且 `frontend/public/app/app.js` 语法检查通过 / The frontend build must pass, and `frontend/public/app/app.js` must pass syntax check.
- 后端 TypeScript 构建必须通过，且 `/api/status` 正常响应 / Backend TypeScript build must pass, and `/api/status` must respond normally.
- 无视频调用 `/api/ai/video-behavior` 必须返回明确错误，而不是服务崩溃 / Calling `/api/ai/video-behavior` without a video must return a clear error instead of crashing.
- 移动端 390px 宽度不应出现页面级横向滚动 / The 390px mobile width should not produce page-level horizontal scrolling.
- 控制台不应出现 `uncaught` 前端异常 / The console should not show `uncaught` frontend exceptions.
- 所有行为风险提示必须保持非诊断表达 / All behavior-risk hints must remain non-diagnostic.

## 架构说明 / Architecture

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

## 涉及文件 / Files Changed

- 主站入口与页面结构 / Main-site entry and page structure:
  [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1)
- 主站交互逻辑 / Main-site interaction logic:
  [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1)
- 主站响应式样式 / Main-site responsive styles:
  [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1)
- 地图逻辑与适配 / Map behavior and responsiveness:
  [frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:1)
- 后端配置与路由 / Backend config and routes:
  [backend/src/config.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/config.ts:1),
  [backend/src/registerRoutes.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/registerRoutes.ts:1)
- Python 视频分析服务 / Python video analysis service:
  [ai-video-service/app.py](/Users/jeremy/Desktop/Group1-pawtrace/ai-video-service/app.py:1),
  [ai-video-service/requirements.txt](/Users/jeremy/Desktop/Group1-pawtrace/ai-video-service/requirements.txt:1),
  [ai-video-service/README.md](/Users/jeremy/Desktop/Group1-pawtrace/ai-video-service/README.md:1)
- 环境与说明文档 / Environment and documentation:
  [.env.example](/Users/jeremy/Desktop/Group1-pawtrace/.env.example:1),
  [backend/.env.example](/Users/jeremy/Desktop/Group1-pawtrace/backend/.env.example:1),
  [README.txt](/Users/jeremy/Desktop/Group1-pawtrace/README.txt:1)
- 本版本日志 / This release log:
  [pawtrace-8.0.0.plan.md](/Users/jeremy/Desktop/Group1-pawtrace/plans/plans/pawtrace-8.0.0.plan.md:1)

## 本地运行 / Local Runbook

### 1) 启动 Python YOLO 服务 / Start the Python YOLO Service

```bash
cd ai-video-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8008
```

### 2) 配置后端环境变量 / Configure Backend Environment

```bash
VIDEO_AI_URL=http://127.0.0.1:8008/analyze-video
```

### 3) 启动 PawTrace / Start PawTrace

按当前 README 使用现有前后端启动方式，本地默认入口仍是主站和后端分离 / Use the existing frontend/backend startup commands from the current README; local development still keeps the main site and backend separated.

```bash
npm run dev
```

默认检查入口 / Default check points:

- Main site: `http://localhost:5173/`
- Backend status: `http://localhost:3000/api/status`
- Video API: `POST http://localhost:3000/api/ai/video-behavior`
- YOLO service: `POST http://127.0.0.1:8008/analyze-video`

## 验证状态 / Verification Status

- 已完成 `npm run build --prefix frontend`，前端构建通过 / `npm run build --prefix frontend` completed successfully.
- 已完成 `npm run build --prefix backend`，后端 TypeScript 构建通过 / `npm run build --prefix backend` completed successfully.
- 已完成 `node --check frontend/public/app/app.js`，前端脚本语法检查通过 / `node --check frontend/public/app/app.js` completed successfully.
- 已完成 `git diff --check`，未发现空白或补丁格式问题 / `git diff --check` completed successfully with no whitespace or patch-format issues.
- 已检查 `POST /api/ai/video-behavior` 在无视频时返回 `{"error":"video file is required"}`，接口错误处理生效 / Checked that `POST /api/ai/video-behavior` returns `{"error":"video file is required"}` when no video is provided, confirming upload validation.
- 已通过 Chrome/CDP 对 `390px / 834px / 1440px` 宽度执行 Map、Pets、Chat、Health、Video Check、AI、Profile 页面审计，未发现页面级横向溢出 / Chrome/CDP audits across `390px / 834px / 1440px` for Map, Pets, Chat, Health, Video Check, AI, and Profile found no page-level horizontal overflow.
- 已完成前端控制台审计，修复 modal focus 问题后没有 `uncaught` error / Frontend console audit completed; after the modal focus fix, no `uncaught` error remains.

## 已知边界 / Known Boundaries

- 当前 YOLO 视频分析是 MVP：基于抽帧、猫/狗检测框和中心点运动变化，不是完整的宠物姿态识别 / The current YOLO video analysis is an MVP based on sampled frames, cat/dog boxes, and center-point movement changes, not full pet pose recognition.
- 快速运动事件可能来自兴奋、抓挠、甩动、相机抖动或画质问题，需要用户结合实际观察判断 / Rapid-movement events may come from excitement, scratching, shaking, camera motion, or poor video quality, and require user observation.
- 历史对比区域目前以演示和 UI 表达为主，尚未接入长期真实行为基线数据库 / The history comparison area is currently demo/UI-focused and not yet backed by a long-term behavior baseline database.
- Python 服务首次运行会下载 YOLO 模型，可能受网络和本机 Python 环境影响 / The Python service may download the YOLO model on first run, depending on network and local Python setup.

## 后续建议 / Recommended Next Steps

- 引入 YOLO-Pose 或宠物关键点模型，让弓背、跛行、舔爪、抓耳等动作从“运动强度推断”升级到“姿态/关键点证据” / Introduce YOLO-Pose or pet keypoint models so behaviors such as hunched posture, limping, paw licking, and ear scratching can move from movement inference to pose/keypoint evidence.
- 为每只宠物建立历史 baseline，对比本周和上周活动量、快速动作频率、休息时长和异常事件分布 / Build per-pet baselines comparing this week and last week across activity, rapid-movement frequency, rest duration, and abnormal-event distribution.
- 为 Video Check 增加结果保存、历史详情页和同一宠物多视频对比 / Add result saving, a history detail page, and multi-video comparison for the same pet.
- 增加视频质量提示，例如光线不足、主体过小、宠物离开画面、相机抖动过强 / Add video-quality prompts such as low light, subject too small, pet leaving frame, and excessive camera shake.

## 交付总结 / Delivery Summary

- 8.0.0 把 PawTrace 的 AI 能力边界拆清楚：`AI Assist` 是 API 辅助，`Video Check` 是 YOLO 视频模型 / 8.0.0 clarifies PawTrace’s AI boundaries: `AI Assist` is API assistance, while `Video Check` is the YOLO video-model feature.
- 这一版不是单纯新增页面，也把主站在移动端和桌面端的适配问题集中收口 / This release is not only a new page; it also consolidates main-site responsiveness fixes across mobile and desktop.
- 当前状态已经适合本地演示：主站页面稳定、后端接口可验证、Python YOLO 服务可独立启动，且产品文案避免 unsupported medical claims / The current state is ready for local demos: the main site is stable, the backend endpoint is verifiable, the Python YOLO service can run independently, and the product copy avoids unsupported medical claims.
