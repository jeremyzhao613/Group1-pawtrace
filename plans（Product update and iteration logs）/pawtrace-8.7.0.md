---
name: pawtrace-8-7-0-monitor-collection-customer-profile-loop
version: 8.7.0
type: minor
status: local-draft
---

# PawTrace 8.7.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：Monitor 数据采集与客户画像闭环

## 新增

- Monitor 后端保留并扩展 `/api/monitor/collect`，可采集 user profile、pet profile、purchase 和 chat log。
- `/api/monitor/overview` 输出 recent users、recent pets、recent purchases 和 recent chat logs，供前端商业看板聚合。
- 前端 App 保留向 monitor collect 发送业务数据的能力，为销售、订阅、客户画像和 AI 问诊分析提供数据来源。

## 改进

- 采集数据使用 `MONITOR_MAX` 控制每类数据保留上限，并自动修剪旧记录。
- 客户画像可以通过用户资料、宠物资料、购买记录和 AI 聊天触点进行关联。
- 订单、订阅、宠物、AI 主题和客户依赖度数据在 monitor 中形成同一业务闭环。

## 主要影响文件

- `backend/src/registerRoutes.ts`
- `frontend/public/app/app.js`
- `monitor/index.html`
