---
name: pawtrace-window-page-startup-guide
overview: 说明 PawTrace 当前网页入口，明确主站、后端 API/Monitor 和 pawtrace-glass 的端口职责，避免误打开旧入口或错误前端页面。
isProject: false
---

# PawTrace 当前网页入口说明

## 1. 正确入口

- 主站页面：`http://localhost:5173/`
- 后端 API 状态：`http://localhost:3000/api/status`
- 后端根路径：`http://localhost:3000/`
- Monitor：`http://localhost:3000/monitor/index.html`
- 独立展示页：`http://localhost:3001/`

## 2. 主站只保留一个入口

主站入口是：

- [frontend/index.html](/Users/jeremy/Desktop/Group1-pawtrace/frontend/index.html:1)
- [frontend/public/app/app.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/app.js:1)
- [frontend/public/app/style.tailwind.css](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/app/style.tailwind.css:1)
- [frontend/public/map.js](/Users/jeremy/Desktop/Group1-pawtrace/frontend/public/map.js:1)

主站不再有 `frontend/src` React 入口，也不再保留 `frontend/public/legacy` 路径。这样可以避免误把旧的 React 登录页或备份页面挂出来。

## 3. 后端端口职责

`3000` 默认只做 API 和 Monitor：

- `GET /` 返回后端状态说明 JSON。
- `GET /api/status` 返回 API 健康状态。
- `GET /monitor/index.html` 返回 Monitor 静态页。

默认配置下，后端不会在 `3000` 托管主站前端页面。只有单端口部署需要时，才显式设置：

```env
SERVE_WEB=1
WEB_APP=frontend
```

## 4. 展示页职责

`pawtrace-glass` 是独立展示页：

- [pawtrace-glass/index.html](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/index.html:1)
- [pawtrace-glass/src/main.tsx](/Users/jeremy/Desktop/Group1-pawtrace/pawtrace-glass/src/main.tsx:1)
- 默认地址：`http://localhost:3001/`

它不是主站 tab 内页，也不应该替代 `5173` 主站入口。
