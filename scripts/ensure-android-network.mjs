import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const androidMainRoot = path.join(repoRoot, 'frontend', 'android', 'app', 'src', 'main');
const manifestPath = path.join(androidMainRoot, 'AndroidManifest.xml');
const networkConfigPath = path.join(androidMainRoot, 'res', 'xml', 'network_security_config.xml');

if (!existsSync(manifestPath)) {
  console.warn(`[android-network] skipped; missing ${path.relative(repoRoot, manifestPath)}`);
  process.exit(0);
}

let manifest = await readFile(manifestPath, 'utf8');
manifest = ensureApplicationAttribute(
  manifest,
  'android:networkSecurityConfig',
  '@xml/network_security_config'
);
manifest = ensureApplicationAttribute(
  manifest,
  'android:usesCleartextTraffic',
  'true'
);
manifest = ensurePermission(manifest, 'android.permission.INTERNET');
manifest = ensurePermission(manifest, 'android.permission.ACCESS_NETWORK_STATE');

await writeFile(manifestPath, manifest, 'utf8');
await mkdir(path.dirname(networkConfigPath), { recursive: true });
await writeFile(
  networkConfigPath,
  `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
`,
  'utf8'
);

console.log('[android-network] INTERNET + LAN HTTP cleartext enabled');

function ensureApplicationAttribute(xml, name, value) {
  if (new RegExp(`\\s${escapeRegExp(name)}=`).test(xml)) return xml;
  return xml.replace(/<application\b[\s\S]*?>/, (match) => {
    return match.replace(/>$/, `\n        ${name}="${value}">`);
  });
}

function ensurePermission(xml, permission) {
  if (xml.includes(`android:name="${permission}"`)) return xml;
  const tag = `    <uses-permission android:name="${permission}" />\n`;
  return xml.replace('</manifest>', `${tag}</manifest>`);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
