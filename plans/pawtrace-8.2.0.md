---
name: pawtrace-8-2-0-m5stack-device-telemetry-backend
version: 8.2.0
type: minor
status: local-draft
---

# PawTrace 8.2.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：M5Stack 设备遥测后端接入
- **GitHub 对比基准**：`origin/codex/8.1.0-security-packaging-release`
- **核对时间**：2026-04-30，本地已执行 `git fetch origin`

## GitHub 对比结论

- GitHub 远端默认分支是 `origin/main`，但当前工作分支跟踪 `origin/codex/8.1.0-security-packaging-release`；`origin/main` 还会包含大量 8.1.0 分支差异，所以 8.2.0 以当前跟踪分支作为对比基准。
- 和 GitHub 跟踪分支相比，8.2.0 的核心差异是新增设备遥测配置、鉴权、入库、查询接口和硬件接入文档。
- 当前工作区还包含前端 live GPS、Glass dashboard、Monitor 商业看板等更大范围改动；这些不归入 8.2.0，已在后续 8.3.0、8.4.0、8.5.0、8.7.0 草案中拆分记录。

## 新增

- 新增 M5Stack / M5StickC Plus 设备数据接入接口 `POST /api/device/telemetry`。
- 新增设备上报鉴权：支持用户 JWT，也支持 `DEVICE_INGEST_TOKEN` 通过 `x-device-token` 或 `Authorization: Bearer` 传入。
- 新增 `GET /api/device/telemetry/latest` 和 `GET /api/device/telemetry/history`，用于读取最新设备包和历史遥测数据。
- 新增设备遥测缓存 `latestDeviceTelemetry`，提升最新状态展示速度。
- 新增对 `HealthMeasurement`、`LocationPoint` 和 `LastLocation` 的写入链路。
- 新增 `DEVICE_DEFAULT_USER`，当设备 token 上报但 payload 没有明确用户时，可默认关联到 `demo` 用户。
- 新增 `docs/pawtrace-m5stack-telemetry.md`，记录 M5StickC Plus、GPS v1.1、Heart Rate HAT、数据包格式、curl 测试和展示链路。

## 改进

- 支持 M5StickC Plus snake_case 数据包，例如 `device_id`、`battery_pct`、`gps_fix`、`pet_bpm`、`temp_c`、`spo2_valid`。
- 统一映射 GPS、PPG、SpO2、电池、Wi-Fi、上传状态、固件、硬件板卡等元数据。
- 当 `location_valid=false`、`gps_fix=0` 或坐标为 `0,0` 时，只保存健康数据，不写入地图定位点。
- JWT 用户写入时只能写入自己的 telemetry；设备 token 写入时可通过 `userId`、`user_id`、`username`、`ownerId` 或 `owner_id` 解析用户。
- `latest` 查询会合并内存缓存与数据库 `HealthMeasurement`，按设备和用户取最新包，避免刚上报后的 UI 读取延迟。

## 与 GitHub 文件的主要差异

| 文件 | GitHub 当前状态 | 8.2.0 当前工作区差异 |
| --- | --- | --- |
| `.env.example` | 没有设备上报配置 | 新增 `DEVICE_INGEST_TOKEN`、`DEVICE_DEFAULT_USER=demo` |
| `backend/.env.example` | 仅包含数据库、JWT、AI、Monitor、静态服务配置 | 新增设备 ingest token 示例和默认用户配置 |
| `backend/src/config.ts` | 没有设备遥测相关配置项 | `config` 新增 `DEVICE_INGEST_TOKEN`、`DEVICE_DEFAULT_USER` |
| `backend/src/registerRoutes.ts` | 没有 `/api/device/telemetry*` 路由 | 新增设备鉴权、字段解析、metadata 归一化、入库、缓存、latest/history 查询 |
| `README.txt` | 环境变量与功能说明未提 M5Stack | 新增 M5Stack Telemetry 章节和接口说明 |
| `docs/pawtrace-m5stack-telemetry.md` | GitHub 跟踪分支不存在该文件 | 新增硬件定位、数据链路、payload、curl、本地测试和硬件文档链接 |

## 接口差异

| 接口 | GitHub 当前状态 | 8.2.0 行为 |
| --- | --- | --- |
| `POST /api/device/telemetry` | 不存在 | 接收 M5Stack JSON 包，支持 JWT 或设备 token，写入健康数据和有效定位 |
| `GET /api/device/telemetry/latest` | 不存在 | 登录用户读取最近设备 telemetry，支持 `deviceId` 和 `limit` |
| `GET /api/device/telemetry/history` | 不存在 | 登录用户读取设备历史 telemetry，支持 `deviceId` 和 `limit` |

## 数据落库规则

- 每个有效包都会写入 `HealthMeasurement`，用于健康、设备状态和历史 telemetry。
- 只有经纬度有效、非 `0,0`、`location_valid` 不为 false 且 `gps_fix` 不为 0 时，才写入 `LocationPoint`。
- 当 telemetry 有有效位置且能确认用户存在时，同步更新 `LastLocation`。
- SpO2、Wi-Fi、上传状态、GPS 卫星数、HDOP、geofence、lost alert、raw IR/RED 等字段保存在 `metadata` 中，并在查询响应中展开为前端可读字段。

## 当前工作区中不归入 8.2.0 的差异

- `frontend/index.html`、`frontend/public/app/app.js`、`frontend/public/map.js`、`frontend/public/app/style.tailwind.css`：前端 live GPS 地图、健康面板、宠物卡片遥测合并，归入 8.3.0。
- `pawtrace-glass/index.html`、`pawtrace-glass/src/App.tsx`、`pawtrace-glass/src/index.css`、`pawtrace-glass/vite.config.ts`：Glass GPS 健康遥测看板，归入 8.4.0。
- `monitor/index.html`、`backend/src/middleware/monitorAuth.ts` 中的 Monitor 体验与本地鉴权调整：归入 8.5.0 / 8.7.0。

## 主要影响文件

- `backend/src/registerRoutes.ts`
- `backend/src/config.ts`
- `.env.example`
- `backend/.env.example`
- `README.txt`
- `docs/pawtrace-m5stack-telemetry.md`
