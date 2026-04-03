import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { getAiKeys } from './aiKeyManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');

const keys = getAiKeys();

const frontendDist = path.join(repoRoot, 'frontend', 'dist');
const frontendRoot = path.join(repoRoot, 'frontend');
const hasFrontendDist = fs.existsSync(path.join(frontendDist, 'index.html'));
const publicPath = hasFrontendDist ? frontendDist : path.join(frontendRoot, 'public');
const usingFrontendDist = hasFrontendDist;

export const config = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-change-me',
  JWT_EXPIRES: process.env.JWT_EXPIRES || '7d',

  DASHSCOPE_API_KEY: keys.DASHSCOPE_API_KEY,
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 15000),

  MONITOR_MAX: Number(process.env.MONITOR_MAX || 500),
  MONITOR_API_TOKEN: String(process.env.MONITOR_API_TOKEN || '').trim(),
  SENSOR_MAX: Number(process.env.SENSOR_MAX || 2000),

  repoRoot,
  backendRoot,
  publicPath,
  frontendRoot,
  frontendDist,
  usingFrontendDist,
  assetsPath: path.join(repoRoot, 'assets'),
  monitorPath: path.join(repoRoot, 'monitor'),
} as const;
