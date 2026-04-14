import type { PoiId, TimelineStop } from '@/types';

interface TimelineProps {
  activePoiId: PoiId;
  onSelect: (poiId: PoiId) => void;
  stops: TimelineStop[];
}

export const Timeline = ({
  activePoiId,
  onSelect,
  stops,
}: TimelineProps) => (
  <nav className="hud-panel px-4 py-4 md:px-5">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="eyebrow">Camera Timeline</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Opening orbit transitions into node lock. Each stop is selectable and
          will retarget the scene instantly.
        </p>
      </div>
      <span className="hud-chip hud-chip--accent">GSAP focus rail</span>
    </div>

    <div className="relative mt-5">
      <div className="absolute left-5 right-5 top-6 hidden h-px bg-gradient-to-r from-transparent via-[rgba(116,230,255,0.26)] to-transparent md:block" />

      <div className="grid gap-3 md:grid-cols-5">
        {stops.map((stop, index) => {
          const isActive = stop.id === activePoiId;

          return (
            <button
              key={stop.id}
              className="relative rounded-[22px] border border-[var(--line-soft)] bg-[var(--panel-soft)] p-4 text-left transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              onClick={() => onSelect(stop.id)}
              style={
                isActive
                  ? {
                      borderColor: 'rgba(116, 230, 255, 0.45)',
                      boxShadow: '0 0 0 1px rgba(116, 230, 255, 0.22) inset',
                    }
                  : undefined
              }
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-xl uppercase tracking-[0.18em] text-[var(--text-strong)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[var(--muted)]">{stop.eta}</span>
              </div>
              <p className="font-display text-2xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                {stop.label}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{stop.note}</p>
            </button>
          );
        })}
      </div>
    </div>
  </nav>
);
