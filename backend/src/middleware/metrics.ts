import type { Request, Response, NextFunction } from 'express';

export type RouteStat = {
  count: number;
  sumMs: number;
  maxMs: number;
  status: Record<number, number>;
};

export type AppMetrics = {
  startedAt: number;
  requests: number;
  routes: Record<string, RouteStat>;
};

export function createMetrics(): AppMetrics {
  return {
    startedAt: Date.now(),
    requests: 0,
    routes: {},
  };
}

export function createMetricsMiddleware(metrics: AppMetrics) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      metrics.requests += 1;
      const key = req.path.split('?')[0] || '/';
      if (!metrics.routes[key]) {
        metrics.routes[key] = { count: 0, sumMs: 0, maxMs: 0, status: {} };
      }
      const routeStat = metrics.routes[key];
      routeStat.count += 1;
      routeStat.sumMs += durationMs;
      routeStat.maxMs = Math.max(routeStat.maxMs, durationMs);
      routeStat.status[res.statusCode] = (routeStat.status[res.statusCode] || 0) + 1;
      if (durationMs > 1200) {
        const rid = req.requestId ? ` rid=${req.requestId}` : '';
        console.warn(`[slow] ${req.method} ${key} ${durationMs.toFixed(1)}ms${rid}`);
      }
    });
    next();
  };
}
