const express = require('express');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const config = require('./config');
const sqlDatabase = require('./db/sqljsDatabase');
const { migrateFromJsonIfNeeded } = require('./db/migrateFromJson');
const { PawtraceRepository } = require('./repositories/pawtraceRepository');
const { createMetrics, createMetricsMiddleware } = require('./middleware/metrics');
const { createRequireDeviceAuth } = require('./middleware/deviceAuth');
const { registerRoutes } = require('./routes/registerRoutes');

const defaultPets = [
  {
    id: 'p1',
    name: 'Mocha',
    type: 'Dog',
    breed: 'Corgi',
    age: '2 years',
    gender: 'Male',
    avatar: '/assets/1.png',
    traits: ['Friendly', 'Food-motivated', 'Short legs, fast heart'],
    health: 'Vaccinations up to date. Last vet check 2 months ago.',
    status: 'Always ready for a fetch session.',
  },
  {
    id: 'p2',
    name: 'Pixel',
    type: 'Dog',
    breed: 'Border Collie',
    age: '3 years',
    gender: 'Female',
    avatar: '/assets/2.png',
    traits: ['Smart', 'High energy', 'Ball addict'],
    health: 'Needs daily long walks. Joint check scheduled next month.',
    status: 'Learning trick combos every week.',
  },
  {
    id: 'p3',
    name: 'Mochi',
    type: 'Cat',
    breed: 'Ragdoll',
    age: '1 year',
    gender: 'Female',
    avatar: '/assets/3.png',
    traits: ['Quiet', 'Cuddly', 'Window watcher'],
    health: 'Indoor only, spayed, no known issues.',
    status: 'Prefers sunlit shelves and calm corners.',
  },
  {
    id: 'p4',
    name: 'Kiko',
    type: 'Dog',
    breed: 'Husky',
    age: '4 years',
    gender: 'Female',
    avatar: '/assets/4.png',
    traits: ['Pack leader', 'Snow lover'],
    health: 'Energetic and strong, needs long runs.',
    status: 'Dreaming about weekend meetups.',
  },
  {
    id: 'p5',
    name: 'Luna',
    type: 'Cat',
    breed: 'Siamese',
    age: '2 years',
    gender: 'Female',
    avatar: '/assets/5.png',
    traits: ['Playful', 'Curious', 'Talkative'],
    health: 'Indoor only, loves puzzles.',
    status: 'Chasing laser dots when not napping.',
  },
];

const defaultUsers = [
  {
    id: 'u1',
    username: 'demo',
    displayName: 'Pet Lover',
    avatar: '',
    bio: 'Welcome to PawTrace!',
    campus: 'Taicang',
    contact: 'WeChat',
  },
  {
    id: 'u2',
    username: 'mila',
    displayName: 'Mila',
    avatar: '',
    bio: 'Cat person, art lover',
    campus: 'Shanghai',
    contact: 'Email',
  },
  {
    id: 'u3',
    username: 'rocky',
    displayName: 'Rocky',
    avatar: '',
    bio: 'Dog walker & plant dad',
    campus: 'Beijing',
    contact: 'Phone',
  },
  {
    id: 'u4',
    username: 'lily',
    displayName: 'Lily',
    avatar: '',
    bio: 'Event planner for pet meetups',
    campus: 'Taicang',
    contact: 'WeChat',
  },
];

async function bootstrap() {
  await sqlDatabase.openDatabase();
  migrateFromJsonIfNeeded();

  const repo = new PawtraceRepository(sqlDatabase.getDb, sqlDatabase.persist);
  repo.seedDemoIfEmpty(defaultPets, defaultUsers);

  const metrics = createMetrics();
  const requireDeviceAuth = createRequireDeviceAuth();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(compression());
  app.set('etag', 'strong');

  const staticOpts = {
    maxAge: config.NODE_ENV === 'production' ? '12h' : 0,
    etag: true,
  };
  app.use(express.static(config.publicPath, staticOpts));
  if (fs.existsSync(config.assetsPath)) {
    app.use('/assets', express.static(config.assetsPath, staticOpts));
  }

  const monitorPath = path.join(__dirname, '..', 'monitor');
  const monitorCssPath = path.join(monitorPath, 'assets', 'monitor.css');
  if (fs.existsSync(monitorPath)) {
    app.use('/monitor', express.static(monitorPath, staticOpts));
    if (!fs.existsSync(monitorCssPath)) {
      console.warn(
        '[monitor] 未找到 monitor/assets/monitor.css，请在 frontend 目录执行 npm run build:monitor（或 npm run build:all）。'
      );
    }
  }

  app.use(createMetricsMiddleware(metrics));

  registerRoutes(app, { repo, metrics, requireDeviceAuth });

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

  const server = app.listen(config.PORT, () => {
    console.log(`PawTrace web app running at http://localhost:${config.PORT}`);
    if (fs.existsSync(monitorPath)) {
      console.log(`[monitor] http://localhost:${config.PORT}/monitor/index.html`);
      if (config.MONITOR_API_TOKEN) {
        console.warn(
          '[monitor] 已设置 MONITOR_API_TOKEN：前端需带 Authorization 或访问 /monitor/index.html?token=…；Vite 开发需配置 VITE_MONITOR_API_TOKEN。'
        );
      }
    }
    console.log('[db] SQLite (sql.js) + repository layer; legacy pawtrace-db.json migrates once if DB empty');
    if (!config.usingFrontendDist) {
      console.warn(
        '[static] 未检测到 frontend/dist（请先在前端目录执行 npm run build），或开发时用 frontend 下 npm run dev（Vite）并代理 API。'
      );
    }
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(
        `[fatal] 端口 ${config.PORT} 已被占用（常见原因：之前用 Ctrl+Z 挂起了 npm start，进程仍在后台占端口）。\n` +
          '  处理：执行 jobs 查看任务，然后 fg 后按 Ctrl+C 结束，或 kill %1（编号以 jobs 为准）；' +
          `也可 lsof -ti :${config.PORT} | xargs kill。或换端口：PORT=3001 npm start`
      );
    } else {
      console.error('[fatal] HTTP server error:', err);
    }
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
