# Cloudflare

Cloudflare deployment source. Root `wrangler*.jsonc` files define the Pages and
Worker deployment targets.

## Important Paths

- `pawtrace-api/worker.js`: Cloudflare Worker API implementation.
- `pawtrace-api/schema.sql`: D1 schema.
- `pawtrace-api/wrangler.toml`: Worker-local config inside the API folder.

## Root Commands

```bash
npm run deploy:cloudflare:full
npm run deploy:cloudflare:pages
npm run deploy:cloudflare:api
npm run cloudflare:fix-access
```

See `docs/cloudflare-deployment.md` for the full deployment architecture.

