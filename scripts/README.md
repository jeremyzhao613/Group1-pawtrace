# Scripts

Automation helpers used by local development, deployment, packaging, and M5Stack
testing. Prefer running these through the root `package.json` scripts when a
matching npm command exists.

## Groups

- Local database: `local-db.sh`, `with-local-db-url.mjs`
- Environment setup: `ensure-backend-env.mjs`
- Runtime config: `write-runtime-config.mjs`, `run-with-env.mjs`
- Cloudflare access: `fix-cloudflare-pages-access.mjs`
- Monitor build: `copy-monitor-page.mjs`
- Android packaging: `ensure-android-network.mjs`, `package-android-debug.mjs`
- M5Stack workflow: `connect-m5stack-one-click.mjs`, `test-m5stack-telemetry.mjs`, `stream-m5stack-telemetry.mjs`

## Common Commands

```bash
npm run local:prepare
npm run cloudflare:fix-access
npm run package:apk:debug
npm run connect:m5
npm run test:m5
npm run live:m5
```

