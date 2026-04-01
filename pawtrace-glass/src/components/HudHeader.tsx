import { useLiveClock } from '@/hooks/useLiveClock';
import { formatClock, formatLongDate } from '@/utils/format';
import type { DashboardSnapshot, EventMeta, PoiRecord } from '@/types';

interface HudHeaderProps {
  eventMeta: EventMeta;
  selectedPoi: PoiRecord;
  snapshot: DashboardSnapshot;
}

export const HudHeader = ({
  eventMeta,
  selectedPoi,
  snapshot,
}: HudHeaderProps) => {
  const currentTime = useLiveClock();

  return (
    <header className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr),minmax(0,1fr)]">
      <section className="hud-panel px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Live Operations Wall</p>
            <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-end xl:gap-5">
              <h1 className="font-display text-4xl uppercase tracking-[0.18em] text-[var(--ivory)] md:text-5xl">
                {eventMeta.eventName}
              </h1>
              <span className="hud-chip w-fit">
                Focus: {selectedPoi.shortLabel}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)] md:text-base">
              {eventMeta.venue} · {eventMeta.city} · {eventMeta.program}
            </p>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="eyebrow">Clock</p>
            <p className="mt-2 font-display text-3xl uppercase tracking-[0.18em]">
              {formatClock(currentTime)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {formatLongDate(currentTime)} · {eventMeta.openingWindow}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {snapshot.hero.map((item) => (
          <div key={item.label} className="hud-panel px-5 py-4">
            <p className="eyebrow">{item.label}</p>
            <p className="metric-value mt-3 text-3xl text-[var(--ivory)]">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.note}</p>
          </div>
        ))}
      </section>
    </header>
  );
};
