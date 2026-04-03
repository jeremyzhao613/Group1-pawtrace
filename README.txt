PawTrace 是一个全栈宠物社区与健康管理原型：以「地图 + 社交 + AI」为核心，帮助用户在校园环境中发现宠物友好地点、管理多只宠物信息，并通过大模型完成对话式互动与基于图片的健康/行为类辅助分析（服务端集成阿里云通义千问文本与 Qwen-VL 视觉能力，密钥仅在后端配置）。

技术上前端采用 Vite + React + TypeScript + Tailwind，当前主界面以 legacy 单页 HTML/JS 为主并与 React 共存；后端为 Node.js + Express + TypeScript，数据层 Prisma + PostgreSQL，认证使用 JWT。仓库为 monorepo，包含本地数据库脚本、监控静态页与一键启动流程，适合小团队迭代与课程/演示环境部署。


PawTrace Web App

快速开始（最简）
- 首次只做一次：`npm install && npm run init`
- 日常启动：`npm run run`
- 停止服务：`npm run stop`

技术栈
- 前端：Vite + Tailwind（当前 UI 为 legacy 大页面方案）
- 后端：Node.js + Express + TypeScript + Prisma + PostgreSQL
- AI：通义千问（DashScope）/ Google Gemini（仅服务端密钥）

目录
- frontend/             前端入口（当前为 legacy UI）
- frontend-legacy/      旧版纯 HTML/JS 页面备份
- backend/              后端源码 src/、Prisma schema、迁移
- assets/               共享静态资源（生产挂载 /assets）
- monitor/              监控台静态页（/monitor）
- scripts/local-db.sh   本地 PostgreSQL（项目私有）管理脚本

环境变量（后端）
- 复制 backend/.env.example 为 backend/.env
- 推荐本地：DATABASE_URL="postgresql://pawtrace@localhost:55432/pawtrace"
- JWT_SECRET=（本地可简化，生产务必强随机）
- DASHSCOPE_API_KEY / GEMINI_API_KEY（AI 功能）
- MONITOR_API_TOKEN（可选，保护 /api/monitor/*）
- DEVICE_TOKENS=m5-001=tokenA（可选）

小团队本地推荐流程（无需 Docker）
1) 安装依赖
- 根目录：npm install
- backend：npm install
- frontend：npm install

2) 启动项目私有数据库（端口 55432）
- npm run db:local:start

3) 初始化数据库（首次或模型变更后）
- npm run db:migrate
- npm run db:seed

4) 启动前后端
- npm run dev
- 前端：http://localhost:5173
- 后端：http://localhost:3000

常用命令
- 一键启动（推荐）：npm run run
- 首次初始化：npm run init
- 一键停止：npm run stop
- 一键准备并开发：npm run local:dev
- 查看本地 DB 状态：npm run db:local:status
- 重置本地 DB：npm run db:local:reset
- 停止本地 DB：npm run db:local:stop
- 构建：npm run build

测试账号
- 用户名：demo
- 密码：demo123

当前仍不合理但可接受（小团队本地）
1. frontend/index.html 仍偏大（已拆出业务脚本，UI 未改）
2. 前端采用 legacy 大页面 + Vite 混合模式，可维护性一般
3. 本地 DB 为 trust 方案，仅适合开发机，不可直接用于线上

后续建议（不改 UI 的前提下）
- 继续把内联样式从 index.html 抽离到独立 CSS 文件
- 把 legacy 业务脚本再拆模块（map/pets/chat/profile）
