PawTrace Web App（完整前后端）

技术栈
- 前端：React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + React Router
- 后端：Node.js + Express + TypeScript + Prisma + PostgreSQL
- AI：通义千问（DashScope）/ Google Gemini（仅服务端密钥）

目录
- frontend/          前端源码与构建产物 dist/
- frontend-legacy/     旧版纯 HTML/JS 页面（仅供参考）
- backend/             后端源码 src/、Prisma schema、迁移
- assets/              共享静态资源（地图图等），生产由后端挂载 /assets
- monitor/             监控台静态页（/monitor）

环境变量（后端）
- 复制 backend/.env.example 为 backend/.env
- DATABASE_URL=postgresql://pawtrace:pawtrace@localhost:5432/pawtrace
- JWT_SECRET=（生产请使用强随机串）
- DASHSCOPE_API_KEY / GEMINI_API_KEY（AI 功能）
- MONITOR_API_TOKEN（可选，保护 /api/monitor/*）
- DEVICE_TOKENS=m5-001=tokenA（设备上报鉴权，可选）

本地数据库（Docker）
1. docker compose up -d
2. cd backend && npm install
3. npx prisma migrate deploy
4. npm run db:seed        （演示用户 demo / 演示密码 demo123）

一键开发（需已启动 Postgres 并完成 migrate+seed）
1. 在项目根目录：npm install
2. npm run dev
   - 后端 http://localhost:3000
   - 前端 Vite http://localhost:5173（代理 /api 到 3000）

生产构建与启动
1. npm run build
2. 设置 NODE_ENV=production 与 DATABASE_URL 等
3. cd backend && npx prisma migrate deploy && npm run db:seed（首次）
4. 在项目根目录：npm start
   - 后端托管 frontend/dist 与 /assets、/monitor

从旧 JSON 导入数据（可选）
- cd backend && npm run db:import-json
- 默认读取 backend/data/pawtrace-db.json

前端环境变量（可选）
- frontend/.env：VITE_MONITOR_API_TOKEN=...（与后端 MONITOR_API_TOKEN 一致时 iframe 可带 token）
