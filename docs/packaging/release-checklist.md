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

前端现在支持运行时 API 地址。同步 Android 时，打包脚本会自动写入
`frontend/dist/app/runtime-config.js`，再同步到 WebView 工程。

可以把公共后端地址放在根目录 `.env`：

```env
PAWTRACE_API_BASE_URL=https://your-api-domain.example
```

默认未设置 `PAWTRACE_API_BASE_URL` 时，Android/iOS 包会使用当前电脑的局域网地址：
`http://<computer-lan-ip>:3000`。这适合同一 Wi-Fi 或手机热点调试。

如果后端已经部署到线上，请显式传入 HTTPS API 地址：

```bash
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:android
```

本地调试执行：

```bash
npm run package:android
npm run cap:open:android --prefix frontend
```

在 Android Studio 里构建 APK/AAB，或直接生成 debug APK：

```bash
npm run package:apk:debug
```

Android 工程已开启 `INTERNET`、网络状态权限、本地 HTTP/LAN cleartext 和 WebView mixed-content 调试策略。注意：登录、聊天、AI 诊断和 YOLO 分析都依赖后端，安卓包不是完全离线应用。

## 4. iOS WebView 打包

iOS 和 Android 使用同一份 Web 产物。线上后端建议使用 HTTPS：

```bash
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:ios
```

本地调试执行：

```bash
npm run package:ios
npm run cap:open:ios --prefix frontend
```

随后在 Xcode 中选择签名 Team，构建模拟器包或真机/TestFlight 包。当前 iOS 工程已允许本地/LAN HTTP 调试；正式发布仍建议改回 HTTPS 后端。

## 5. 桌面 Electron 包

桌面端使用 Electron 加载同一份 `frontend/dist` 产物。

默认未设置 `PAWTRACE_API_BASE_URL` 时，桌面包会连接：

```text
http://localhost:3000
```

如果后端在远程服务器：

```bash
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:desktop:dir
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:exe
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:dmg
```

只准备桌面网页产物：

```bash
npm run package:exe:prepare
```

后端现在会自动放行 Electron/Capacitor 的本机 origin。若需要手动配置，至少包含：

```env
CORS_ORIGIN=https://your-web-domain.example,pawtrace://app,capacitor://localhost,ionic://localhost
```

打包后的应用里也可以点击顶部连接状态，临时改写 API 地址；该值会保存在本机 `localStorage`。

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
