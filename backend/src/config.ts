import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { getAiKeys } from './aiKeyManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');

const keys = getAiKeys();

const webApp = String(process.env.WEB_APP || 'frontend').trim();
const webRootName = webApp === 'glass' || webApp === 'pawtrace-glass' ? 'pawtrace-glass' : 'frontend';
const frontendDist = path.join(repoRoot, webRootName, 'dist');
const frontendRoot = path.join(repoRoot, webRootName);
const hasFrontendDist = fs.existsSync(path.join(frontendDist, 'index.html'));
const fallbackPublicPath = webRootName === 'frontend' ? path.join(frontendRoot, 'public') : frontendRoot;
const publicPath = hasFrontendDist ? frontendDist : fallbackPublicPath;
const usingFrontendDist = hasFrontendDist;
const serveWeb = process.env.SERVE_WEB === '1' || process.env.SERVE_WEB === 'true';

export const config = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-change-me',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',

  DASHSCOPE_API_KEY: keys.DASHSCOPE_API_KEY,
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 15000),
  VIDEO_AI_URL: String(process.env.VIDEO_AI_URL || 'http://127.0.0.1:8008/analyze-video').trim(),
  VIDEO_AI_TIMEOUT_MS: Number(process.env.VIDEO_AI_TIMEOUT_MS || 120000),

  MONITOR_MAX: Number(process.env.MONITOR_MAX || 500),
  MONITOR_API_TOKEN: String(process.env.MONITOR_API_TOKEN || '').trim(),

  repoRoot,
  backendRoot,
  publicPath,
  frontendRoot,
  frontendDist,
  webRootName,
  usingFrontendDist,
  serveWeb,
  assetsPath: path.join(repoRoot, 'assets'),
  monitorPath: path.join(repoRoot, 'monitor'),
} as const;
