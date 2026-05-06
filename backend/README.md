# Backend

Express + TypeScript API server for PawTrace. It handles auth, pet data,
telemetry ingest, AI proxy endpoints, monitor APIs, static monitor serving, and
optional built-web serving.

## Important Paths

- `src/index.ts`: server bootstrap.
- `src/registerRoutes.ts`: route registration and API surface.
- `src/config.ts`: environment and runtime config.
- `src/lib/prisma.ts`: Prisma client setup.
- `src/middleware/`: auth, metrics, monitor auth, request context.
- `src/services/`: backend service integrations such as AI.
- `prisma/schema.prisma`: database schema.
- `prisma/seed.ts`: local demo seed data.
- `dist/`: generated TypeScript build output.
- `data/`: local import or SQLite-era data files.

## Commands

```bash
npm run dev --prefix backend
npm run prisma:migrate --prefix backend
npm run db:seed --prefix backend
npm run build --prefix backend
```

For the project-local PostgreSQL database, prefer the root scripts:

```bash
npm run db:local:start
npm run db:migrate:local
npm run db:seed:local
```

