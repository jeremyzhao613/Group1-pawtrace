import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const domains = [
  { domain: 'pawtrace.pages.dev', fallbackIp: '172.66.47.167' },
  { domain: 'pawtrace-glass.pages.dev', fallbackIp: '172.66.47.67' },
];

const markerStart = '# BEGIN PAWTRACE CLOUDFLARE PAGES';
const markerEnd = '# END PAWTRACE CLOUDFLARE PAGES';
const apply = process.argv.includes('--apply');

const mappings = domains.map(({ domain, fallbackIp }) => ({
  domain,
  fallbackIp,
  current: resolveSystem(domain),
  cloudflare: resolvePublic(domain),
}));

console.log('[cloudflare-access] DNS check');
for (const item of mappings) {
  console.log(`- ${item.domain}`);
  console.log(`  system:     ${item.current.join(', ') || '(none)'}`);
  console.log(`  cloudflare: ${item.cloudflare.join(', ') || `(fallback ${item.fallbackIp})`}`);
}

const hostsBlock = [
  markerStart,
  ...mappings.map(({ domain, fallbackIp, cloudflare }) => `${cloudflare[0] || fallbackIp} ${domain}`),
  markerEnd,
  '',
].join('\n');

if (!apply) {
  console.log('\n[cloudflare-access] To apply on macOS:');
  console.log('sudo node ./scripts/fix-cloudflare-pages-access.mjs --apply');
  process.exit(0);
}

if (typeof process.getuid === 'function' && process.getuid() !== 0) {
  console.error('[cloudflare-access] --apply must run with sudo because /etc/hosts is owned by root.');
  process.exit(1);
}

const hostsPath = '/etc/hosts';
const original = readFileSync(hostsPath, 'utf8');
const cleaned = original
  .replace(new RegExp(`\\n?${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}\\n?`, 'g'), '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trimEnd();

writeFileSync(hostsPath, `${cleaned}\n\n${hostsBlock}`, 'utf8');
flushDnsCache();

console.log('[cloudflare-access] /etc/hosts updated and DNS cache flushed.');
for (const item of mappings) {
  console.log(`https://${item.domain}`);
}

function resolveSystem(domain) {
  return dig(['+time=3', '+tries=1', '+short', domain]);
}

function resolvePublic(domain) {
  return dig(['@1.1.1.1', '+time=3', '+tries=1', '+short', domain]).filter((value) => !value.endsWith('.'));
}

function dig(args) {
  try {
    return execFileSync('dig', args, { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function flushDnsCache() {
  spawnSync('dscacheutil', ['-flushcache'], { stdio: 'ignore' });
  spawnSync('killall', ['-HUP', 'mDNSResponder'], { stdio: 'ignore' });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
