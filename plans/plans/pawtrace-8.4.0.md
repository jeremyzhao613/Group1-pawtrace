---
name: pawtrace-8-4-0-glass-telemetry-dashboard
version: 8.4.0
type: minor
status: local-draft
---

# PawTrace 8.4.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：PawTrace Glass 遥测运营看板

## 新增

- `pawtrace-glass` 从展示型数字孪生界面升级为 GPS 与宠物健康遥测运营看板。
- 新增 demo 登录流程，自动使用 `demo / demo123` 获取 JWT 并读取真实后端数据。
- 新增 `Send demo M5 packet`，可向 `/api/device/telemetry` 发送演示设备包。
- 新增 OpenStreetMap iframe 地图，按最新有效 GPS 或历史 LocationPoint 居中展示宠物位置。
- 新增 PostgreSQL telemetry history 表格和最新 JSON packet 面板。

## 改进

- 将用户、宠物、设备、GPS、geofence、PPG、SpO2、电池、Wi-Fi 和上传状态整合为单一运营视图。
- 当最新包没有有效 GPS 时，自动回退到数据库最后一个有效定位点。

## 主要影响文件

- `pawtrace-glass/src/App.tsx`
- `pawtrace-glass/src/index.css`
- `pawtrace-glass/index.html`
- `pawtrace-glass/vite.config.ts`
