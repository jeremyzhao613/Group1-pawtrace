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
          Opening dolly transitions into interactive node focus. Each stop is
          selectable and will retarget the camera immediately.
        </p>
      </div>
      <span className="hud-chip">GSAP focus rail</span>
    </div>

    <div className="relative mt-5">
      <div className="absolute left-5 right-5 top-6 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent md:block" />

      <div className="grid gap-3 md:grid-cols-5">
        {stops.map((stop, index) => {
          const isActive = stop.id === activePoiId;

          return (
            <button
              key={stop.id}
              className="relative rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              onClick={() => onSelect(stop.id)}
              style={
                isActive
                  ? {
                      borderColor: 'rgba(214, 167, 90, 0.4)',
                      boxShadow: '0 0 0 1px rgba(214, 167, 90, 0.18) inset',
                    }
                  : undefined
              }
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-xl uppercase tracking-[0.18em] text-[var(--ivory)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-[var(--muted)]">{stop.eta}</span>
              </div>
              <p className="font-display text-2xl uppercase tracking-[0.16em]">
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
