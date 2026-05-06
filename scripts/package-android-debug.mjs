import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const androidRoot = path.join(repoRoot, 'frontend', 'android');

const javaHome = findFirstExisting([
  process.env.JAVA_HOME,
  '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
  '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
  '/Library/Java/JavaVirtualMachines/openjdk-21.jdk/Contents/Home',
]);

const androidHome = findFirstExisting([
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(os.homedir(), 'Library', 'Android', 'sdk'),
]);

if (!javaHome) {
  fail('JDK 21 was not found. Install it with `brew install openjdk@21` or set JAVA_HOME.');
}

if (!androidHome) {
  fail('Android SDK was not found. Install command-line tools and set ANDROID_HOME.');
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  PATH: [
    path.join(javaHome, 'bin'),
    path.join(androidHome, 'platform-tools'),
    path.join(androidHome, 'cmdline-tools', 'latest', 'bin'),
    process.env.PATH || '',
  ].join(path.delimiter),
};

run('npm', ['run', 'package:android'], repoRoot, env);
run('./gradlew', ['assembleDebug'], androidRoot, env);

console.log('[apk] frontend/android/app/build/outputs/apk/debug/app-debug.apk');

function findFirstExisting(candidates) {
  return candidates.filter(Boolean).find((candidate) => existsSync(candidate));
}

function run(command, args, cwd, env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function fail(message) {
  console.error(`[apk] ${message}`);
  process.exit(1);
}
