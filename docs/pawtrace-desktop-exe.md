# PawTrace Windows EXE 打包说明

## 当前状态

仓库目前没有 Electron 或 Tauri 桌面壳，所以还不能直接生成 `.exe`。我保留了网页端，并提供了 EXE 准备命令：

```bash
npm run package:exe:prepare
```

这个命令会生成桌面壳可加载的 `frontend/dist`。

## 推荐方案

### 方案 A：远程后端

- EXE 壳内置或加载 `frontend/dist`。
- `frontend/public/app/runtime-config.js` 指向线上 HTTPS API。
- 用户电脑只运行桌面壳，后端统一部署。

### 方案 B：内置本机后端

- EXE 启动本机 Node 后端。
- 桌面页连接 `http://127.0.0.1:<port>`。
- 用户离线可打开界面，但数据库、AI、YOLO 服务仍要随包或独立安装。

## 真正生成 EXE 需要补的内容

- 选择 Electron 或 Tauri。
- 新增桌面入口项目文件。
- 新增 Windows 打包依赖和签名配置。
- 决定后端是远程部署还是随 EXE 启动。

当前不直接添加 Electron/Tauri，是为了避免仓库突然引入大量桌面依赖并影响网页端、Android 和 iOS 的稳定打包。
