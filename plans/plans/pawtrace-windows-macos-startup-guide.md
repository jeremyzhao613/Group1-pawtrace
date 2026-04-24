---
name: pawtrace-windows-macos-startup-guide
overview: 说明 PawTrace 7.0.0 在 macOS、Windows 和 WSL2 下的正确启动方式，明确主站、后端 API、Monitor 和 pawtrace-glass 的端口职责。
isProject: false
---

# PawTrace Windows 和 macOS 启动方式

## 1. 正确端口

- 主站 Web App：`http://localhost:5173/`
- 后端 API：`http://localhost:3000/api/status`
- 后端根路径：`http://localhost:3000/`
- Monitor：`http://localhost:3000/monitor/index.html`
- pawtrace-glass 展示页：`http://localhost:3001/`

`3000` 默认不是网页端口。7.0.0 之后，后端根路径默认返回 API 状态 JSON，只有显式设置 `SERVE_WEB=1` 或 `SERVE_WEB=true` 时才托管构建后的网页资源。

## 2. macOS 推荐启动

### 2.1 前置要求

- Node.js 和 npm
- PostgreSQL 16
- Git

如果使用 Homebrew：

```bash
brew install postgresql@16
```

本地数据库脚本会自动查找：

- `PG_BIN` 指定的 PostgreSQL bin 目录
- `/opt/homebrew/opt/postgresql@16/bin`
- `/usr/local/opt/postgresql@16/bin`
- 当前 `PATH` 里的 `pg_ctl`

### 2.2 安装依赖

```bash
npm install
npm run install:all
```

### 2.3 初始化本地环境

```bash
npm run init
```

这个命令会：

- 如果缺少 `backend/.env`，从 `backend/.env.example` 复制一份
- 启动项目私有 PostgreSQL
- 执行 Prisma 迁移
- 写入 seed 数据

### 2.4 启动主站

```bash
npm run run
```

启动后使用：

- 主站：`http://localhost:5173/`
- 后端 API：`http://localhost:3000/api/status`
- Monitor：`http://localhost:3000/monitor/index.html`

### 2.5 启动 pawtrace-glass

单独开一个终端：

```bash
npm run dev:glass
```

默认地址：

- `http://localhost:3001/`

### 2.6 停止本地服务

```bash
npm run stop
```

`stop` 使用 `pkill` 和本地 PostgreSQL 脚本，适合 macOS/Linux，不适合原生 Windows PowerShell。

## 3. Windows 推荐启动

### 3.1 原生 Windows + Docker Desktop

原生 Windows 下推荐用 Docker 跑 PostgreSQL，不使用根目录的 `npm run init`、`npm run run`、`npm run stop`。

安装依赖：

```powershell
npm install
npm run install:all
```

复制后端环境变量：

```powershell
copy backend\.env.example backend\.env
```

确认 `backend\.env` 使用 Docker 数据库地址：

```env
DATABASE_URL="postgresql://pawtrace:pawtrace@localhost:5432/pawtrace"
SERVE_WEB=0
WEB_APP=frontend
```

启动数据库：

```powershell
docker compose up -d
```

迁移并写入 seed：

```powershell
cd backend
npx prisma migrate dev
npm run db:seed
cd ..
```

启动主站和后端：

```powershell
npm run dev
```

启动 pawtrace-glass：

```powershell
npm run dev:glass
```

停止时直接在终端里 `Ctrl + C`，数据库使用：

```powershell
docker compose down
```

### 3.2 Windows + WSL2

WSL2 可以按 Linux/macOS 思路运行。推荐在 WSL2 内安装 Node.js、npm 和 PostgreSQL，然后执行：

```bash
npm install
npm run install:all
npm run init
npm run run
```

如果 WSL2 中的 PostgreSQL 不在默认路径，需要设置：

```bash
PG_BIN=/path/to/postgresql/bin npm run init
```

## 4. 不建议混用的入口

- 不要把 `http://localhost:3000/` 当主站页面打开。
- 不要恢复 `frontend/src` 下已删除的 React 入口。
- 不要恢复 `frontend/public/legacy`。
- 不要用旧的 `frontend-legacy` 目录作为开发入口。
- 不要把 pawtrace-glass 的旧 Gemini demo 根目录文件恢复为当前展示页入口。

## 5. 构建命令

构建全部可部署内容：

```bash
npm run build
```

只构建主站：

```bash
npm run build:web
```

只构建 pawtrace-glass：

```bash
npm run build:glass
```

构建后，后端仍默认只跑 API/Monitor。单端口部署时才设置：

```env
SERVE_WEB=1
WEB_APP=frontend
```

或：

```env
SERVE_WEB=1
WEB_APP=glass
```
