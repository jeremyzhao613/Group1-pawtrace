---
name: pawtrace-8-5-0-revenue-subscription-customer-monitor
version: 8.5.0
type: minor
status: local-draft
---

# PawTrace 8.5.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：销售收入、订阅与客户智能 Monitor

## 新增

- 将 `http://localhost:3000/monitor/index.html` 升级为产品销售、App 订阅收入和客户智能看板。
- 新增 Product Revenue、App Subscription Revenue、Client Reliance Index、AI Care Consults 四类核心指标。
- 新增 Revenue Mix Trend canvas 图表，用于分离展示产品收入和订阅收入。
- 新增 Subscription & Retention Signals、Product Revenue Ranking、Client Profiles & Reliance、Client Pet Intelligence、Post-Consult AI Data 和 Order Ledger。
- 新增 AI Care Topics canvas 图表，对 AI 问诊后数据按健康、营养、行为、行动力、陪伴等主题分类。

## 改进

- Monitor 页面改为全英文高级视觉风格，采用暗色、金色、薄荷绿和蓝色的商业智能配色。
- 收入识别逻辑可根据 purchase name、type、metadata plan、metadata source 等字段自动区分订阅和产品订单。
- 客户依赖度根据资料完整度、宠物数量、订单、收入、AI 问诊触点和主题丰富度加权计算。
- 本地开发环境在没有 `MONITOR_API_TOKEN` 时允许访问 monitor API，生产环境仍保持令牌保护。

## 主要影响文件

- `monitor/index.html`
- `backend/src/middleware/monitorAuth.ts`
- `backend/src/registerRoutes.ts`
