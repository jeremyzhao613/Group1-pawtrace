/**
 * 开发时 Monitor 仍为 /monitor 静态页；此处提供带 token 的入口说明。
 */
import { LiquidPageHeader } from '@/components/LiquidPageHeader';

export function MonitorEmbedPage() {
  const token = import.meta.env.VITE_MONITOR_API_TOKEN || '';
  const src = token ? `/monitor/index.html?token=${encodeURIComponent(token)}` : '/monitor/index.html';
  return (
    <div className="space-y-2 h-[calc(100vh-6rem)]">
      <LiquidPageHeader
        eyebrow="Monitor Glass"
        title="Monitor"
        description="监控页保留嵌入式结构，但外层容器改成更像系统浮窗的玻璃框体。"
        stats={[
          { label: 'Token', value: token ? 'Bound' : 'Optional' },
          { label: 'Mode', value: 'Embed' },
        ]}
      />
      <p className="text-xs text-gray-600">
        若后端设置了 MONITOR_API_TOKEN，请在 .env 中配置 VITE_MONITOR_API_TOKEN 或在 URL 加 ?token=
      </p>
      <iframe title="monitor" src={src} className="liquid-monitor-frame w-full flex-1 min-h-[400px] rounded-2xl" />
    </div>
  );
}
