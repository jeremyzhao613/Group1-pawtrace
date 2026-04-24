import { spawn } from 'node:child_process';

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Usage: node scripts/with-local-db-url.mjs <command> [...args]');
  process.exit(1);
}

const child = spawn(command, args, {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://pawtrace@localhost:55432/pawtrace',
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
