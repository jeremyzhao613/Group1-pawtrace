import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const targetPath = process.argv[2] || 'frontend/dist/app/runtime-config.js';
const apiBaseUrl = normalizeApiBaseUrl(process.env.PAWTRACE_API_BASE_URL || '');
const absoluteTargetPath = path.resolve(process.cwd(), targetPath);

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return trimmed.replace(/\/+$/, '');
}

await mkdir(path.dirname(absoluteTargetPath), { recursive: true });
await writeFile(
  absoluteTargetPath,
  `window.PAWTRACE_API_BASE_URL = ${JSON.stringify(apiBaseUrl)};\n`,
  'utf8'
);

const displayValue = apiBaseUrl || '(relative /api)';
console.log(`[runtime-config] ${targetPath} -> ${displayValue}`);
