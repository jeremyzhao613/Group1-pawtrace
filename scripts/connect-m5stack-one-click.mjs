#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runDir = path.join(rootDir, '.local-run');
const backendEnvPath = path.join(rootDir, 'backend', '.env');
const backendEnvExamplePath = path.join(rootDir, 'backend', '.env.example');

const HOTSPOT_SSID = process.env.M5_WIFI_SSID || 'Jeremy’s iphone';
const HOTSPOT_PASSWORD = process.env.M5_WIFI_PASSWORD || '00000000';
const DEVICE_TOKEN = process.env.DEVICE_INGEST_TOKEN || 'pawtrace-m5-dev-token';
const BACKEND_PORT = Number(process.env.PORT || 3000);
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 5173);
const GLASS_PORT = Number(process.env.GLASS_PORT || 3001);

const args = new Set(process.argv.slice(2));
const shouldOpen = !args.has('--no-open');
const shouldSkipSerial = args.has('--no-serial');

function log(message) {
  console.log(`[m5-connect] ${message}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function privateIpv4Score(ip) {
  if (!ip || ip === '127.0.0.1') return 0;
  if (ip.startsWith('172.20.10.')) return 100;
  if (ip.startsWith('192.168.')) return 90;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return 80;
  if (ip.startsWith('10.')) return 70;
  return 10;
}

function detectLanIp() {
  if (process.env.PAWTRACE_LAN_IP) return process.env.PAWTRACE_LAN_IP.trim();
  const candidates = Object.values(os.networkInterfaces())
    .flat()
    .filter(Boolean)
    .filter((entry) => entry.family === 'IPv4' && !entry.internal && !entry.address.startsWith('169.254.'))
    .map((entry) => entry.address)
    .sort((a, b) => privateIpv4Score(b) - privateIpv4Score(a));
  return candidates[0] || '127.0.0.1';
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    env[match[1]] = match[2].trim();
  }
  return env;
}

function setEnvLine(content, key, value) {
  const escaped = String(value);
  const line = `${key}=${escaped}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content.replace(/\s*$/, '')}\n${line}\n`;
}

function ensureBackendEnv() {
  if (!fs.existsSync(backendEnvPath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    log('created backend/.env from backend/.env.example');
  }
  let content = fs.readFileSync(backendEnvPath, 'utf8');
  content = setEnvLine(content, 'HOST', '0.0.0.0');
  content = setEnvLine(content, 'PORT', String(BACKEND_PORT));
  content = setEnvLine(content, 'DEVICE_INGEST_TOKEN', DEVICE_TOKEN);
  content = setEnvLine(content, 'DEVICE_INGEST_ALLOW_LAN', 'true');
  content = setEnvLine(content, 'DEVICE_DEFAULT_USER', 'demo');
  fs.writeFileSync(backendEnvPath, content);
}

function runChecked(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: options.quiet ? 'pipe' : 'inherit',
    env: { ...process.env, ...options.env },
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed${output ? `:\n${output}` : ''}`);
  }
  return result;
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.setTimeout(650);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

async function waitForUrl(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = '';
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (response.ok) return true;
      lastError = `HTTP ${response.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await sleep(800);
  }
  throw new Error(`${url} did not become ready: ${lastError}`);
}

function startDetached(name, command, args, env = {}) {
  fs.mkdirSync(runDir, { recursive: true });
  const logPath = path.join(runDir, `${name}.log`);
  const out = fs.openSync(logPath, 'a');
  const child = spawn(command, args, {
    cwd: rootDir,
    detached: true,
    stdio: ['ignore', out, out],
    env: { ...process.env, ...env },
  });
  child.unref();
  log(`started ${name} pid=${child.pid}, log=${path.relative(rootDir, logPath)}`);
}

async function ensureService(name, port, command, args, readyUrl, env = {}) {
  if (await isPortOpen(port)) {
    log(`${name} already listening on ${port}`);
  } else {
    startDetached(name, command, args, env);
  }
  await waitForUrl(readyUrl);
}

function ensureDatabase() {
  log('starting local PostgreSQL');
  runChecked('bash', ['./scripts/local-db.sh', 'start']);
  log('applying Prisma migrations');
  runChecked('npm', ['--prefix', 'backend', 'run', 'prisma:deploy']);
}

async function ensureDemoUser(apiBaseUrl) {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'demo123' }),
  }).catch(() => null);
  if (response?.ok) return;
  log('seeding demo user');
  runChecked('npm', ['--prefix', 'backend', 'run', 'db:seed']);
}

function detectSerialPort() {
  if (process.env.M5_SERIAL_PORT) return process.env.M5_SERIAL_PORT.trim();
  const ports = fs.readdirSync('/dev')
    .filter((name) => name.startsWith('cu.'))
    .map((name) => `/dev/${name}`)
    .filter((name) => !/Bluetooth|debug-console/i.test(name));
  const preferred = ports.find((name) => /usbserial|wchusbserial|SLAB_USBtoUART|usbmodem/i.test(name));
  return preferred || ports[0] || '';
}

async function sendSerialCommands(port, lanIp) {
  if (!port) {
    log('no M5 serial port detected; backend/frontend are ready and test data will still show');
    return false;
  }

  log(`configuring M5 over ${port}`);
  spawnSync('stty', ['-f', port, '115200', 'cs8', '-cstopb', '-parenb', '-ixon', '-ixoff', 'raw', '-echo'], {
    stdio: 'ignore',
  });

  const commands = [
    `WIFI ${HOTSPOT_SSID}|${HOTSPOT_PASSWORD}`,
    `HOST ${lanIp}`,
    `TOKEN ${DEVICE_TOKEN}`,
    'UPLOAD',
    'CONFIG',
  ];

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(port, { flags: 'w' });
    stream.on('error', reject);
    stream.on('open', async () => {
      await sleep(1800);
      for (const command of commands) {
        stream.write(`${command}\r\n`);
        await sleep(450);
      }
      stream.end(resolve);
    });
  });
  log('M5 serial configuration sent');
  return true;
}

function runTelemetryTest(lanIp) {
  log('running full telemetry test');
  runChecked('node', ['./scripts/test-m5stack-telemetry.mjs'], {
    env: {
      PAWTRACE_LAN_IP: lanIp,
      DEVICE_INGEST_TOKEN: DEVICE_TOKEN,
    },
  });
}

function openUrl(url) {
  if (!shouldOpen) return;
  if (process.platform === 'darwin') {
    spawnSync('open', [url], { stdio: 'ignore' });
  }
}

const lanIp = detectLanIp();
const apiBaseUrl = `http://${lanIp}:${BACKEND_PORT}`;
const frontendUrl = `http://${lanIp}:${FRONTEND_PORT}/?openApp=profile&m5Demo=1#health`;
const glassUrl = `http://${lanIp}:${GLASS_PORT}/`;

log(`LAN IP ${lanIp}`);
ensureBackendEnv();
ensureDatabase();

await ensureService(
  'backend',
  BACKEND_PORT,
  'npm',
  ['--prefix', 'backend', 'run', 'dev'],
  `${apiBaseUrl}/api/status`,
  { HOST: '0.0.0.0', PORT: String(BACKEND_PORT), DEVICE_INGEST_ALLOW_LAN: 'true' },
);
await ensureDemoUser(apiBaseUrl);
await ensureService(
  'frontend',
  FRONTEND_PORT,
  'npm',
  ['--prefix', 'frontend', 'run', 'dev'],
  `http://${lanIp}:${FRONTEND_PORT}/api/status`,
);
await ensureService(
  'glass',
  GLASS_PORT,
  'npm',
  ['--prefix', 'pawtrace-glass', 'run', 'dev'],
  `http://${lanIp}:${GLASS_PORT}/api/status`,
);

const serialPort = detectSerialPort();
if (!shouldSkipSerial) {
  await sendSerialCommands(serialPort, lanIp);
}
runTelemetryTest(lanIp);

openUrl(frontendUrl);
openUrl(glassUrl);

console.log('');
log('ready');
console.log(`Main app:  ${frontendUrl}`);
console.log(`Glass app: ${glassUrl}`);
console.log(`M5 WiFi:  ${HOTSPOT_SSID}`);
console.log(`M5 API:   ${apiBaseUrl}/api/device/telemetry`);
