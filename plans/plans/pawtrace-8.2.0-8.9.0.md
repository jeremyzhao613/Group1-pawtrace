---
name: pawtrace-8-2-0-to-8-9-0-integrated-release-pack
version: 8.9.0
range: 8.2.0-8.9.0
type: bundled-minor
status: local-draft
---

# PawTrace 8.2.0 - 8.9.0 合并更新包

## 版本定位

- **版本范围**：8.2.0 到 8.9.0
- **发布类型**：8.x 后半段功能、运营、可视化和交付文档合并包
- **发布状态**：已提交并推送到 `main`；远端已有 `v8.9.0` tag 指向合并包提交前的 `6d2212e`，本合并包未移动既有 tag
- **核心主题**：从 M5Stack 设备遥测接入，到主 App 实时 GPS/健康展示、Glass 遥测看板、Monitor 商业智能、Video Behavior Check 产品化，再到文档与环境变量收口。
- **不包含范围**：8.0.0 的 YOLO 基线版本、8.1.0/8.1.1/8.1.2 的安全加固、打包脚本和依赖治理保留在各自版本文档中，不重复并入本合并包。

## 合并版一句话总结

8.2.0 - 8.9.0 将 PawTrace 从“已具备 AI/视频检测和基础打包能力的 Web App”，推进到“能够接收硬件原型真实遥测、在主 App 和 Glass Dashboard 展示实时 GPS/健康数据、在 Monitor 中形成收入与客户画像闭环，并具备更完整交付说明的阶段版本”。

## 版本拆分摘要

| 版本 | 核心主题 | 合并包中的角色 |
| --- | --- | --- |
| 8.2.0 | M5Stack 设备遥测后端接入 | 建立设备数据入口、鉴权、入库、latest/history 查询和硬件文档 |
| 8.3.0 | 实时 GPS 地图与健康面板联动 | 将设备遥测接入主 App 的宠物卡片、健康页和地图 |
| 8.4.0 | PawTrace Glass 遥测运营看板 | 将 Glass 从展示界面升级为真实后端数据看板 |
| 8.5.0 | 销售收入、订阅与客户智能 Monitor | 将 Monitor 升级为商业智能与客户依赖度分析界面 |
| 8.6.0 | Video Behavior Check 真实流程收口 | 将视频检测页面从演示状态推进到更接近真实上传分析流程 |
| 8.7.0 | Monitor 数据采集与客户画像闭环 | 保留并扩展 monitor collect/overview，形成数据来源闭环 |
| 8.8.0 | 多界面高级视觉与响应式体验统一 | 统一主 App、Map、Monitor 和 Glass 的视觉密度与移动端表现 |
| 8.9.0 | 文档、环境变量与交付说明收口 | 补齐 M5Stack 文档、README、环境变量和发布叙事 |

## 合并更新内容

### 1. 设备遥测与后端数据链路

- 新增 `POST /api/device/telemetry`，支持 M5Stack / M5StickC Plus 原型设备上报 GPS、PPG、SpO2、温度、电池、Wi-Fi、上传状态和固件信息。
- 新增设备鉴权方式：用户 JWT 或 `DEVICE_INGEST_TOKEN`，token 可通过 `x-device-token` 或 `Authorization: Bearer` 传入。
- 新增 `GET /api/device/telemetry/latest` 和 `GET /api/device/telemetry/history`，用于读取最新设备包和历史遥测数据。
- 新增 `latestDeviceTelemetry` 内存缓存，降低最新设备状态读取延迟。
- 将有效健康数据写入 `HealthMeasurement`，将有效 GPS 写入 `LocationPoint` 并同步 `LastLocation`。
- 新增 `DEVICE_DEFAULT_USER`，支持设备 token 上报时默认关联到 `demo` 用户。

### 2. 主 App 实时 GPS 与健康展示

- 主 App 接入设备遥测轮询，定期读取 `/api/device/telemetry/latest`。
- 宠物卡片展示设备 ID、电量、最新定位、体温、心率、SpO2、活动状态和上传状态。
- Health Monitoring 页面展示 GPS fix、卫星数量、HDOP、geofence、lost alert、Wi-Fi、HTTP 上传码和传感器接触状态。
- 地图支持真实经纬度宠物位置和 live GPS 标记，无有效 GPS 时回退到既有地图坐标或默认区域。
- 健康趋势从纯手动记录扩展为手动记录与设备遥测混合数据源。

### 3. Glass 遥测运营看板

- `pawtrace-glass` 从展示型数字孪生界面升级为 GPS 与宠物健康遥测运营看板。
- 新增 demo 登录流程，自动使用 `demo / demo123` 获取 JWT 并读取真实后端数据。
- 新增 `Send demo M5 packet`，可向 `/api/device/telemetry` 发送演示设备包。
- 新增 OpenStreetMap iframe 地图，按最新有效 GPS 或历史 `LocationPoint` 居中展示宠物位置。
- 新增 PostgreSQL telemetry history 表格和最新 JSON packet 面板。
- 当最新包没有有效 GPS 时，自动回退到数据库最后一个有效定位点。

### 4. Monitor 商业智能与客户画像闭环

- 将 `monitor/index.html` 升级为产品销售、App 订阅收入和客户智能看板。
- 新增 Product Revenue、App Subscription Revenue、Client Reliance Index、AI Care Consults 四类核心指标。
- 新增 Revenue Mix Trend、AI Care Topics、Subscription & Retention Signals、Product Revenue Ranking、Client Profiles & Reliance、Client Pet Intelligence、Post-Consult AI Data 和 Order Ledger。
- 保留并扩展 `/api/monitor/collect`，可采集 user profile、pet profile、purchase 和 chat log。
- `/api/monitor/overview` 输出 recent users、recent pets、recent purchases 和 recent chat logs，供 Monitor 聚合分析。
- 使用 `MONITOR_MAX` 控制每类采集数据保留上限，并自动修剪旧记录。
- 本地开发环境在没有 `MONITOR_API_TOKEN` 时允许访问 monitor API，生产环境仍保持令牌保护。

### 5. Video Behavior Check 产品化收口

- Video Check 页面增加更明确的空状态、上传状态、风险指标和真实分析流程提示。
- 结果展示聚焦真实上传视频后的 detection result、summary、timeline、events、advice 和 disclaimer。
- UI 文案从内部模型命名逐步转为产品化的 `Video Behavior Check`，减少用户直接感知 YOLO 技术名。
- 加强认证后的视频检测错误处理，避免请求失败后界面停留在不明确状态。

### 6. 多界面视觉与响应式统一

- 主 App、Map、Monitor 和 Glass Dashboard 统一向更成熟的运营产品视觉靠拢。
- 地图新增 OpenStreetMap tile 渲染、地图归因、定位 readout 和实时宠物状态说明。
- Monitor 使用原生 canvas 绘图，减少外部 CDN 依赖，兼容更严格 CSP。
- 统一关键控件、卡片、指标、列表、图表、地图面板和移动端布局的空间密度。
- 修正长文本、按钮、图表和列表在桌面/移动端的溢出风险。
- 加强暗色主题下的可读性、层级、边框和 hover 状态。

### 7. 文档、环境变量与交付说明

- 新增 `docs/pawtrace-m5stack-telemetry.md`，记录硬件原型定位、硬件结构、数据路径、后端配置、payload 示例、真实地图显示和本地 curl 测试。
- README 补充 M5Stack telemetry、`DEVICE_INGEST_TOKEN`、设备上报接口和主 App 数据合并说明。
- `.env.example` 和 `backend/.env.example` 补充 `DEVICE_INGEST_TOKEN` 与 `DEVICE_DEFAULT_USER`。
- 明确 M5StickC Plus 适合 prototype，不应被描述为最终量产硬件。
- 明确 Heart Rate HAT 的 PPG 读数属于 proof-of-concept physiological sensing，不作为可靠宠物医学测量。

## API 与环境变量汇总

### 新增或重点接口

| 接口 | 用途 |
| --- | --- |
| `POST /api/device/telemetry` | 接收 M5Stack JSON 遥测包，写入健康数据和有效定位 |
| `GET /api/device/telemetry/latest` | 登录用户读取最近设备 telemetry，支持 `deviceId` 和 `limit` |
| `GET /api/device/telemetry/history` | 登录用户读取设备历史 telemetry，支持 `deviceId` 和 `limit` |
| `POST /api/monitor/collect` | 采集用户、宠物、订单和聊天业务数据 |
| `GET /api/monitor/overview` | 输出 Monitor 商业看板聚合数据 |

### 新增或重点环境变量

| 变量 | 用途 |
| --- | --- |
| `DEVICE_INGEST_TOKEN` | 设备上报专用 token，用于无用户 JWT 的硬件原型写入 |
| `DEVICE_DEFAULT_USER` | 设备 token 上报时的默认用户，开发环境建议使用 `demo` |
| `MONITOR_API_TOKEN` | Monitor API 生产访问令牌 |
| `MONITOR_MAX` | Monitor 每类采集数据的保留上限 |

## 主要影响文件

### 后端与配置

- `backend/src/registerRoutes.ts`
- `backend/src/config.ts`
- `backend/src/middleware/monitorAuth.ts`
- `.env.example`
- `backend/.env.example`

### 主 App

- `frontend/index.html`
- `frontend/public/app/app.js`
- `frontend/public/app/app.css`
- `frontend/public/app/style.tailwind.css`
- `frontend/public/map.js`
- `frontend/tailwind.config.js`

### Glass Dashboard

- `pawtrace-glass/src/App.tsx`
- `pawtrace-glass/src/index.css`
- `pawtrace-glass/index.html`
- `pawtrace-glass/vite.config.ts`

### Monitor

- `monitor/index.html`

### 文档与版本日志

- `README.txt`
- `docs/pawtrace-m5stack-telemetry.md`
- `plans/plans/pawtrace-8.2.0.md`
- `plans/plans/pawtrace-8.3.0.md`
- `plans/plans/pawtrace-8.4.0.md`
- `plans/plans/pawtrace-8.5.0.md`
- `plans/plans/pawtrace-8.6.0.md`
- `plans/plans/pawtrace-8.7.0.md`
- `plans/plans/pawtrace-8.8.0.md`
- `plans/plans/pawtrace-8.9.0.md`

## 发布说明建议

如果将 8.2.0 - 8.9.0 作为一个 GitHub Release 或答辩汇报版本，可以使用以下标题：

```text
PawTrace 8.9.0 - Device Telemetry, Live GPS, Glass Dashboard and Monitor Intelligence
```

建议 release body 使用四段式结构：

- **Hardware telemetry**：M5Stack 原型设备上报、设备 token、健康与 GPS 入库。
- **Live product experience**：主 App 宠物卡片、健康面板和地图展示真实设备数据。
- **Operations and business intelligence**：Glass Dashboard 与 Monitor 分别覆盖遥测运营和商业/客户画像分析。
- **Release readiness**：README、环境变量样例、硬件边界说明和本合并更新包。

## 发布前检查清单

- 后端配置 `DEVICE_INGEST_TOKEN`、`DEVICE_DEFAULT_USER`、`JWT_SECRET`、`CORS_ORIGIN` 和必要的 AI/YOLO 服务地址。
- 生产环境配置 `MONITOR_API_TOKEN`，避免 Monitor API 被匿名访问。
- 使用 curl 或 M5Stack 固件发送一条有效 telemetry 包，确认 `HealthMeasurement`、`LocationPoint` 和 `LastLocation` 写入符合预期。
- 打开主 App Map 与 Health 页面，确认 live GPS、健康遥测和 fallback 状态可读。
- 打开 `pawtrace-glass`，确认 demo 登录、发送 demo M5 packet、地图和 telemetry history 正常。
- 打开 Monitor，确认收入、订阅、客户画像、AI Care Topics 和订单 ledger 能从 collect/overview 数据中渲染。
- 重新运行 `npm run release:check`，确认合并发布前构建链路仍通过。

## 剩余风险

- M5StickC Plus 和 Heart Rate HAT 仍属于原型验证硬件，传感器读数不能作为宠物医学诊断依据。
- 设备 token 适合原型阶段，正式硬件量产前需要进一步设计设备级身份、密钥轮换和撤销机制。
- 当前 Monitor 数据采集仍是轻量内存/本地聚合模式，生产级分析需要持久化数据仓库或数据库模型。
- `pawtrace-glass` 的演示包发送功能适合 demo，不应在生产环境暴露为无保护调试入口。

## 结论

8.2.0 - 8.9.0 是 PawTrace 8.x 后半段的一次合并功能包：它把硬件遥测、主 App 实时展示、Glass 运营看板、Monitor 商业智能、Video Behavior Check 真实流程和交付文档整合成一条连续发布叙事。单版本文档继续保留用于审查细节，本文件用于 GitHub Release、答辩汇报和最终交付说明。
