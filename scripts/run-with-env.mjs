#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const commandIndex = args.indexOf('--');

if (commandIndex < 0 || commandIndex === args.length - 1) {
  console.error('Usage: node scripts/run-with-env.mjs [--require NAME] -- <command> [args...]');
  process.exit(2);
}

const options = parseOptions(args.slice(0, commandIndex));
const command = args.slice(commandIndex + 1);

await loadEnvFiles(['.env.local', '.env', 'backend/.env.local', 'backend/.env']);

for (const [key, value] of Object.entries(options.defaults)) {
  if (process.env[key] === undefined || process.env[key] === '') {
    process.env[key] = value;
  }
}

for (const key of options.required) {
  const value = String(process.env[key] || '').trim();
  if (!value || isExplicitRelativeApiValue(key, value)) {
    console.error(`[run-with-env] ${key} is required. Set it in the shell or .env.`);
    process.exit(1);
  }
}

const child = spawn(command[0], command.slice(1), {
  cwd: process.cwd(),
  env: process.env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[run-with-env] command stopped by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});

function parseOptions(optionArgs) {
  const required = [];
  const defaults = {};
  for (let index = 0; index < optionArgs.length; index += 1) {
    const arg = optionArgs[index];
    if (arg === '--require') {
      const key = optionArgs[index + 1];
      if (!key) {
        console.error('[run-with-env] --require needs an environment variable name');
        process.exit(2);
      }
      required.push(key);
      index += 1;
      continue;
    }
    if (arg === '--default') {
      const assignment = optionArgs[index + 1] || '';
      const separatorIndex = assignment.indexOf('=');
      if (separatorIndex <= 0) {
        console.error('[run-with-env] --default needs KEY=VALUE');
        process.exit(2);
      }
      defaults[assignment.slice(0, separatorIndex)] = assignment.slice(separatorIndex + 1);
      index += 1;
      continue;
    }
    console.error(`[run-with-env] unknown option: ${arg}`);
    process.exit(2);
  }
  return { required, defaults };
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

function isExplicitRelativeApiValue(key, value) {
  return key === 'PAWTRACE_API_BASE_URL' && /^(relative|same-origin|none)$/i.test(value);
}
