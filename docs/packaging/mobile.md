# PawTrace Android/iOS 打包说明

## 共用前提

移动端使用 Capacitor 包裹网页主程序。先确认后端地址：

```js
// frontend/public/app/runtime-config.js
window.PAWTRACE_API_BASE_URL = 'https://your-api-domain.example';
```

如果移动端只打开本地静态页面而不配置后端，注册、登录、聊天、AI 诊断和 YOLO 视频分析都会不可用。

## Android

```bash
npm run package:android
npm run cap:open:android --prefix frontend
```

然后在 Android Studio 中：

1. 选择 `frontend/android` 工程。
2. 设置签名配置。
3. 使用 `Build > Generate Signed Bundle / APK` 生成 APK 或 AAB。

## iOS

```bash
npm run package:ios
npm run cap:open:ios --prefix frontend
```

然后在 Xcode 中：

1. 选择 `frontend/ios/App` 工程。
2. 设置 Team、Bundle Identifier 和签名。
3. 用模拟器、真机或 Archive/TestFlight 验证。

## 同步两个平台

```bash
npm run package:mobile
```

这个命令会重新构建网页端，并同步到 Android 和 iOS 工程。
