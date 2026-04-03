import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { createMetrics, createMetricsMiddleware } from './middleware/metrics.js';
import { optionalAuth } from './middleware/jwtAuth.js';
import { requestContext } from './middleware/requestContext.js';
import { registerRoutes } from './registerRoutes.js';
import { prisma } from './lib/prisma.js';

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

async function main() {
  try {
    await prisma.$connect();
    console.log('[db] connected');
  } catch (err) {
    console.error('[db] connection failed – check DATABASE_URL', err);
    process.exit(1);
  }
  const metrics = createMetrics();

  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(compression());
  app.set('etag', 'strong');
  app.use(requestContext);
  app.use(optionalAuth);
  app.use(createMetricsMiddleware(metrics));

  registerRoutes(app, { metrics });

  const staticOpts = {
    maxAge: config.NODE_ENV === 'production' ? ('12h' as const) : 0,
    etag: true as const,
  };
  app.use(express.static(config.publicPath, staticOpts));
  if (fs.existsSync(config.assetsPath)) {
    app.use('/assets', express.static(config.assetsPath, staticOpts));
  }

  const monitorCssPath = path.join(config.monitorPath, 'assets', 'monitor.css');
  if (fs.existsSync(config.monitorPath)) {
    app.use('/monitor', express.static(config.monitorPath, staticOpts));
    if (!fs.existsSync(monitorCssPath)) {
      console.warn(
        '[monitor] 未找到 monitor/assets/monitor.css，请在 frontend 目录执行 npm run build:monitor（或 npm run build:all）。'
      );
    }
  }

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(config.publicPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });

  app.use((req, res) => {
    res.status(404).type('json').send({ error: 'Not found', path: req.path });
  });

  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const requestId = req.requestId || 'unknown';
    console.error(`[error] rid=${requestId}`, err);
    res.status(500).json({ error: 'Internal Server Error', requestId });
  });

  const server = app.listen(config.PORT, () => {
    console.log(`PawTrace API + static at http://localhost:${config.PORT}`);
    if (fs.existsSync(config.monitorPath)) {
      console.log(`[monitor] http://localhost:${config.PORT}/monitor/index.html`);
      if (config.MONITOR_API_TOKEN) {
        console.warn(
          '[monitor] 已设置 MONITOR_API_TOKEN：请求需带 Authorization 或 ?token='
        );
      }
    }
    if (!config.usingFrontendDist) {
      console.warn(
        '[static] 未检测到 frontend/dist，请先在前端执行 npm run build；开发时用 Vite 并代理 /api。'
      );
    }
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(
        `[fatal] 端口 ${config.PORT} 已被占用。可换端口：PORT=3001 npm start`
      );
    } else {
      console.error('[fatal] HTTP server error:', err);
    }
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
