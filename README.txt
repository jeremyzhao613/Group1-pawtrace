PawTrace 是一个全栈宠物社区与健康管理原型：以「地图 + 社交 + AI」为核心，帮助用户在校园环境中发现宠物友好地点、管理多只宠物信息，并通过大模型完成对话式互动与基于图片的健康/行为类辅助分析（服务端集成阿里云通义千问文本与 Qwen-VL 视觉能力，密钥仅在后端配置）。

技术上前端采用 Vite + Tailwind，主站页面为当前完整单页 HTML/JS 界面；后端为 Node.js + Express + TypeScript，数据层 Prisma + PostgreSQL，认证使用 JWT。后端默认只作为 API/Monitor，不在 3000 端口托管前端页面，避免错误界面混淆。


PawTrace Web App

快速开始（最简）
- 首次只做一次：`npm install && npm run install:all && npm run init`
- 日常启动：`npm run run`
- 停止服务：`npm run stop`

技术栈
- 前端：Vite + Tailwind（当前 UI 为完整单页页面方案）
- 后端：Node.js + Express + TypeScript + Prisma + PostgreSQL
- AI：通义千问 DashScope（Qwen 文本 + Qwen-VL 视觉，仅服务端密钥）

目录
- frontend/             主站前端入口（完整单页页面 + Vite）
- pawtrace-glass/       独立数字孪生展示页（默认端口 3001）
- backend/              后端源码 src/、Prisma schema、迁移
- assets/               共享静态资源（生产挂载 /assets）
- monitor/              监控台静态页（/monitor）
- scripts/local-db.sh   本地 PostgreSQL（项目私有）管理脚本

环境变量（后端）
- 复制 backend/.env.example 为 backend/.env
- 推荐本地：DATABASE_URL="postgresql://pawtrace@localhost:55432/pawtrace"
- Docker Compose：DATABASE_URL="postgresql://pawtrace:pawtrace@localhost:5432/pawtrace"
- JWT_SECRET=（本地可简化，生产务必强随机）
- DASHSCOPE_API_KEY（AI 功能，通义千问密钥）
- MONITOR_API_TOKEN（可选，保护 /api/monitor/*）
- SERVE_WEB=0（默认后端不托管前端；单端口部署时才改成 1）

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
- 后端 API：http://localhost:3000/api/status
- Monitor：http://localhost:3000/monitor/index.html

常用命令
- 一键启动（推荐）：npm run run
- 首次初始化：npm run init
- 一键停止：npm run stop
- 一键准备并开发：npm run local:dev
- 查看本地 DB 状态：npm run db:local:status
- 重置本地 DB：npm run db:local:reset
- 停止本地 DB：npm run db:local:stop
- 构建全部：npm run build
- 只构建主站：npm run build:web
- 只构建展示页：npm run build:glass
- 启动展示页：npm run dev:glass

测试账号
- 用户名：demo
- 密码：demo123

功能特性
- 校园宠物地图：标记宠物友好地点、搜索、便签
- 宠物管理：添加/编辑/删除宠物卡片
- AI 聊天：与虚拟宠物主人对话（通义千问驱动）
- AI 健康：图片诊断（Qwen-VL）+ 文字健康/行为/饮食报告
- 暗色模式：手动切换（header 右上角 🌙/☀️ 按钮）
- 爪印黑客帝国：彩蛋动画（右下角 🐾 按钮）
