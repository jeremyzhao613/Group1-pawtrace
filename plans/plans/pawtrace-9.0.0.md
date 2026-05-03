---
name: pawtrace-9-0-0-ble-ai-map-mobile-and-pet-input-technical-release
version: 9.0.0
type: major-technical-release
status: local-commit-ready
languages: zh-CN,en-US
source_commit: b212ebe
base_commit: bce4e0d
---

# PawTrace 9.0.0 技术更新文档 / Technical Update Document

> Current implementation note: this 9.0.0 document records the earlier BLE telemetry bridge release. The current hardware path has since been changed to WiFi-only telemetry; BLE is now used only for WiFi provisioning.

## 版本定位

- **版本号**：9.0.0
- **版本类型**：硬件遥测、蓝牙桥接、AI 可用性、地图工具、移动端导航和宠物资料输入逻辑的综合技术版本。
- **本地提交**：`b212ebe Upload latest PawTrace changes`
- **当前分支**：`codex/8.1.0-security-packaging-release`
- **发布状态**：本地已提交；GitHub 推送仍需重新完成 GitHub HTTPS token、SSH key 或 `gh auth login` 认证。
- **核心目标**：让 PawTrace 在没有完整外部服务或硬件长链路时仍可立即演示核心功能，同时保留 Wi-Fi / BLE / GPS / Health / AI / Map / Pet Card 的真实接入路径。

## 一句话总结

9.0.0 将 PawTrace 从 8.x 的硬件遥测和运营看板阶段，推进到一个更完整的可演示技术包：主 App 支持 Web Bluetooth 近场同步和消息写入，后端可接收 Wi-Fi、BLE JSON 和 BLE CSV 遥测，地图具备缩放、电子围栏和路线叠加，AI Assist 在 DashScope 未配置时也有本地 fallback，移动端底部导航直接暴露全部功能，My Pets 表单改成带校验的逻辑化宠物资料输入。

## 主要技术变更

### 1. 后端 AI 服务升级

- 新增 `openai` 依赖，通过 OpenAI SDK 兼容调用 DashScope。
- `backend/src/config.ts` 新增以下配置：
  - `DASHSCOPE_BASE_URL`
  - `QWEN_TEXT_MODEL`
  - `QWEN_VISION_MODEL`
  - `QWEN_ENABLE_THINKING`
- 默认 Qwen 文本和视觉模型改为 `qwen3.6-plus`，AI 超时从示例配置层面提升到 `60000ms`。
- `backend/src/services/aiService.ts` 从手写 `fetch` 请求改为 SDK 客户端。
- 新增 `hasDashScopeKey()`，用于前端和后端判断真实 Qwen 服务是否可用。
- 新增本地 fallback：
  - `getLocalAdvice()`：健康、行为、饮食建议 fallback。
  - `getLocalDiagnosis()`：图片诊断文字 fallback。
  - 原有宠物预测 fallback 保留。
- AI 调用返回 `source` 字段，区分 `qwen`、`qwen-vl`、`qwen-text-fallback` 和 `local`。
- Qwen 请求失败时不再直接让用户界面停在失败状态，而是返回本地 fallback 和 `warning`。

### 2. AI API 可用性与状态接口

- 新增 `GET /api/ai/status`，返回：
  - DashScope 是否配置。
  - 文本模型。
  - 视觉模型。
  - thinking 是否开启。
  - AI timeout。
- `/api/status` 扩展 AI 和 Video AI 状态信息。
- `/api/pet-prediction`、`/api/ai/qwen-advice`、`/api/ai/qwen-diagnosis` 和 `/api/ai/video-behavior` 进入“可立即使用”的演示路径：
  - 外部 AI 可用时调用 Qwen 或 Video AI。
  - 外部 AI 不可用时返回本地 fallback 或可读错误状态。
- Chat 后端也增加本地回复 fallback，返回 `source` 和 `saved`，避免 AI 调用失败导致聊天流程中断。

### 3. 设备遥测后端兼容 BLE / CSV

- `POST /api/device/telemetry` 现在支持三类输入：
  - 标准 JSON 遥测。
  - BLE compact JSON。
  - `text/csv` / `text/plain` compact CSV。
- 新增 CSV 解析逻辑：
  - 支持 header + value 形式。
  - 支持固定字段顺序：`device_id,battery_pct,pet_bpm,lat,lon,lost_alert`。
- 新增 BLE payload 识别：
  - `source` / `transport` 包含 `ble`。
  - 或存在 `bat`、`alert`、`bleRssi`、`ble_rssi`、`bleName` 等字段。
- `deviceId` 解析范围扩展为：
  - `deviceId`
  - `deviceID`
  - `device_id`
  - `device`
  - `bleDeviceId`
  - `ble_device_id`
  - BLE compact `id`
- `batteryPct` 兼容 `bat`。
- `lostAlert` 兼容 `alert`。
- 遥测 metadata 新增：
  - `transport`
  - `bleConnected`
  - `bleRssi`
  - `bleMtu`
  - `bleName`
  - `bleServiceUuid`
  - `bleTelemetryUuid`
  - `bleMessageUuid`
  - `bleLastMessage`
  - `bleMessageSeq`
  - `bleBridgeReceivedAt`
  - `bleBridgeStoredBy`
  - `notifySeq`
- 返回给前端和 Glass Dashboard 的 telemetry row 映射增加 BLE 字段。

### 4. 地图瓦片代理和地图控制工具

- 后端新增 `GET /api/map/tile/:z/:x/:y.png`。
- 瓦片代理支持：
  - OpenStreetMap 主源。
  - OpenStreetMap `a` 子域 fallback。
  - CARTO light fallback。
  - 坐标合法性检查。
  - `8000ms` 上游超时。
  - `Cache-Control` 缓存头。
- `frontend/public/map.js` 新增真实地图工具层：
  - 前端优先请求 `/api/map/tile/{z}/{x}/{y}.png`。
  - 失败时 fallback 到 OSM 和 CARTO 外部瓦片。
  - 支持地图缩放，范围为 `-2` 到 `3`。
  - 支持双击放大。
  - 支持地图 resize 后重新投影 marker、pet 和 overlay。
- 新增电子围栏工具：
  - 开关围栏显示。
  - 每只宠物独立启停围栏。
  - 半径范围 `60m - 650m`。
  - 可用当前宠物位置作为围栏中心。
  - 可点击地图设置围栏中心。
  - 自动计算宠物到围栏中心距离和 alert 状态。
- 新增路线工具：
  - 显示 active route 或全部 route。
  - 从 vitals / telemetry history 生成路线。
  - 支持手动点击地图增加 GPS sample。
  - 支持清除和恢复单只宠物路线。
  - 本地偏好写入 `pawtrace_map_controls_v2`。
- 地图页新增快速入口：
  - `My Pets`
  - `Health`

### 5. 主 App BLE Web Bluetooth Bridge

- Health 页面新增 `Bluetooth Bridge` 卡片。
- 前端定义 BLE GATT contract：
  - Service UUID：`7b9f0001-6f3a-4f8a-9f4d-111111111111`
  - Telemetry UUID：`7b9f0002-6f3a-4f8a-9f4d-222222222222`
  - Message UUID：`7b9f0003-6f3a-4f8a-9f4d-333333333333`
- 支持浏览器：
  - Chrome 或 Edge。
  - `localhost` 或 HTTPS。
- 功能：
  - 扫描 `PawTrace-*` 设备。
  - 连接 BLE GATT service。
  - 订阅 telemetry notify。
  - 读取初始 telemetry value。
  - 将 BLE JSON / compact payload 标准化后 POST 到 `/api/device/telemetry`。
  - 将前端输入的消息写入 `Message UUID`。
  - 保存最近发送消息到后续 telemetry metadata 的 `bleLastMessage`。
  - 显示连接状态、设备名、已存储包数、最新 JSON payload 和存储结果。
- 未登录时仍可接收 BLE 包，但不会写入后端，会提示用户登录。

### 6. M5Stack 硬件示例代码

新增目录：

```text
hardware/m5stack/
```

新增 Wi-Fi HTTP 示例：

```text
hardware/m5stack/pawtrace_wifi_telemetry.ino
```

能力：

- 使用 `M5StickCPlus`、`WiFi` 和 `HTTPClient`。
- 配置 Wi-Fi SSID / password。
- 使用 Mac LAN IP 的 `/api/device/telemetry`。
- 通过 `x-device-token` 发送设备 token。
- 每 `5000ms` 上传一次 JSON。
- 上报 demo GPS、battery、GPS fix、satellite、HDOP、PPG placeholder、temperature、IMU activity、Wi-Fi RSSI 和 upload 状态。

新增 BLE GATT 示例：

```text
hardware/m5stack/pawtrace_ble_telemetry.ino
```

能力：

- 设备名 `PawTrace-001`。
- 创建 BLE GATT Server。
- Telemetry characteristic 支持 `READ + NOTIFY`。
- Message characteristic 支持 `READ + WRITE + WRITE_WITHOUT_RESPONSE`。
- `BLEDevice::setMTU(512)`。
- 每 `2000ms` 更新 telemetry JSON。
- 使用 IMU 加速度估算 `REST / WALK / RUN`。
- `BtnA` 映射 lost alert。
- 支持前端写入短消息或 JSON，并返回 message ack。
- telemetry JSON 包含 BLE UUID、last message、message seq、notify seq 和 message age。
- LCD 显示连接状态、seq、最近消息和 payload 摘要。

### 7. M5Stack 技术文档更新

`docs/pawtrace-m5stack-telemetry.md` 扩展为 Wi-Fi + BLE 双链路文档：

- 明确 BLE 是 near-field sync / provisioning，不是远距离 tracking 链路。
- 明确 Wi-Fi HTTP 是 remote upload / live map 链路。
- 补充 BLE interface contract。
- 补充 canonical BLE notify JSON。
- 补充 compact BLE JSON。
- 补充 compact CSV。
- 补充 Web Bluetooth 使用方法。
- 补充两个 Arduino 示例文件路径。
- 将本地 device token 示例统一为 `pawtrace-m5-dev-token`。
- 将当前本地测试 URL 示例更新为 `http://10.13.180.141:3000/api/device/telemetry`，并说明 IP 变更时需要替换。

### 8. My Pets 排版和输入逻辑

- `Pets` 页面结构改为：
  - `Community Pets`
  - `My Pets`
- My Pets 放在 Community Pets 下方，沿用之前的纵向排版。
- `pets-workspace` 改为纵向 flex 布局，移除 sticky My Pets 侧栏。
- My Pets 表单从占位符驱动改为 label 驱动。
- 表单新增 `novalidate` 和自定义错误提示区域 `pet-form-error`。
- 必填字段：
  - `Pet name`
  - `Species`
  - `Emergency contact`
- 输入逻辑：
  - 宠物名最大 `40` 字符。
  - species 最大 `32` 字符并提供 datalist：Dog、Cat、Rabbit、Bird、Reptile、Small pet、Other。
  - breed 最大 `50` 字符。
  - birthday / adoption date 设置 `max=today`，禁止未来日期。
  - status 最大 `80` 字符。
  - health notes 最大 `120` 字符。
  - location 最大 `80` 字符。
  - emergency contact 最大 `80` 字符，支持 phone / email / WeChat ID。
  - emergency care note 最大 `220` 字符。
  - personality traits 最大 `100` 字符。
- 提交前清洗输入：
  - 压缩多余空白。
  - traits 支持英文逗号、中文逗号、英文分号、中文分号分隔。
  - traits 去重并限制最多 `6` 个。
- 校验规则：
  - pet name 必须包含字母、数字或中文字符。
  - species 必须描述宠物类型，不能只含数字或符号。
  - birthday / adoption date 不能是未来日期。
  - emergency contact 不能为空且长度不能小于 `3`。
  - 图片必须是 image 类型。
  - 图片大小不能超过 `5MB`。
- 保存默认值改为更符合资料逻辑：
  - breed 默认 `Mixed / Unknown`。
  - status 默认 `{name} is ready for care tracking.`。
  - health 默认 `No known health notes.`。
  - traits 按 species 推断：cat 默认 `Curious`，dog 默认 `Friendly`，其他默认 `Care profile`。
- 宠物卡显示 `Birth/adoption`，不再只写 `Birthday`。
- 上报给 monitor 的 pet payload 增加 birthday、traits、nfcContact 和 nfcNote。

### 9. NFC Emergency Pet Card

- 前端新增 NFC deep link 解析：
  - query 参数：`nfc`、`pet`、`nfcId`
  - hash 参数同样支持：`#pets?nfc=...`
- NFC payload 使用 base64url JSON。
- deep link 场景下登录页自动隐藏，可用 guest session 直接打开紧急宠物卡。
- 支持生成和复制：
  - Emergency Card 文本。
  - NFC Link。
  - 当前 NFC deep link。
  - owner contact。
- 支持 contact 自动转换：
  - URL -> 直接打开。
  - email -> `mailto:`
  - phone-like -> `tel:`
- 宠物卡新增 public NFC 展示区，包括 owner、contact、care note、location 和 NFC code。

### 10. 移动端底部导航

- 移动端底部导航改为 6 个直接可见入口：
  - Map
  - Pets
  - Chat
  - Health
  - AI
  - Profile
- 移除旧 `More` 抽屉逻辑中的隐藏 tab 集合。
- AI 和 Profile 不再藏在 More 里，所有主要功能都可立即点击。
- label 在移动端始终显示。
- active tab 不再横向扩展，避免窄屏挤压。
- 底部 padding 增加，避免导航条遮挡页面内容。

### 11. AI Assist 信息架构调整

- 独立 `Video Behavior Check` tab 从主导航中移除。
- Video Behavior Check 合并进入 `AI Assist` 的 `Video` 模式。
- AI Assist 新增 Photo / Video segmented mode。
- 旧 `#behaviour` hash 会重定向到 `AI` tab 并切换到 video mode。
- AI Assist 顶部新增 AI status badge。
- Photo mode 包含图片检查、健康报告、饮食建议。
- Video mode 保留上传、检测结果、风险等级、timeline、events、advice、history compare。
- 图片预览逻辑改进：
  - 使用统一 `setPreviewImageSource()`。
  - 预览加载失败时提示 JPG / PNG。
  - loading 状态显式隐藏 result，防止重叠。
- AI 输出状态会展示 source label，例如 Qwen3.6、Qwen3.6 Vision 或 Local fallback。

### 12. 登录、隐私和 guest session

- 登录页和注册页新增 `Data & Privacy Agreement` consent checkbox。
- 登录、注册和 guest mode 都要求先勾选隐私协议。
- 新增 `privacy-agreement-modal`。
- Profile 中新增 `Data & Privacy Agreement` 按钮。
- 登录和注册 input 增加 autocomplete：
  - `username`
  - `current-password`
  - `new-password`
  - `name`
- guest session 不再写入持久 auth token。
- guest pet store、guest My Pets store、guest check-in store 使用内存隔离。
- guest session 不向 monitor collect 上报。
- `setCurrentUser(null)` 会清空 guest 内存状态。

### 13. Profile、Chat 和图像处理修复

- Profile 顶部新增快捷按钮：
  - `Edit Profile`
  - `Pets`
- Profile 侧栏保留 Edit Profile，并新增 Privacy Agreement。
- `Pet Behavior Insight` 文案改为 `Care Insight`，减少过窄行为诊断表述。
- Chat mobile contacts toggle 保留 icon 和 span，不再用 `textContent` 破坏按钮结构。
- Chat avatar 去掉空 `src`，避免浏览器无意义请求。
- 图片预览和头像更新统一走 `setPreviewImageSource()`，避免空 src、fallback 残留和预览状态不一致。
- Share image modal 同步清理 camera input。

### 14. Health 页面遥测展示扩展

- Health 页面新增快捷按钮：
  - `Add Reading`
  - `Map`
- Health metric grid 固定两列移动端布局，减少截图中的错位风险。
- 新增 `health-manual-card`，让快捷按钮可滚动到手动输入区。
- Health 读取并展示 BLE telemetry：
  - BLE connected
  - BLE RSSI
  - BLE MTU
  - notify seq
  - BLE source / transport
- Health 状态会区分 `BLE sync`、`Wi-Fi HTTP`、`M5Stack` 和 `Manual`。
- BLE packet 也会进入 vitals history、pet status、battery、activity、GPS 和 Health Monitor 视图。

### 15. Glass Dashboard BLE 扩展

- `pawtrace-glass/src/App.tsx` 增加 BLE telemetry 类型字段：
  - `source`
  - `transport`
  - `bleConnected`
  - `bleRssi`
  - `bleMtu`
  - `notifySeq`
- 新增 `demoBlePacket`。
- Dashboard 顶部提供：
  - `Send demo Wi-Fi packet`
  - `Send demo BLE packet`
- GPS 逻辑支持 BLE：
  - Wi-Fi telemetry 仍要求 GPS fix。
  - BLE telemetry 只要坐标有效且 location flag 未明确 false，即可显示 live coordinate lock。
- 设备状态显示 link source：
  - `BLE sync`
  - `Wi-Fi HTTP`
  - `M5Stack`
- 历史表格最后一列从 `Wi-Fi / upload` 改为 `Link / upload`。
- BLE 行显示 RSSI；Wi-Fi 行显示 HTTP upload code。
- Raw packet 标题根据最新包来源切换 `BLE JSON payload` 或 `Wi-Fi JSON payload`。

### 16. Monitor 小修

- `monitor/index.html` 新增内联 SVG favicon。
- `hero-grid` 和 `section-grid` 增加 `align-items: start`，减少卡片高度拉伸。
- `.chart-frame[hidden]` 明确 `display: none`。
- `.chart-frame > canvas` 明确 block、宽高 100%，提升图表渲染稳定性。

### 17. iOS、Vite 和品牌统一

- 页面标题和主要品牌文案统一为 `PAWTRACE`。
- iOS `CFBundleDisplayName` 改为 `PAWTRACE`。
- 前端 Vite dev server 增加 allowed hosts：
  - `.ngrok-free.dev`
  - `.ngrok-free.app`
- 主站新增 favicon `/assets/1.png`。

### 18. 文档和仓库清理

- 删除旧的单版本 8.2.0 到 8.9.0 文档：
  - `plans/plans/pawtrace-8.2.0.md`
  - `plans/plans/pawtrace-8.3.0.md`
  - `plans/plans/pawtrace-8.4.0.md`
  - `plans/plans/pawtrace-8.5.0.md`
  - `plans/plans/pawtrace-8.6.0.md`
  - `plans/plans/pawtrace-8.7.0.md`
  - `plans/plans/pawtrace-8.8.0.md`
  - `plans/plans/pawtrace-8.9.0.md`
- 8.2.0 - 8.9.0 的版本叙事保留在合并包：
  - `plans/plans/pawtrace-8.2.0-8.9.0.md`
- 删除 6.0.0 旧 Glass Dashboard 截图产物：
  - `plans/images/6.0.0/pawtrace-glass-dashboard-desktop-crop.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-desktop.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-detail.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-mobile.png`

## API 变更汇总

| API | 变更 |
| --- | --- |
| `GET /api/status` | 增加 AI 和 Video AI 状态 |
| `GET /api/ai/status` | 新增 AI 配置状态接口 |
| `POST /api/pet-prediction` | 支持 Qwen 或 local fallback，返回 source |
| `POST /api/ai/qwen-advice` | 支持 Qwen 或 local fallback，返回 source / warning |
| `POST /api/ai/gemini-advice` | 保留兼容路径，内部走同一 advice 逻辑 |
| `POST /api/ai/qwen-diagnosis` | 支持 Qwen Vision、Qwen text fallback 或 local fallback |
| `POST /api/ai/gemini-diagnosis` | 保留兼容路径，内部走同一 diagnosis 逻辑 |
| `POST /api/ai/video-behavior` | 保留上传分析路径，演示可立即进入失败可读状态 |
| `POST /api/chat` | AI 失败时返回 local fallback，不再直接 500 |
| `GET /api/map/tile/:z/:x/:y.png` | 新增地图瓦片代理 |
| `POST /api/device/telemetry` | 支持 Wi-Fi JSON、BLE JSON、compact JSON 和 compact CSV |
| `GET /api/device/telemetry/latest` | 返回 BLE metadata 字段 |
| `GET /api/device/telemetry/history` | 返回 BLE metadata 字段 |

## 环境变量变更

| 变量 | 9.0.0 状态 |
| --- | --- |
| `DASHSCOPE_API_KEY` | 保留；未配置时 AI 使用 local fallback |
| `DASHSCOPE_BASE_URL` | 新增，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `QWEN_TEXT_MODEL` | 新增，默认 `qwen3.6-plus` |
| `QWEN_VISION_MODEL` | 新增，默认 `qwen3.6-plus` |
| `QWEN_ENABLE_THINKING` | 新增，`true` 时向 DashScope 传 `enable_thinking` |
| `AI_TIMEOUT_MS` | 示例值更新为 `60000` |
| `DEVICE_INGEST_TOKEN` | 示例值更新为 `pawtrace-m5-dev-token` |
| `DEVICE_DEFAULT_USER` | 保留，默认 `demo` |
| `VIDEO_AI_URL` | 保留，用于 Video Behavior Check |

## BLE GATT 合约

```text
Device name:         PawTrace-001
Service UUID:        7b9f0001-6f3a-4f8a-9f4d-111111111111
Telemetry UUID:      7b9f0002-6f3a-4f8a-9f4d-222222222222
Telemetry property:  READ + NOTIFY
Message UUID:        7b9f0003-6f3a-4f8a-9f4d-333333333333
Message property:    READ + WRITE + WRITE_WITHOUT_RESPONSE
```

推荐 BLE notify JSON：

```json
{
  "device_id": "pawtrace_001",
  "source": "m5stickc-plus-ble",
  "transport": "ble",
  "battery_pct": 82,
  "pet_bpm": 92,
  "lat": 31.2983,
  "lon": 120.5853,
  "location_valid": true,
  "gps_fix": 1,
  "lost_alert": false,
  "ble_rssi": -58,
  "ble_mtu": 185,
  "ble_message_uuid": "7b9f0003-6f3a-4f8a-9f4d-333333333333",
  "ble_last_message": "hello from web bridge",
  "ble_message_seq": 1
}
```

compact CSV：

```text
pawtrace_001,82,92,31.2983,120.5853,0
```

## 主要影响文件

### 后端

- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/config.ts`
- `backend/src/registerRoutes.ts`
- `backend/src/services/aiService.ts`
- `.env.example`
- `backend/.env.example`

### 主 App

- `frontend/index.html`
- `frontend/public/app/app.js`
- `frontend/public/app/style.tailwind.css`
- `frontend/public/app/app.css`
- `frontend/public/map.js`
- `frontend/vite.config.ts`
- `frontend/ios/App/App/Info.plist`

### 硬件

- `hardware/m5stack/pawtrace_wifi_telemetry.ino`
- `hardware/m5stack/pawtrace_ble_telemetry.ino`

### Dashboard / Monitor

- `pawtrace-glass/src/App.tsx`
- `monitor/index.html`

### 文档与计划

- `docs/pawtrace-m5stack-telemetry.md`
- `plans/plans/pawtrace-9.0.0.md`
- `plans/plans/pawtrace-8.2.0-8.9.0.md`

## 验证状态

已执行并通过：

```bash
npm run build
```

该命令覆盖：

- `npm run build --prefix frontend`
- `npm run build --prefix pawtrace-glass`
- `npm run build --prefix backend`

此前针对最新 UI 和表单修正也已执行：

```bash
node --check frontend/public/app/app.js
npm run build --prefix frontend
git diff --check -- frontend/index.html frontend/public/app/app.js frontend/public/app/style.tailwind.css frontend/public/app/app.css
```

手动/脚本验证内容：

- My Pets 表单关键校验标记存在。
- 移动端底部导航包含 `map,pets,chat,health,ai,profile` 六个直接入口。
- 本地 Vite 服务 `http://127.0.0.1:5173/` 返回 `200 OK`。
- 后端接收过模拟 BLE/GPS telemetry 包，并确认写入 LocationPoint 和 BLE metadata 后清理测试数据。

## 已知限制和剩余风险

- GitHub 推送未完成：本地提交 `b212ebe` 已创建，但远端推送被 GitHub HTTPS token 和 SSH public key 认证拦截。
- BLE Web Bluetooth 只在 Chrome / Edge 的 localhost 或 HTTPS 下可用；Safari 不支持该路径。
- BLE 是近场同步，不适合替代远程追踪；远程位置仍应使用 Wi-Fi HTTP 或移动网络上传。
- Arduino 示例中的 GPS、BPM、SpO2 和 temperature 仍包含 demo / placeholder 值，需要接入真实 GPS v1.1 和 Heart Rate HAT 解析后才能作为完整硬件链路。
- `DEVICE_INGEST_TOKEN=pawtrace-m5-dev-token` 是开发示例，生产环境必须替换。
- AI local fallback 适合演示和容错，不等价于真实 Qwen 结果。
- 图像和视频健康/行为分析仍是观察辅助，不构成兽医诊断。
- 地图瓦片代理依赖外部 OSM / CARTO 服务，生产部署应遵守对应服务的 tile usage policy。

## 发布前检查清单

- 重新配置 GitHub 认证并推送当前分支。
- 生产环境替换 `JWT_SECRET`、`DEVICE_INGEST_TOKEN`、`DASHSCOPE_API_KEY`、`CORS_ORIGIN` 和必要的 Video AI 地址。
- 使用 `hardware/m5stack/pawtrace_wifi_telemetry.ino` 发送一条 Wi-Fi packet。
- 使用 `hardware/m5stack/pawtrace_ble_telemetry.ino` 连接 Web Bluetooth bridge，发送消息并接收 notify packet。
- 打开主 App `Health -> Bluetooth Bridge`，确认 BLE 连接、发送消息、payload 展示和后端存储状态。
- 打开主 App `Map`，确认 zoom、fence、route、manual GPS sample、clear / restore 可用。
- 打开主 App `Pets`，确认 Community Pets 在上、My Pets 在下，表单校验生效。
- 打开移动视口，确认底部六入口导航不遮挡内容。
- 打开 `pawtrace-glass`，分别发送 Wi-Fi demo packet 和 BLE demo packet。
- 打开 Monitor，确认图表 canvas 正常显示。
- 再次运行 `npm run build`。

## 结论

9.0.0 是 PawTrace 的硬件与产品可用性收口版本。它把 BLE 近场同步、Wi-Fi 远程上传、后端 telemetry 标准化、地图围栏路线、Health BLE Bridge、AI fallback、NFC emergency card、My Pets 输入校验和移动端直接导航整合到同一个可演示技术包中。当前代码已在本地构建通过，下一步是完成 GitHub 认证并推送本地提交。

---

# PawTrace 9.0.0 Technical Update Document

## Release Positioning

- **Version**: 9.0.0
- **Release type**: Major technical release covering hardware telemetry, Bluetooth bridge, AI availability, map tools, mobile navigation, and logical pet-profile input.
- **Local commit**: `b212ebe Upload latest PawTrace changes`
- **Current branch**: `codex/8.1.0-security-packaging-release`
- **Publish state**: committed locally; GitHub upload is still blocked until HTTPS token, SSH key, or `gh auth login` is restored.
- **Primary goal**: make PawTrace immediately demoable even when external AI services or long-range hardware links are unavailable, while preserving real integration paths for Wi-Fi, BLE, GPS, Health, AI, Map, and Pet Cards.

## One-Sentence Summary

PawTrace 9.0.0 moves the project beyond the 8.x hardware telemetry and dashboard phase into a more complete demo-ready technical package: the main app supports near-field Web Bluetooth sync and message writes, the backend accepts Wi-Fi JSON, BLE JSON, and BLE CSV telemetry, the map supports zoom, geofences, and route overlays, AI Assist has local fallback when DashScope is not configured, the mobile bottom navigation exposes every major feature directly, and My Pets now uses validated logical pet-profile input.

## Major Technical Changes

### 1. Backend AI Service Upgrade

- Added the `openai` dependency and now use the OpenAI-compatible SDK for DashScope requests.
- Added backend config keys:
  - `DASHSCOPE_BASE_URL`
  - `QWEN_TEXT_MODEL`
  - `QWEN_VISION_MODEL`
  - `QWEN_ENABLE_THINKING`
- The default Qwen text and vision model is now `qwen3.6-plus`.
- Example AI timeout is increased to `60000ms`.
- `backend/src/services/aiService.ts` now uses an SDK client instead of handwritten `fetch` calls.
- Added `hasDashScopeKey()` so both backend and frontend can determine whether real Qwen service is available.
- Added local fallback functions:
  - `getLocalAdvice()` for health, behavior, and diet advice.
  - `getLocalDiagnosis()` for photo-care diagnosis fallback.
  - Existing pet-prediction fallback remains available.
- AI responses now include a `source` field such as `qwen`, `qwen-vl`, `qwen-text-fallback`, or `local`.
- Qwen failures now return readable fallback content and a `warning` instead of leaving the UI in a hard failure state.

### 2. AI API Availability and Status

- Added `GET /api/ai/status`, returning:
  - whether DashScope is configured
  - text model
  - vision model
  - thinking mode
  - AI timeout
- Extended `GET /api/status` with AI and Video AI status.
- These routes now support an immediately usable demo path:
  - `POST /api/pet-prediction`
  - `POST /api/ai/qwen-advice`
  - `POST /api/ai/qwen-diagnosis`
  - `POST /api/ai/video-behavior`
- When external AI is available, PawTrace calls Qwen or Video AI.
- When external AI is unavailable, PawTrace returns local fallback or a readable service state.
- Chat backend now has local reply fallback and returns `source` plus `saved`, preventing a failed AI request from breaking the chat flow.

### 3. Device Telemetry Backend: BLE and CSV Compatibility

- `POST /api/device/telemetry` now accepts:
  - standard JSON telemetry
  - BLE compact JSON
  - `text/csv` / `text/plain` compact CSV
- CSV parsing supports:
  - header + value format
  - fixed order: `device_id,battery_pct,pet_bpm,lat,lon,lost_alert`
- BLE detection now checks:
  - `source` / `transport` containing `ble`
  - compact fields such as `bat`, `alert`, `bleRssi`, `ble_rssi`, `bleName`
- Device ID parsing now supports:
  - `deviceId`
  - `deviceID`
  - `device_id`
  - `device`
  - `bleDeviceId`
  - `ble_device_id`
  - BLE compact `id`
- Battery percentage accepts `bat`.
- Lost alert accepts `alert`.
- Telemetry metadata now includes:
  - `transport`
  - `bleConnected`
  - `bleRssi`
  - `bleMtu`
  - `bleName`
  - `bleServiceUuid`
  - `bleTelemetryUuid`
  - `bleMessageUuid`
  - `bleLastMessage`
  - `bleMessageSeq`
  - `bleBridgeReceivedAt`
  - `bleBridgeStoredBy`
  - `notifySeq`
- Telemetry rows returned to the frontend and Glass Dashboard now include BLE metadata.

### 4. Map Tile Proxy and Map Control Tools

- Added backend route `GET /api/map/tile/:z/:x/:y.png`.
- The tile proxy supports:
  - primary OpenStreetMap source
  - OpenStreetMap `a` subdomain fallback
  - CARTO light fallback
  - coordinate validation
  - `8000ms` upstream timeout
  - cache headers
- `frontend/public/map.js` now has a richer real-map control layer:
  - frontend first requests `/api/map/tile/{z}/{x}/{y}.png`
  - falls back to OSM and CARTO external tiles
  - supports map zoom from `-2` to `3`
  - supports double-click zoom
  - reprojects markers, pets, and overlays on resize
- Added electronic fence tools:
  - show/hide fence overlay
  - enable/disable fence per pet
  - radius range from `60m` to `650m`
  - use the current pet location as fence center
  - click the map to set fence center
  - calculate pet distance from center and alert state
- Added route tools:
  - active route or all routes
  - route generation from vitals / telemetry history
  - manual GPS sample placement by clicking the map
  - clear and restore route per pet
  - preferences stored in `pawtrace_map_controls_v2`
- Map page now includes direct actions for `My Pets` and `Health`.

### 5. Main App Web Bluetooth Bridge

- Health page now includes a `Bluetooth Bridge` card.
- Frontend BLE GATT contract:
  - Service UUID: `7b9f0001-6f3a-4f8a-9f4d-111111111111`
  - Telemetry UUID: `7b9f0002-6f3a-4f8a-9f4d-222222222222`
  - Message UUID: `7b9f0003-6f3a-4f8a-9f4d-333333333333`
- Supported browsers:
  - Chrome or Edge
  - `localhost` or HTTPS
- Capabilities:
  - scan `PawTrace-*` devices
  - connect to BLE GATT service
  - subscribe to telemetry notifications
  - read initial telemetry value
  - normalize BLE JSON / compact payload and POST it to `/api/device/telemetry`
  - write frontend messages to `Message UUID`
  - store the most recent sent message as `bleLastMessage`
  - show connection state, device name, stored packet count, latest JSON payload, and storage status
- When the user is not signed in, BLE packets can still be received locally but are not stored to the backend.

### 6. M5Stack Hardware Example Code

New directory:

```text
hardware/m5stack/
```

New Wi-Fi HTTP sketch:

```text
hardware/m5stack/pawtrace_wifi_telemetry.ino
```

Capabilities:

- Uses `M5StickCPlus`, `WiFi`, and `HTTPClient`.
- Configurable Wi-Fi SSID and password.
- Sends telemetry to the Mac LAN IP `/api/device/telemetry`.
- Uses `x-device-token`.
- Uploads JSON every `5000ms`.
- Sends demo GPS, battery, GPS fix, satellite, HDOP, PPG placeholder, temperature, IMU activity, Wi-Fi RSSI, and upload state.

New BLE GATT sketch:

```text
hardware/m5stack/pawtrace_ble_telemetry.ino
```

Capabilities:

- Device name `PawTrace-001`.
- Creates BLE GATT Server.
- Telemetry characteristic supports `READ + NOTIFY`.
- Message characteristic supports `READ + WRITE + WRITE_WITHOUT_RESPONSE`.
- Uses `BLEDevice::setMTU(512)`.
- Updates telemetry JSON every `2000ms`.
- Uses IMU acceleration to estimate `REST / WALK / RUN`.
- Maps `BtnA` to lost alert.
- Supports frontend text or JSON writes and returns a message ack.
- Telemetry JSON includes BLE UUIDs, last message, message sequence, notify sequence, and message age.
- LCD displays connection state, sequence, last message, and payload summary.

### 7. M5Stack Technical Documentation Update

`docs/pawtrace-m5stack-telemetry.md` is expanded into a Wi-Fi + BLE dual-link document:

- BLE is defined as near-field sync / provisioning, not long-range tracking.
- Wi-Fi HTTP is defined as the remote upload / live map path.
- Added BLE interface contract.
- Added canonical BLE notify JSON.
- Added compact BLE JSON.
- Added compact CSV.
- Added Web Bluetooth usage instructions.
- Added both Arduino sketch paths.
- Standardized local device token examples as `pawtrace-m5-dev-token`.
- Updated local test URL example to `http://10.13.180.141:3000/api/device/telemetry`, with a note to replace the LAN IP when it changes.

### 8. My Pets Layout and Logical Input

- `Pets` page order is now:
  - `Community Pets`
  - `My Pets`
- My Pets is placed below Community Pets using the previous vertical layout.
- `pets-workspace` is now a vertical flex layout; the sticky My Pets side panel was removed.
- The My Pets form is now label-driven instead of placeholder-driven.
- The form uses `novalidate` and a custom `pet-form-error` alert area.
- Required fields:
  - `Pet name`
  - `Species`
  - `Emergency contact`
- Input constraints:
  - pet name max `40`
  - species max `32` with datalist options: Dog, Cat, Rabbit, Bird, Reptile, Small pet, Other
  - breed max `50`
  - birthday / adoption date has `max=today`
  - status max `80`
  - health notes max `120`
  - location max `80`
  - emergency contact max `80`, accepting phone / email / WeChat ID
  - emergency care note max `220`
  - personality traits max `100`
- Submit-time normalization:
  - collapses whitespace
  - traits support English comma, Chinese comma, English semicolon, and Chinese semicolon
  - traits are deduplicated and capped at `6`
- Validation:
  - pet name must include a letter, number, or Chinese character
  - species must describe the pet type and cannot be only symbols or numbers
  - birthday / adoption date cannot be in the future
  - emergency contact is required and must be at least `3` characters
  - image must be an image file
  - image size must be under `5MB`
- Save defaults are now more logical:
  - breed defaults to `Mixed / Unknown`
  - status defaults to `{name} is ready for care tracking.`
  - health defaults to `No known health notes.`
  - traits are inferred from species: cat -> `Curious`, dog -> `Friendly`, other -> `Care profile`
- Pet card label changed to `Birth/adoption`.
- Monitor pet payload now includes birthday, traits, nfcContact, and nfcNote.

### 9. NFC Emergency Pet Card

- Frontend now parses NFC deep links:
  - query parameters: `nfc`, `pet`, `nfcId`
  - hash parameters such as `#pets?nfc=...`
- NFC payload uses base64url JSON.
- In deep-link scenarios, the login page is hidden and guest session can view the emergency pet card directly.
- Supports copying:
  - Emergency Card text
  - NFC Link
  - current NFC deep link
  - owner contact
- Contact conversion:
  - URL -> direct link
  - email -> `mailto:`
  - phone-like value -> `tel:`
- Public NFC card shows owner, contact, care note, location, and NFC code.

### 10. Mobile Bottom Navigation

- Mobile bottom nav now has 6 directly visible entries:
  - Map
  - Pets
  - Chat
  - Health
  - AI
  - Profile
- Removed the old hidden More-tab set.
- AI and Profile are no longer hidden behind More.
- Labels are always visible on mobile.
- Active tab no longer expands horizontally, reducing narrow-screen crowding.
- Bottom padding was increased so the fixed navigation does not cover page content.

### 11. AI Assist Information Architecture

- The standalone `Video Behavior Check` tab was removed from the main navigation.
- Video Behavior Check now lives inside `AI Assist` as `Video` mode.
- AI Assist now has a Photo / Video segmented mode switch.
- Legacy `#behaviour` hash redirects to the AI tab and switches to video mode.
- AI Assist header now includes an AI status badge.
- Photo mode includes photo checks, health reports, and diet guidance.
- Video mode keeps upload, detection result, risk level, timeline, events, advice, and history compare.
- Image preview logic was improved:
  - uses shared `setPreviewImageSource()`
  - shows JPG / PNG guidance when preview fails
  - loading state explicitly hides results to prevent overlap
- AI output status now shows source labels such as Qwen3.6, Qwen3.6 Vision, or Local fallback.

### 12. Login, Privacy, and Guest Session

- Login and register pages now include a `Data & Privacy Agreement` consent checkbox.
- Login, register, and guest mode all require privacy agreement consent.
- Added `privacy-agreement-modal`.
- Profile page includes a `Data & Privacy Agreement` button.
- Auth inputs now include autocomplete:
  - `username`
  - `current-password`
  - `new-password`
  - `name`
- Guest session no longer writes a persistent auth token.
- Guest pet store, guest My Pets store, and guest check-in store are isolated in memory.
- Guest session does not send monitor collect events.
- `setCurrentUser(null)` clears guest memory state.

### 13. Profile, Chat, and Image Handling Fixes

- Profile header now has quick actions:
  - `Edit Profile`
  - `Pets`
- Profile side actions still include Edit Profile and now include Privacy Agreement.
- `Pet Behavior Insight` was renamed to `Care Insight`.
- Chat mobile contacts toggle now keeps its icon and span structure instead of replacing the whole button text.
- Chat avatar no longer uses an empty `src`, preventing unnecessary browser requests.
- Image preview and avatar updates now use `setPreviewImageSource()` consistently.
- Share Image modal now clears the camera input as well.

### 14. Health Page Telemetry Expansion

- Health page now has quick actions:
  - `Add Reading`
  - `Map`
- Health metric grid uses a fixed two-column mobile layout.
- Added `health-manual-card` so the quick action can scroll to manual input.
- Health now reads and displays BLE telemetry:
  - BLE connected
  - BLE RSSI
  - BLE MTU
  - notify sequence
  - BLE source / transport
- Health status distinguishes `BLE sync`, `Wi-Fi HTTP`, `M5Stack`, and `Manual`.
- BLE packets enter vitals history, pet status, battery, activity, GPS, and Health Monitor views.

### 15. Glass Dashboard BLE Extension

- `pawtrace-glass/src/App.tsx` added BLE telemetry fields:
  - `source`
  - `transport`
  - `bleConnected`
  - `bleRssi`
  - `bleMtu`
  - `notifySeq`
- Added `demoBlePacket`.
- Dashboard top actions now include:
  - `Send demo Wi-Fi packet`
  - `Send demo BLE packet`
- GPS logic now supports BLE:
  - Wi-Fi telemetry still respects GPS fix.
  - BLE telemetry can show live coordinate lock when coordinates are valid and location flag is not explicitly false.
- Device status now shows link source:
  - `BLE sync`
  - `Wi-Fi HTTP`
  - `M5Stack`
- History table column changed from `Wi-Fi / upload` to `Link / upload`.
- BLE rows show RSSI; Wi-Fi rows show HTTP upload code.
- Raw packet title switches between `BLE JSON payload` and `Wi-Fi JSON payload`.

### 16. Monitor Fixes

- `monitor/index.html` now has an inline SVG favicon.
- `hero-grid` and `section-grid` use `align-items: start`.
- `.chart-frame[hidden]` explicitly uses `display: none`.
- `.chart-frame > canvas` explicitly uses block layout and 100% width / height for more stable chart rendering.

### 17. iOS, Vite, and Branding

- Page title and primary brand copy are standardized as `PAWTRACE`.
- iOS `CFBundleDisplayName` is now `PAWTRACE`.
- Frontend Vite dev server allows:
  - `.ngrok-free.dev`
  - `.ngrok-free.app`
- Main site now has favicon `/assets/1.png`.

### 18. Documentation and Repository Cleanup

- Removed old individual 8.2.0 through 8.9.0 documents:
  - `plans/plans/pawtrace-8.2.0.md`
  - `plans/plans/pawtrace-8.3.0.md`
  - `plans/plans/pawtrace-8.4.0.md`
  - `plans/plans/pawtrace-8.5.0.md`
  - `plans/plans/pawtrace-8.6.0.md`
  - `plans/plans/pawtrace-8.7.0.md`
  - `plans/plans/pawtrace-8.8.0.md`
  - `plans/plans/pawtrace-8.9.0.md`
- The 8.2.0 - 8.9.0 release narrative remains in:
  - `plans/plans/pawtrace-8.2.0-8.9.0.md`
- Removed old 6.0.0 Glass Dashboard image artifacts:
  - `plans/images/6.0.0/pawtrace-glass-dashboard-desktop-crop.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-desktop.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-detail.png`
  - `plans/images/6.0.0/pawtrace-glass-dashboard-mobile.png`

## API Change Summary

| API | Change |
| --- | --- |
| `GET /api/status` | Adds AI and Video AI status |
| `GET /api/ai/status` | New AI configuration status endpoint |
| `POST /api/pet-prediction` | Supports Qwen or local fallback and returns source |
| `POST /api/ai/qwen-advice` | Supports Qwen or local fallback and returns source / warning |
| `POST /api/ai/gemini-advice` | Compatibility route using the same advice logic |
| `POST /api/ai/qwen-diagnosis` | Supports Qwen Vision, Qwen text fallback, or local fallback |
| `POST /api/ai/gemini-diagnosis` | Compatibility route using the same diagnosis logic |
| `POST /api/ai/video-behavior` | Keeps upload analysis path with readable demo failure states |
| `POST /api/chat` | Returns local fallback instead of hard 500 when AI fails |
| `GET /api/map/tile/:z/:x/:y.png` | New map tile proxy |
| `POST /api/device/telemetry` | Supports Wi-Fi JSON, BLE JSON, compact JSON, and compact CSV |
| `GET /api/device/telemetry/latest` | Returns BLE metadata fields |
| `GET /api/device/telemetry/history` | Returns BLE metadata fields |

## Environment Variable Changes

| Variable | 9.0.0 State |
| --- | --- |
| `DASHSCOPE_API_KEY` | Kept; AI uses local fallback when absent |
| `DASHSCOPE_BASE_URL` | New, default `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `QWEN_TEXT_MODEL` | New, default `qwen3.6-plus` |
| `QWEN_VISION_MODEL` | New, default `qwen3.6-plus` |
| `QWEN_ENABLE_THINKING` | New; when `true`, passes `enable_thinking` to DashScope |
| `AI_TIMEOUT_MS` | Example value updated to `60000` |
| `DEVICE_INGEST_TOKEN` | Example value updated to `pawtrace-m5-dev-token` |
| `DEVICE_DEFAULT_USER` | Kept, default `demo` |
| `VIDEO_AI_URL` | Kept for Video Behavior Check |

## BLE GATT Contract

```text
Device name:         PawTrace-001
Service UUID:        7b9f0001-6f3a-4f8a-9f4d-111111111111
Telemetry UUID:      7b9f0002-6f3a-4f8a-9f4d-222222222222
Telemetry property:  READ + NOTIFY
Message UUID:        7b9f0003-6f3a-4f8a-9f4d-333333333333
Message property:    READ + WRITE + WRITE_WITHOUT_RESPONSE
```

Recommended BLE notify JSON:

```json
{
  "device_id": "pawtrace_001",
  "source": "m5stickc-plus-ble",
  "transport": "ble",
  "battery_pct": 82,
  "pet_bpm": 92,
  "lat": 31.2983,
  "lon": 120.5853,
  "location_valid": true,
  "gps_fix": 1,
  "lost_alert": false,
  "ble_rssi": -58,
  "ble_mtu": 185,
  "ble_message_uuid": "7b9f0003-6f3a-4f8a-9f4d-333333333333",
  "ble_last_message": "hello from web bridge",
  "ble_message_seq": 1
}
```

Compact CSV:

```text
pawtrace_001,82,92,31.2983,120.5853,0
```

## Key Impacted Files

### Backend

- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/config.ts`
- `backend/src/registerRoutes.ts`
- `backend/src/services/aiService.ts`
- `.env.example`
- `backend/.env.example`

### Main App

- `frontend/index.html`
- `frontend/public/app/app.js`
- `frontend/public/app/style.tailwind.css`
- `frontend/public/app/app.css`
- `frontend/public/map.js`
- `frontend/vite.config.ts`
- `frontend/ios/App/App/Info.plist`

### Hardware

- `hardware/m5stack/pawtrace_wifi_telemetry.ino`
- `hardware/m5stack/pawtrace_ble_telemetry.ino`

### Dashboard / Monitor

- `pawtrace-glass/src/App.tsx`
- `monitor/index.html`

### Documentation and Plans

- `docs/pawtrace-m5stack-telemetry.md`
- `plans/plans/pawtrace-9.0.0.md`
- `plans/plans/pawtrace-8.2.0-8.9.0.md`

## Verification Status

Passed:

```bash
npm run build
```

This covers:

- `npm run build --prefix frontend`
- `npm run build --prefix pawtrace-glass`
- `npm run build --prefix backend`

Previous targeted checks also passed:

```bash
node --check frontend/public/app/app.js
npm run build --prefix frontend
git diff --check -- frontend/index.html frontend/public/app/app.js frontend/public/app/style.tailwind.css frontend/public/app/app.css
```

Manual / scripted verification:

- My Pets form validation markers exist.
- Mobile bottom nav contains six direct entries: `map,pets,chat,health,ai,profile`.
- Local Vite service at `http://127.0.0.1:5173/` returns `200 OK`.
- Backend accepted a simulated BLE/GPS telemetry packet, verified LocationPoint and BLE metadata storage, then test data was cleaned up.

## Known Limitations and Remaining Risks

- GitHub push is not complete: local commit `b212ebe` exists, but remote push was blocked by GitHub HTTPS token and SSH public key authentication.
- Web Bluetooth only works in Chrome / Edge on localhost or HTTPS; Safari does not support this path.
- BLE is near-field sync and should not replace remote tracking; remote location should still use Wi-Fi HTTP or mobile-network upload.
- Arduino examples still contain demo / placeholder GPS, BPM, SpO2, and temperature values until real GPS v1.1 and Heart Rate HAT parsing is wired in.
- `DEVICE_INGEST_TOKEN=pawtrace-m5-dev-token` is a development example and must be replaced in production.
- AI local fallback is for demo and resilience; it is not equivalent to real Qwen output.
- Image and video health / behavior analysis remains observation support only and is not veterinary diagnosis.
- The map tile proxy depends on external OSM / CARTO services; production deployment must follow the tile usage policies.

## Pre-Release Checklist

- Restore GitHub authentication and push the current branch.
- Replace production `JWT_SECRET`, `DEVICE_INGEST_TOKEN`, `DASHSCOPE_API_KEY`, `CORS_ORIGIN`, and Video AI URL as needed.
- Send one Wi-Fi packet using `hardware/m5stack/pawtrace_wifi_telemetry.ino`.
- Connect `hardware/m5stack/pawtrace_ble_telemetry.ino` to Web Bluetooth, send a message, and receive notify packets.
- Open main App `Health -> Bluetooth Bridge` and confirm BLE connection, message write, payload display, and backend storage.
- Open main App `Map` and confirm zoom, fence, route, manual GPS sample, clear, and restore.
- Open main App `Pets` and confirm Community Pets appears above My Pets and form validation works.
- Open mobile viewport and confirm the six-entry bottom navigation does not cover content.
- Open `pawtrace-glass` and send both Wi-Fi and BLE demo packets.
- Open Monitor and confirm chart canvas rendering.
- Run `npm run build` again.

## Conclusion

PawTrace 9.0.0 is the hardware and product-availability consolidation release. It combines BLE near-field sync, Wi-Fi remote upload, backend telemetry normalization, map geofence and route tooling, Health BLE Bridge, AI fallback, NFC emergency cards, My Pets input validation, and direct mobile navigation into one demo-ready technical package. The code builds locally; the next operational step is restoring GitHub authentication and pushing the local commits.
