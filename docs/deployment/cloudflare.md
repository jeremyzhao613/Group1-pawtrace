# PawTrace Cloudflare 上线设计

## 最快上线命令

当前最快路径是 Cloudflare Pages + Cloudflare Worker API + D1：

```bash
npm run cloudflare:whoami
npm run deploy:cloudflare:full
```

这条命令会依次执行：

1. 初始化远端 D1 表结构：`cloudflare/pawtrace-api/schema.sql`。
2. 发布 Worker API：`pawtrace-api`。
3. 发布主站 Pages：`pawtrace.pages.dev`。
4. 发布 glass Pages：`pawtrace-glass.pages.dev`。

如果只改了前端页面，用：

```bash
npm run deploy:cloudflare:pages
```

如果只改了 Worker API，用：

```bash
npm run cloudflare:d1:init
npm run deploy:cloudflare:api
```

生产 Pages 部署默认使用当前 Worker API：

```text
https://pawtrace-api.jeremyzhao613.workers.dev
```

如果要改成自定义 API，可以写在命令前，也可以写进项目根目录 `.env`：

```env
PAWTRACE_API_BASE_URL=https://pawtrace-api.jeremyzhao613.workers.dev
```

本地预览仍然可以不设置 API URL：

```bash
npm run cloudflare:preview
```

## 目标架构

- `pawtrace.pages.dev`：主 PawTrace Web App，产物目录 `frontend/dist`。
- `pawtrace-glass.pages.dev`：数字孪生 / 3D 展示页，产物目录 `pawtrace-glass/dist`。
- `pawtrace-api.<workers-subdomain>.workers.dev`：Cloudflare Worker API，核心认证、宠物、遥测、聊天、AI 文本/图片接口。
- `pawtrace-db`：Cloudflare D1，供 Worker API 使用。
- 可选 `api.<your-domain>`：Node/Express API，运行完整 Prisma/PostgreSQL/磁盘上传/YOLO 链路。
- 可选 YOLO 视频服务：单独 Python FastAPI 服务，Node 后端通过 `VIDEO_AI_URL` 调用。

`backend/` 里的 Express 后端仍然不能原样部署成 Cloudflare Pages 静态站或 Worker，因为它依赖 Prisma PostgreSQL、`multer` 磁盘上传和 Node 文件系统。仓库里的 `cloudflare/pawtrace-api/worker.js` 是 Cloudflare 原生 Worker API 替代实现，适合最快上线；如果要 100% 对齐完整 Node 后端，还需要继续补齐 Worker 路由、R2 视频上传或外部视频服务。

## 域名与 API

生产推荐：

```env
PAWTRACE_API_BASE_URL=https://pawtrace-api.jeremyzhao613.workers.dev
```

这个变量同时用于：

- 主前端构建时写入 `frontend/dist/app/runtime-config.js`。
- glass 构建时注入 `import.meta.env.PAWTRACE_API_BASE_URL`。
- Android/iOS/桌面打包时写入对应运行时配置。

Worker API 当前自动返回 CORS 头。若使用 Node/Express API，后端 `CORS_ORIGIN` 至少包含：

```env
CORS_ORIGIN=https://pawtrace.pages.dev,https://pawtrace-glass.pages.dev,pawtrace://app,capacitor://localhost,ionic://localhost
```

如果绑定自定义域名，把自定义域名也加入 `CORS_ORIGIN`。

## 发布命令

检查登录：

```bash
npm run cloudflare:whoami
```

发布主站和 glass：

```bash
npm run deploy:cloudflare:pages
```

只发主站：

```bash
npm run deploy:cloudflare
```

只发 glass：

```bash
npm run deploy:cloudflare:glass
```

生产部署不会再生成空 API URL。要测试相对 `/api`，使用 `PAWTRACE_API_BASE_URL=relative npm run cloudflare:preview`。

## Cloudflare 项目

当前账号已有：

- `pawtrace`
- `pawtrace-glass`
- `pawtrace-api`
- D1：`pawtrace-db`

部署脚本使用 direct upload，不依赖 Git 自动构建。这样本地 `runtime-config.js` 会先写好，再上传到 Pages。

Worker API secrets 至少需要：

```bash
wrangler secret put JWT_SECRET --config wrangler.pawtrace-api.jsonc
wrangler secret put DASHSCOPE_API_KEY --config wrangler.pawtrace-api.jsonc
wrangler secret put DEVICE_INGEST_TOKEN --config wrangler.pawtrace-api.jsonc
```

检查 secrets：

```bash
wrangler secret list --config wrangler.pawtrace-api.jsonc
```

## 本机无法打开 pages.dev

如果 macOS 开了 Shadowrocket/VPN，系统 DNS 可能把 `*.pages.dev` 解析到 `198.18.0.x` fake-ip。表现是 Cloudflare 已部署成功，但浏览器或 `curl https://pawtrace.pages.dev` TLS 失败。

先检测：

```bash
npm run cloudflare:fix-access
```

如果输出里 `system` 是 `198.18.0.x`，用管理员权限把真实 Cloudflare Pages IP 写入 `/etc/hosts`：

```bash
sudo node ./scripts/fix-cloudflare-pages-access.mjs --apply
```

脚本会写入：

```text
# BEGIN PAWTRACE CLOUDFLARE PAGES
<cloudflare-ip> pawtrace.pages.dev
<cloudflare-ip> pawtrace-glass.pages.dev
# END PAWTRACE CLOUDFLARE PAGES
```

然后自动刷新 macOS DNS 缓存。若之后绑定了自定义域名，优先使用自定义域名，不需要这个本机 hosts 修复。

## 后端上线建议

最小改造方案：

1. 把 Node 后端部署到 Railway/Fly/Render/VPS 或容器平台。
2. 配置生产 PostgreSQL。
3. 配置 `JWT_SECRET`、`DATABASE_URL`、`DASHSCOPE_API_KEY`、`VIDEO_AI_URL`、`MONITOR_API_TOKEN`。
4. 用 Cloudflare DNS 指向后端域名，开启 HTTPS。
5. 重新执行 `PAWTRACE_API_BASE_URL=https://api.your-domain.example npm run deploy:cloudflare:pages`。

Cloudflare 原生方案：

1. Worker API 替代 Express 路由。
2. D1 或 Hyperdrive + Postgres 替代直接 Prisma Node 连接。
3. R2 替代 `multer` 磁盘视频临时文件。
4. Workers AI / AI Gateway 或现有 DashScope HTTP API。
5. Pages 只负责静态 UI，Worker 负责 `/api/*`。
