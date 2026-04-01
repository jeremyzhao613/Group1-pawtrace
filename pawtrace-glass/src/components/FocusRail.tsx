import type { PoiId, PoiRecord } from '@/types';

interface FocusRailProps {
  activePoiId: PoiId;
  onSelect: (poiId: PoiId) => void;
  pois: PoiRecord[];
}

export const FocusRail = ({
  activePoiId,
  onSelect,
  pois,
}: FocusRailProps) => {
  const activePoi = pois.find((poi) => poi.id === activePoiId) ?? pois[0];

  return (
    <section className="hud-panel p-5">
      <p className="eyebrow">Scene Targets</p>
      <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.2em]">
        Orbit Rail
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Select any operational node to redirect the camera, refresh charts,
        and retune the district telemetry story.
      </p>

      <div className="mt-5 space-y-3">
        {pois.map((poi) => {
          const isActive = poi.id === activePoiId;

          return (
            <button
              key={poi.id}
              className="w-full rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-left transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              onClick={() => onSelect(poi.id)}
              style={
                isActive
                  ? {
                      borderColor: `${poi.color}55`,
                      boxShadow: `0 0 0 1px ${poi.color}28 inset, 0 16px 36px rgba(0, 0, 0, 0.16)`,
                    }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: poi.color }}
                    />
                    <span className="font-display text-xl uppercase tracking-[0.18em]">
                      {poi.shortLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {poi.category}
                  </p>
                </div>

                <span className="hud-chip !px-3 !py-2 text-[0.66rem]">
                  {poi.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-[rgba(246,242,235,0.72)]">
                {poi.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[22px] border border-white/8 bg-[var(--panel-strong)] p-4">
        <p className="eyebrow">Active Focus</p>
        <p className="mt-2 font-display text-2xl uppercase tracking-[0.18em]">
          {activePoi.name}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {activePoi.statusNote}
        </p>
      </div>
    </section>
  );
};
