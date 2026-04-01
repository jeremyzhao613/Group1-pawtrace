function createMetrics() {
  return {
    startedAt: Date.now(),
    requests: 0,
    routes: {},
  };
}

function createMetricsMiddleware(metrics) {
  return (req, res, next) => {
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
        console.warn(`[slow] ${req.method} ${key} ${durationMs.toFixed(1)}ms`);
      }
    });
    next();
  };
}

module.exports = { createMetrics, createMetricsMiddleware };
