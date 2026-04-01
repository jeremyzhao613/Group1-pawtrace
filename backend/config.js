const fs = require('fs');
const path = require('path');
const { getAiKeys } = require('./aiKeyManager');

const keys = getAiKeys();

const frontendRoot = path.join(__dirname, '..', 'frontend');
const frontendDist = path.join(frontendRoot, 'dist');
const publicPath = fs.existsSync(path.join(frontendDist, 'index.html')) ? frontendDist : frontendRoot;
const usingFrontendDist = publicPath === frontendDist;

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DASHSCOPE_API_KEY: keys.DASHSCOPE_API_KEY,
  GEMINI_API_KEY: keys.GEMINI_API_KEY,
  /** Google AI generateContent model id (v1beta path segment). Override via env if Google renames models. */
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS || 15000),
  MONITOR_MAX: Number(process.env.MONITOR_MAX || 500),
  /** Set to require Bearer / ?token= / body.token on /api/monitor/* (empty = no auth, dev default). */
  MONITOR_API_TOKEN: String(process.env.MONITOR_API_TOKEN || '').trim(),
  SENSOR_MAX: Number(process.env.SENSOR_MAX || 2000),
  LOCATION_LAST_MAX_AGE_MS: Number(process.env.LOCATION_LAST_MAX_AGE_MS || 10 * 60 * 1000),
  DEVICE_TOKENS_RAW: process.env.DEVICE_TOKENS || '',
  REQUIRE_DEVICE_TOKEN: String(process.env.REQUIRE_DEVICE_TOKEN || '0') === '1',
  NFC_CARD_SECRET: process.env.NFC_CARD_SECRET || '',
  NFC_PAYLOAD_VERSION: 1,
  publicPath,
  frontendRoot,
  frontendDist,
  usingFrontendDist,
  assetsPath: path.join(__dirname, '..', 'assets'),
};
