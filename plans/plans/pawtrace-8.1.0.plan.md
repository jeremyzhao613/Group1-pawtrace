---
name: pawtrace-8-1-0-security-packaging-and-map-recovery-release
overview: 8.1.0 是 PawTrace 在 8.0.0 YOLO Video Check 之后的安全加固、地图恢复、发布打包和文档规范化版本。本版本移除主程序冗余浏览器外壳，恢复地图店铺与宠物位置渲染，收紧认证与隐私边界，建立 Web、Android、iOS 和 Windows EXE 准备流程，并要求后续计划文档使用更专业、可审计的发布说明表达。
todos:
  - id: main-shell-simplification
    content: 移除主程序顶部冗余浏览器栏和边框，保留应用主体结构与导航能力，降低展示界面的非业务噪声。
    status: completed
  - id: map-marker-recovery
    content: 修复地图店铺点和宠物位置图层的层级、可见性和尺寸约束，恢复 Campus Map 的关键定位信息。
    status: completed
  - id: frontend-auth-hardening
    content: 将登录注册切换为后端 JWT 流程，清理本地用户数据中的密码、哈希和 token 字段，并为受保护 API 注入 Authorization。
    status: completed
  - id: backend-access-control
    content: 收紧 pets、users、chat、location、sticky notes、AI、YOLO 和 monitor 接口权限，增加生产 JWT_SECRET、CORS 和 CSP 防护。
    status: completed
  - id: packaging-readiness
    content: 建立 Web、Android、iOS、移动端同步和 Windows EXE 准备脚本，补充运行时 API 地址配置和打包文档。
    status: completed
  - id: repository-bloat-cleanup
    content: 从 Git 索引移除 backend/node_modules 依赖产物，保留本地依赖文件，降低仓库体积和审查噪声。
    status: completed
  - id: verification
    content: 完成 Web、Android、iOS、EXE 准备命令、release check、后端构建、diff 空白检查和地图浏览器验证。
    status: completed
isProject: false
---

# PawTrace 8.1.0 安全加固、地图恢复与多端打包准备日志

## 版本定位

- **版本类型**：8.0.0 之后的稳定性、安全性和交付流程加固版本。
- **核心目标**：恢复地图核心业务信息，降低主界面冗余视觉结构，完成上线前的认证、接口、监控和打包流程收口。
- **交付范围**：主程序 UI、地图图层、前端认证、后端权限、监控保护、Tailwind 构建链路、Web/Android/iOS/EXE 准备脚本、发布文档和计划文档规范。
- **文档规范要求**：后续 `plans/plans/*.md` 应减少口语化表达，使用更专业的变更说明、影响范围、验收标准和剩余风险描述。

## 8.1.0 更新内容

### 1. 主程序外壳简化

- 删除主程序顶部模拟浏览器工具栏，包括窗口控制点、地址栏文本 `PawTrace / video-behaviour-check` 和右侧头像按钮。
- 主程序 `.app-browser-frame`、`.app-browser-toolbar` 和 `.app-address-bar` 增加最终覆盖规则，确保桌面端和移动端不再恢复边框。
- 保留登录页独立展示结构，不影响主程序进入后的应用导航、底部移动端导航和页面切换逻辑。
- 变更目标是让展示内容聚焦 PawTrace 本身，而不是额外的浏览器拟态外壳。

### 2. 地图店铺与宠物位置恢复

- 修复 `#map-markers-layer` 和 `#map-pets-layer` 的层级、可见性、尺寸和 pointer-events 配置。
- 明确地图背景、覆盖层、店铺点和宠物点的 z-index 顺序，避免地图装饰层遮挡业务标记。
- 恢复 Campus Map 中的店铺选择点和宠物实时位置点。
- 使用本地浏览器验证 `http://localhost:5173/#map`：地图页可见 `5` 个店铺点和 `3` 个宠物位置，`tracked-pet-count` 显示 `3 tracked`。

### 3. 前端认证和本地存储加固

- 登录和注册改为调用 `/api/auth/login` 与 `/api/auth/register`，由后端返回 JWT 和用户资料。
- 新增 `pawtrace_auth_token` 管理逻辑，并通过 `Authorization: Bearer <token>` 调用受保护接口。
- 本地 `pawtrace_users` 和 `pawtrace_current_user` 会清理 `password`、`passwordHash` 和 `token` 字段，避免浏览器持久化敏感凭据。
- 访客模式继续保留，但不会伪造认证 token。
- 受保护的 AI、视频行为检查、宠物预测和聊天请求均接入认证请求封装。
- 新增 `frontend/public/app/runtime-config.js`，支持 Android、iOS 和 EXE 壳设置远程 API 地址：

```js
window.PAWTRACE_API_BASE_URL = 'https://your-api-domain.example';
```

### 4. 后端访问控制和生产安全配置

- 生产环境中禁止使用开发默认 `JWT_SECRET`，避免发布环境使用弱密钥。
- 新增 `CORS_ORIGIN` 配置，支持按部署域名限制跨域来源。
- 启用 Helmet CSP，不再关闭 `contentSecurityPolicy`。
- `/api/monitor/*` 在缺少 `MONITOR_API_TOKEN` 时返回不可用状态，不再默认放行。
- `/api/auth/me`、`/api/pets`、`/api/users`、`/api/chat`、`/api/location/points`、`/api/sticky-notes`、AI 和 YOLO 相关接口均要求认证。
- 宠物读取限制为当前用户宠物和演示公共宠物；单只宠物读取与删除会检查 owner 归属。
- `/api/users` 仅返回当前登录用户资料，不再公开全量用户列表。
- 聊天历史使用当前用户 ID 对 `contactId` 做命名空间隔离，避免不同用户共享同一联系人 ID 时串读历史。
- Sticky Notes 读取、写入和删除统一要求登录，避免便签内容被匿名读取。

### 5. 前端构建链路和资源打包

- 移除 Tailwind CDN 运行时加载，改为构建时生成本地 CSS。
- 新增 `frontend/public/app/app.css`，由 `npm run build:app-css --prefix frontend` 生成。
- `frontend/index.html` 改为加载 `/app/app.css` 和 `/app/runtime-config.js`。
- `frontend/tailwind.config.js` 扩展 content 扫描范围，确保 HTML、app JS、map JS 和 src 文件都参与样式生成。
- `frontend/package.json` 中 `dev` 和 `build` 均先执行 `build:app-css`，减少开发和发布样式不一致风险。

### 6. 多端打包脚本

根目录新增或调整以下脚本：

```json
{
  "package:web": "npm run build:web",
  "package:mobile": "npm run build:web && npm run cap:sync --prefix frontend",
  "package:android": "npm run build:web && npm run cap:sync:android --prefix frontend",
  "package:ios": "npm run build:web && npm run cap:sync:ios --prefix frontend",
  "package:exe:prepare": "npm run build:web",
  "release:check": "npm run build"
}
```

前端新增 Capacitor 平台同步脚本：

```json
{
  "cap:sync:android": "npx cap sync android",
  "cap:sync:ios": "npx cap sync ios"
}
```

### 7. Web、Android、iOS 和 EXE 准备结果

- `npm run package:web` 已通过，网页端正式产物位于 `frontend/dist`。
- `npm run package:android` 已通过，Web 产物已同步至 `frontend/android/app/src/main/assets/public`。
- `npm run package:ios` 已通过，Web 产物已同步至 `frontend/ios/App/App/public`。
- `npm run package:exe:prepare` 已通过，可为后续 Electron 或 Tauri 桌面壳提供 `frontend/dist`。
- 当前仓库尚未包含 Electron 或 Tauri，因此本版本不直接生成 `.exe` 文件；此决策避免在未确认桌面方案前引入大量桌面运行时依赖。

### 8. 发布与打包文档

- 新增 Web、Android、iOS、Windows EXE 的发布总清单。
- 新增 Android/iOS 移动端打包说明，明确 Capacitor 同步、Android Studio 和 Xcode 后续步骤。
- 新增 Windows EXE 打包说明，明确远程后端和内置后端两种桌面发布路径。
- 文档强调移动端和桌面端需要配置可访问后端，否则登录、聊天、AI 诊断和 YOLO 视频分析不可用。

### 9. 仓库体积和依赖跟踪治理

- 从 Git 索引移除 `backend/node_modules`，本地依赖文件保持不变。
- 该清理减少约 `633` 个依赖文件的版本控制噪声。
- 后续依赖应通过 `package-lock.json` 和安装命令恢复，不应将 `node_modules` 重新提交到仓库。

### 10. 计划文档专业化要求

为减少计划文档口语化表达，后续版本日志建议遵循以下结构：

- **版本定位**：说明版本类型、目标、范围和边界。
- **更新内容**：按模块列出实际变更，避免使用“顺手”“先这样”“看起来”等口语表达。
- **影响范围**：说明前端、后端、数据库、构建链路、文档或打包流程的影响。
- **验证状态**：列出已执行命令、结果和非阻断 warning。
- **剩余风险**：明确仍未解决的问题、外部依赖和下一步决策。
- **涉及文件**：使用准确文件路径，便于审查和回溯。

## 验证状态

### 构建和打包命令

- `npm run package:web`：通过。
- `npm run package:android`：通过。
- `npm run package:ios`：通过。
- `npm run package:exe:prepare`：通过。
- `npm run release:check`：通过，包含主站、pawtrace-glass 和后端构建。
- `npm run build --prefix backend`：通过。
- `git diff --check -- . ':!backend/node_modules'`：通过。

### 浏览器验证

- 使用 headless Chrome 访问 `http://localhost:5173/#map`。
- 验证结果：登录态隐藏、主程序显示、当前页面为 `tab-map`。
- 地图渲染结果：`markerCount = 5`，`petCount = 3`，`trackedCountText = 3 tracked`。

### 非阻断提示

- Browserslist 提示 `caniuse-lite` 数据过期，不影响当前构建产物。
- `pawtrace-glass` 存在 Vite 大包 warning，不影响 8.1.0 主程序安全和打包准备范围。
- Windows EXE 仍需要后续选择 Electron 或 Tauri 后才能生成真实 `.exe` 安装包。

## 涉及文件

### 主程序前端

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1)
- [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1)
- [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1)
- [frontend/public/app/app.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.css:1)
- [frontend/public/app/runtime-config.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/runtime-config.js:1)
- [frontend/tailwind.config.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/tailwind.config.js:1)
- [frontend/package.json](/Users/jeremy/Desktop/Group1-pawtrace/frontend/package.json:1)

### 后端与环境配置

- [backend/src/config.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/config.ts:1)
- [backend/src/index.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/index.ts:1)
- [backend/src/middleware/monitorAuth.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/middleware/monitorAuth.ts:1)
- [backend/src/registerRoutes.ts](/Users/jeremy/Desktop/Group1-pawtrace/backend/src/registerRoutes.ts:1)
- [.env.example](/Users/jeremy/Desktop/Group1-pawtrace/.env.example:1)
- [backend/.env.example](/Users/jeremy/Desktop/Group1-pawtrace/backend/.env.example:1)

### 打包与文档

- [package.json](/Users/jeremy/Desktop/Group1-pawtrace/package.json:1)
- [docs/pawtrace-release-packaging.md](/Users/jeremy/Desktop/Group1-pawtrace/docs/pawtrace-release-packaging.md:1)
- [docs/pawtrace-mobile-packaging.md](/Users/jeremy/Desktop/Group1-pawtrace/docs/pawtrace-mobile-packaging.md:1)
- [docs/pawtrace-desktop-exe.md](/Users/jeremy/Desktop/Group1-pawtrace/docs/pawtrace-desktop-exe.md:1)
- [plans/plans/pawtrace-8.1.0.plan.md](/Users/jeremy/Desktop/Group1-pawtrace/plans/plans/pawtrace-8.1.0.plan.md:1)

## 发布前检查清单

- Web 端：确认 `frontend/dist` 可部署并能读取 `/app/runtime-config.js`。
- Android：在 Android Studio 中打开 `frontend/android`，配置签名后生成 APK/AAB。
- iOS：在 Xcode 中打开 `frontend/ios/App`，配置 Team 和签名后进行 Archive 或真机测试。
- EXE：选择 Electron 或 Tauri 后，复用 `npm run package:exe:prepare` 生成的 Web 产物。
- 后端：生产环境必须配置强 `JWT_SECRET`、`DATABASE_URL`、`CORS_ORIGIN`、`MONITOR_API_TOKEN` 和必要的 AI/YOLO 服务地址。
- 安全：确认 `backend/node_modules` 不再进入 Git 跟踪，避免依赖产物重新污染提交。

## 结论

8.1.0 将 8.0.0 后发现的展示、地图、权限和打包风险集中收口。当前 Web、Android、iOS 和 EXE 准备产物均已通过命令验证；真实 Windows `.exe` 仍需在后续版本中选择并接入桌面壳方案。
