import { useLiveClock } from '@/hooks/useLiveClock';
import { formatClock, formatLongDate } from '@/utils/format';
import type { DashboardSnapshot, EventMeta, PoiRecord } from '@/types';

interface HudHeaderProps {
  eventMeta: EventMeta;
  poiCount: number;
  selectedPoi: PoiRecord;
  snapshot: DashboardSnapshot;
}

export const HudHeader = ({
  eventMeta,
  poiCount,
  selectedPoi,
  snapshot,
}: HudHeaderProps) => {
  const currentTime = useLiveClock();
  const heroPulse =
    snapshot.hero.find((item) => item.label === 'Peak Throughput') ?? snapshot.hero[0];

  return (
    <header className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(0,1fr)]">
      <section className="hud-panel px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="hud-chip hud-chip--accent">District Digital Twin</span>
            <span className="hud-chip">Nodes {poiCount}</span>
            <span className="hud-chip">Focus {selectedPoi.shortLabel}</span>
          </div>
          <span className="eyebrow">Doors window · {eventMeta.openingWindow}</span>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr),260px]">
          <div className="max-w-3xl">
            <p className="eyebrow">Mission Control</p>
            <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.2em] text-[var(--text-strong)] md:text-5xl">
              {eventMeta.eventName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-base">
              {eventMeta.venue} · {eventMeta.city} · {eventMeta.program}
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--panel-soft)] px-4 py-3">
                <p className="eyebrow">Target</p>
                <p className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  {selectedPoi.name}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {selectedPoi.category}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--panel-soft)] px-4 py-3">
                <p className="eyebrow">Node Status</p>
                <p className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  {selectedPoi.status}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {selectedPoi.statusNote}
                </p>
              </div>

              <div className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--panel-soft)] px-4 py-3">
                <p className="eyebrow">Program Window</p>
                <p className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  {eventMeta.dateLabel}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {eventMeta.openingWindow} · {heroPulse?.value ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(116,230,255,0.08),transparent_40%),var(--panel-soft)] px-5 py-4">
            <p className="eyebrow">Clock Sync</p>
            <p className="mt-2 font-display text-4xl uppercase tracking-[0.2em] text-[var(--text-strong)]">
              {formatClock(currentTime)}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {formatLongDate(currentTime)} · {eventMeta.city}
            </p>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[20px] border border-[var(--line-soft)] bg-black/20 px-4 py-3">
                <p className="eyebrow">Ops Layer</p>
                <p className="mt-2 font-display text-xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  Predictive Routing
                </p>
              </div>
              <div className="rounded-[20px] border border-[var(--line-soft)] bg-black/20 px-4 py-3">
                <p className="eyebrow">Scene Feed</p>
                <p className="mt-2 font-display text-xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  Autonomous Camera
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {snapshot.hero.map((item) => (
          <div key={item.label} className="hud-panel px-5 py-4">
            <p className="eyebrow">{item.label}</p>
            <p className="metric-value mt-3 text-3xl text-[var(--text-strong)]">
              {item.value}
            </p>
            <div className="mt-3 h-px bg-[linear-gradient(90deg,rgba(116,230,255,0.32),transparent)]" />
            <p className="mt-3 text-sm text-[var(--muted)]">{item.note}</p>
          </div>
        ))}
      </section>
    </header>
  );
};
