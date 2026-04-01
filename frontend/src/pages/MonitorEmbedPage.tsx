/**
 * 开发时 Monitor 仍为 /monitor 静态页；此处提供带 token 的入口说明。
 */
export function MonitorEmbedPage() {
  const token = import.meta.env.VITE_MONITOR_API_TOKEN || '';
  const src = token ? `/monitor/index.html?token=${encodeURIComponent(token)}` : '/monitor/index.html';
  return (
    <div className="space-y-2 h-[calc(100vh-6rem)]">
      <h2 className="text-lg font-semibold text-dark">Monitor</h2>
      <p className="text-xs text-gray-600">
        若后端设置了 MONITOR_API_TOKEN，请在 .env 中配置 VITE_MONITOR_API_TOKEN 或在 URL 加 ?token=
      </p>
      <iframe title="monitor" src={src} className="w-full flex-1 min-h-[400px] rounded-2xl border border-white/60 bg-white/40" />
    </div>
  );
}
