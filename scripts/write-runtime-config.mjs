import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const targetPath = args.find((arg) => !arg.startsWith('--')) || 'frontend/dist/app/runtime-config.js';
const packageTarget = getArgValue('--target') || '';
const DEFAULT_CLOUDFLARE_API_BASE_URL = 'https://pawtrace-api.jeremyzhao613.workers.dev';
const DEFAULT_PUBLIC_APP_URL = 'https://pawtrace.pages.dev';
const requireApiBase = hasFlag('--require-api-base') || hasFlag('--require-api');

await loadEnvFiles(['.env.local', '.env', 'backend/.env.local', 'backend/.env']);

const apiBaseUrl = resolveApiBaseUrl(packageTarget);
const publicAppUrl = resolvePublicAppUrl();
const absoluteTargetPath = path.resolve(process.cwd(), targetPath);

if (requireApiBase && !apiBaseUrl) {
  console.error(
    '[runtime-config] PAWTRACE_API_BASE_URL is required for this build. ' +
    'Set it in the shell or .env, for example: ' +
    'PAWTRACE_API_BASE_URL=https://pawtrace-api.example.workers.dev'
  );
  process.exit(1);
}

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || '').trim();
  if (/^(relative|same-origin|none)$/i.test(trimmed)) return '';
  if (!trimmed) return '';
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
}

function normalizePublicAppUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/i.test(url.protocol)) return '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] || '' : '';
}

function hasFlag(name) {
  return args.includes(name);
}

function resolveApiBaseUrl(target) {
  const explicit = normalizeApiBaseUrl(process.env.PAWTRACE_API_BASE_URL || '');
  if (explicit || process.env.PAWTRACE_API_BASE_URL) return explicit;

  const normalizedTarget = String(target || '').trim().toLowerCase();
  if (['desktop', 'exe', 'dmg'].includes(normalizedTarget)) {
    return 'http://localhost:3000';
  }
  if (['mobile', 'android', 'apk', 'ios'].includes(normalizedTarget)) {
    const lanIp = firstLanIpv4();
    return `http://${lanIp || 'localhost'}:3000`;
  }
  // Cloudflare Pages has no same-origin backend in this project.
  return DEFAULT_CLOUDFLARE_API_BASE_URL;
}

function resolvePublicAppUrl() {
  return normalizePublicAppUrl(process.env.PAWTRACE_PUBLIC_APP_URL || '') || DEFAULT_PUBLIC_APP_URL;
}

async function loadEnvFiles(files) {
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (!existsSync(filePath)) continue;
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = parseEnvValue(rawValue);
    }
  }
}

function parseEnvValue(rawValue) {
  let value = rawValue.trim();
  const commentIndex = value.search(/\s+#/);
  if (commentIndex >= 0) value = value.slice(0, commentIndex).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.replace(/\\n/g, '\n');
}

function firstLanIpv4() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === 'IPv4' && !entry.internal && !entry.address.startsWith('169.254.')) {
        candidates.push(entry.address);
      }
    }
  }
  return candidates.sort((a, b) => privateIpv4Rank(a) - privateIpv4Rank(b))[0] || '';
}

function privateIpv4Rank(address) {
  if (/^192\.168\./.test(address)) return 0;
  if (/^10\./.test(address)) return 1;
  const secondOctet = Number(address.split('.')[1]);
  if (/^172\./.test(address) && secondOctet >= 16 && secondOctet <= 31) return 2;
  return 3;
}

await mkdir(path.dirname(absoluteTargetPath), { recursive: true });
await writeFile(
  absoluteTargetPath,
  [
    `window.PAWTRACE_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};`,
    `window.PAWTRACE_PUBLIC_APP_URL = ${JSON.stringify(publicAppUrl)};`,
    '',
  ].join('\n'),
  'utf8'
);

const displayValue = apiBaseUrl || '(relative /api)';
const targetLabel = packageTarget ? ` target=${packageTarget}` : '';
console.log(`[runtime-config]${targetLabel} ${targetPath} -> api=${displayValue} app=${publicAppUrl}`);
