import { formatDelta, formatMetricValue } from '@/utils/format';
import type { MetricItem } from '@/types';

interface MetricCardProps {
  accent: string;
  metric: MetricItem;
}

export const MetricCard = ({ accent, metric }: MetricCardProps) => (
  <div
    className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
    style={{
      boxShadow: `inset 0 1px 0 ${accent}20`,
    }}
  >
    <p className="eyebrow">{metric.label}</p>
    <p className="metric-value mt-3 text-3xl text-[var(--ivory)]">
      {formatMetricValue(metric.value, metric.unit, metric.decimals)}
    </p>
    <div className="mt-3 flex items-center justify-between text-sm">
      <span className="text-[var(--muted)]">vs last pulse</span>
      <span
        className="font-display uppercase tracking-[0.16em]"
        style={{ color: metric.delta >= 0 ? 'var(--success)' : 'var(--danger)' }}
      >
        {formatDelta(metric.delta)}
      </span>
    </div>
  </div>
);
