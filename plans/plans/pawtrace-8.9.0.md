---
name: pawtrace-8-9-0-docs-env-release-readiness
version: 8.9.0
type: minor
status: local-draft
---

# PawTrace 8.9.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：8.x 文档、环境变量与交付说明收口

## 新增

- 新增 `docs/pawtrace-m5stack-telemetry.md`，记录 M5StickC Plus 原型定位、硬件结构、数据路径、后端配置、payload 示例、真实地图显示和本地 curl 测试。
- 新增 `plans/plans/pawtrace-8.2.0-8.9.0.md`，将 8.2.0 到 8.9.0 的设备遥测、实时地图、Glass Dashboard、Monitor、Video Behavior Check 和交付文档更新打包成合并发布说明。
- README 补充 M5Stack telemetry、`DEVICE_INGEST_TOKEN`、设备上报接口和主 App 数据合并说明。
- 环境变量样例补充 `DEVICE_INGEST_TOKEN` 和 `DEVICE_DEFAULT_USER`。

## 改进

- 将 8.x 版本能力按发布粒度拆分，便于后续打 tag、写 GitHub Release 和答辩汇报。
- 明确硬件原型边界：M5StickC Plus 适合 prototype，不应被描述为最终量产硬件。
- 明确 Heart Rate HAT 的 PPG 读数是 proof-of-concept physiological sensing，不作为可靠宠物医学测量。

## 主要影响文件

- `README.txt`
- `.env.example`
- `backend/.env.example`
- `docs/pawtrace-m5stack-telemetry.md`
- `plans/plans/pawtrace-8.2.0-8.9.0.md`
