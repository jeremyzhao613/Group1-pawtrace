---
name: pawtrace-8-8-0-visual-responsive-unification
version: 8.8.0
type: minor
status: local-draft
---

# PawTrace 8.8.0 更新日志

## 版本定位

- **版本类型**：大更新，`+0.1.0`
- **发布状态**：当前工作区草案，尚未发布 tag
- **核心主题**：多界面高级视觉与响应式体验统一

## 新增

- 主 App、Map、Monitor 和 Glass Dashboard 统一向更成熟的运营产品视觉靠拢。
- 地图新增 OpenStreetMap tile 渲染、地图归因、定位 readout 和实时宠物状态说明。
- Monitor 使用原生 canvas 绘图，减少外部 CDN 依赖，兼容更严格 CSP。

## 改进

- 统一关键控件、卡片、指标、列表、图表、地图面板和移动端布局的空间密度。
- 修正长文本、按钮、图表和列表在桌面/移动端的溢出风险。
- 加强暗色主题下的可读性、层级、边框和 hover 状态。

## 主要影响文件

- `frontend/public/app/style.tailwind.css`
- `frontend/public/app/app.css`
- `frontend/public/map.js`
- `monitor/index.html`
- `pawtrace-glass/src/index.css`
