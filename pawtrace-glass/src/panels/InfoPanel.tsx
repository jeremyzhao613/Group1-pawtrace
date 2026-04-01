import { ChartPanel } from '@/panels/ChartPanel';
import { MetricCard } from '@/panels/MetricCard';
import { buildAvailabilityOption, buildThroughputOption } from '@/utils/chartOptions';
import { formatNetworkValue } from '@/utils/format';
import type { DashboardSnapshot, PoiRecord } from '@/types';

interface InfoPanelProps {
  poi: PoiRecord;
  snapshot: DashboardSnapshot;
}

const getBarWidth = (value: number, suffix: string) => {
  if (suffix === '%') {
    return Math.max(8, Math.min(100, value));
  }

  if (suffix === 'ms') {
    return Math.max(16, Math.min(100, 100 - value * 4));
  }

  return Math.max(10, Math.min(100, value * 10));
};

export const InfoPanel = ({ poi, snapshot }: InfoPanelProps) => (
  <aside className="flex h-full flex-col gap-4 overflow-y-auto pr-1 subtle-scrollbar">
    <section className="hud-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{poi.name} Overview</p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.18em]">
            {poi.category}
          </h2>
        </div>
        <span className="hud-chip !px-3 !py-2 text-[0.66rem]">{poi.status}</span>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        {poi.overview}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} accent={poi.color} metric={metric} />
        ))}
      </div>
    </section>

    <section className="hud-panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Network Snapshot</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Real-time access, coverage, and latency posture with auto refresh
            every 4.2 seconds.
          </p>
        </div>
        <span className="hud-chip !px-3 !py-2 text-[0.66rem]">Auto pulse</span>
      </div>

      <div className="mt-5 space-y-4">
        {snapshot.network.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[rgba(246,242,235,0.78)]">{item.label}</span>
              <span className="font-display uppercase tracking-[0.14em] text-[var(--ivory)]">
                {formatNetworkValue(item.value, item.suffix)}
              </span>
            </div>

            <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${getBarWidth(item.value, item.suffix)}%`,
                  background: `linear-gradient(90deg, ${poi.color}, rgba(246, 239, 230, 0.9))`,
                }}
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
        <p className="eyebrow">Operational Alerts</p>
        <div className="mt-4 space-y-3">
          {snapshot.alerts.map((alert) => (
            <div key={alert} className="flex items-start gap-3">
              <span
                className="mt-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: poi.color }}
              />
              <p className="text-sm leading-6 text-[rgba(246,242,235,0.78)]">
                {alert}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <ChartPanel
      option={buildThroughputOption(snapshot.throughput, poi.color)}
      subtitle="Rolling edge throughput by focus zone"
      title="Throughput Chart"
    />
    <ChartPanel
      option={buildAvailabilityOption(snapshot.availability, poi.color)}
      subtitle="Availability profile across the latest sample window"
      title="Availability Chart"
    />
  </aside>
);
