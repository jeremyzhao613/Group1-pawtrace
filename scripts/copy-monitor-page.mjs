import { cp, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const monitorDir = path.join(rootDir, 'monitor');
const outputDir = path.join(rootDir, 'frontend', 'dist', 'monitor');

await mkdir(outputDir, { recursive: true });
await copyFile(path.join(monitorDir, 'index.html'), path.join(outputDir, 'index.html'));
await cp(path.join(monitorDir, 'assets'), path.join(outputDir, 'assets'), {
  recursive: true,
  force: true,
});

console.log(`[monitor] ${outputDir}`);
