# PawTrace Windows EXE 打包说明

## 当前状态

仓库现在已经有 Electron 桌面壳，入口是 `desktop/main.cjs`，打包配置在根目录 `package.json` 的 `build` 字段。

```bash
npm run package:desktop:dir
npm run package:exe:prepare
npm run package:exe
```

这些命令会生成桌面壳可加载的 `frontend/dist`，并把运行时 API 地址写入 `frontend/dist/app/runtime-config.js`。

默认桌面包连接 `http://localhost:3000`。如果要连远程后端，在打包时传入：

```bash
PAWTRACE_API_BASE_URL=https://your-api-domain.example npm run package:exe
```

也可以把 `PAWTRACE_API_BASE_URL=https://your-api-domain.example` 写入根目录 `.env` 后再打包。

## 推荐方案

### 方案 A：远程后端

- EXE 壳内置或加载 `frontend/dist`。
- 打包时用 `PAWTRACE_API_BASE_URL` 指向线上 HTTPS API。
- 用户电脑只运行桌面壳，后端统一部署。
- 如果后端开启严格 CORS，需要允许 `pawtrace://app`。

### 方案 B：内置本机后端

- EXE 启动本机 Node 后端。
- 桌面页连接 `http://127.0.0.1:<port>`。
- 用户离线可打开界面，但数据库、AI、YOLO 服务仍要随包或独立安装。

## 生成 EXE

```bash
npm run package:exe
```

产物输出到 `release/desktop/`。当前 Windows 包未配置代码签名证书。
