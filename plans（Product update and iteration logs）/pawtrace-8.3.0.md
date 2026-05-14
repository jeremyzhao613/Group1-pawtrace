---
name: pawtrace-8-3-0-live-gps-health-panel
version: 8.3.0
type: minor
status: local-draft
---

# PawTrace 8.3.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：实时 GPS 地图与健康面板联动

## 新增

- 主 App 新增设备遥测轮询，定期读取 `/api/device/telemetry/latest`。
- 宠物卡片接入 M5Stack 数据，展示设备 ID、电量、最新定位、体温、心率、SpO2、活动状态和上传状态。
- Health Monitoring 页面接入遥测包细节，包括 GPS fix、卫星数量、HDOP、geofence、lost alert、Wi-Fi、HTTP 上传码和传感器接触状态。
- 地图支持真实经纬度宠物位置，并在有有效 GPS 数据时显示 live GPS 标记。

## 改进

- 地图店铺改为真实 OpenStreetMap 经纬度语义，不再依赖纯静态示意坐标。
- 宠物位置优先使用实时 GPS；没有有效 GPS 时回退到已有 mapCoords 或默认区域。
- 健康趋势卡从纯手动记录扩展为手动记录 + 设备遥测混合数据源。

## 主要影响文件

- `frontend/public/app/app.js`
- `frontend/public/app/style.tailwind.css`
- `frontend/public/map.js`
