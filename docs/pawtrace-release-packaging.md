# PawTrace 发布与打包检查清单

这份文档用于主程序发布前检查，以及 Web、Android WebView、iOS WebView、Windows EXE 壳的打包准备。网页端会一直保留，移动端和桌面端都复用同一份 `frontend/dist` 产物。

## 1. 生产环境必填配置

公开发布前，把这些配置写入 `backend/.env` 或部署平台环境变量：

```env
NODE_ENV=production
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/pawtrace"
JWT_SECRET="replace-with-a-long-random-secret"
CORS_ORIGIN="https://your-web-domain.example"
MONITOR_API_TOKEN="replace-with-a-long-random-token"
SERVE_WEB=1
WEB_APP=frontend
VIDEO_AI_URL="http://127.0.0.1:8008/analyze-video"
```

注意：

- `JWT_SECRET` 不能继续使用开发默认值。
- `MONITOR_API_TOKEN` 用来保护 `/api/monitor/*`；不配置时监控 API 会拒绝访问。
- 前后端不同域时，`CORS_ORIGIN` 必须填前端的准确 origin。
- 需要 YOLO 视频行为检查时，`VIDEO_AI_URL` 必须指向运行中的 FastAPI/YOLO 服务。

## 2. Web 打包

```bash
npm run package:web
```

产物在 `frontend/dist`。这是保留网页端的正式产物，可以直接部署到静态托管，也可以让后端单端口托管主站：

```bash
npm run build
NODE_ENV=production SERVE_WEB=1 WEB_APP=frontend npm start --prefix backend
```

## 3. Android WebView 打包

前端现在支持运行时 API 地址。同步 Android 前，先在这里填后端地址：

```js
// frontend/public/app/runtime-config.js
window.PAWTRACE_API_BASE_URL = 'https://your-api-domain.example';
```

然后执行：

```bash
npm run package:android
npm run cap:open:android --prefix frontend
```

在 Android Studio 里构建 APK/AAB。注意：登录、聊天、AI 诊断和 YOLO 分析都依赖后端，安卓包不是完全离线应用。

## 4. iOS WebView 打包

iOS 和 Android 使用同一份 Web 产物，也需要先确认 `runtime-config.js` 指向可访问的 HTTPS 后端：

```bash
npm run package:ios
npm run cap:open:ios --prefix frontend
```

随后在 Xcode 中选择签名 Team，构建模拟器包或真机/TestFlight 包。iOS 真机要求后端使用 HTTPS；如果只是本机调试，需要在 Xcode/Info.plist 中单独处理 App Transport Security。

## 5. Windows EXE 方案

当前仓库还没有 Electron/Tauri 打包代码。EXE 可以走两种方案：

- 远程后端：EXE 壳加载 `frontend/dist`，`runtime-config.js` 指向 HTTPS API 域名。
- 内置后端：EXE 启动本机 Node 后端，`runtime-config.js` 指向本机后端地址。

现在能先准备 EXE 壳需要的网页产物：

```bash
npm run package:exe:prepare
```

要真的生成 `.exe`，还需要新增 Electron 或 Tauri 项目文件和打包依赖。当前我没有把这些依赖塞进仓库，避免在没有确认桌面方案前引入一整套桌面运行时。

## 6. 一次性同步移动端

如果只是想同时刷新 Android 和 iOS 工程：

```bash
npm run package:mobile
```

## 7. 发布前总检查

```bash
npm run release:check
```

## 8. 最终冒烟检查

打包目标上至少确认这些流程：

- 注册、登录、退出、重开应用。
- 地图页能显示店铺点和宠物位置。
- Video Behaviour Check 可上传视频；YOLO 离线时显示受控错误。
- AI 建议/诊断需要登录；缺后端 key 时能给出明确失败。
- Monitor 接口不带 `MONITOR_API_TOKEN` 会被拒绝。
