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
  const activePoiIndex = pois.findIndex((poi) => poi.id === activePoi.id) + 1;

  return (
    <section className="hud-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Scene Targets</p>
          <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.2em] text-[var(--text-strong)]">
            Target Matrix
          </h2>
        </div>
        <span className="hud-chip">Camera Rail</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        Each node re-centers the scene, promotes the relevant diagnostics, and
        updates the live command summary.
      </p>

      <div className="mt-5 space-y-3">
        {pois.map((poi, index) => {
          const isActive = poi.id === activePoiId;

          return (
            <button
              key={poi.id}
              className="group w-full rounded-[24px] border border-[var(--line-soft)] bg-[var(--panel-soft)] p-4 text-left transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
              onClick={() => onSelect(poi.id)}
              style={
                isActive
                  ? {
                      borderColor: `${poi.color}88`,
                      boxShadow: `0 0 0 1px ${poi.color}30 inset, 0 20px 44px rgba(0, 0, 0, 0.28)`,
                    }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-0.5 font-display text-xl uppercase tracking-[0.2em] text-[var(--muted-strong)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{ backgroundColor: poi.color, color: poi.color }}
                      />
                      <span className="font-display text-xl uppercase tracking-[0.18em] text-[var(--text-strong)]">
                        {poi.shortLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {poi.category}
                    </p>
                  </div>
                </div>

                <span className="hud-chip !px-3 !py-2 text-[0.66rem]">
                  {poi.status}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-[rgba(223,240,247,0.72)]">
                {poi.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="hud-chip !px-3 !py-1.5 text-[0.62rem]">
                  Sector {Math.round(poi.mapPosition[0])}-{Math.round(poi.mapPosition[1])}
                </span>
                <span className="hud-chip !px-3 !py-1.5 text-[0.62rem]">
                  Model {poi.model}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[24px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(116,230,255,0.08),transparent_55%),var(--panel-strong)] p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow">Active Focus</p>
          <span className="font-display text-sm uppercase tracking-[0.2em] text-[var(--muted-strong)]">
            Slot {String(activePoiIndex).padStart(2, '0')}
          </span>
        </div>
        <p className="mt-2 font-display text-2xl uppercase tracking-[0.18em] text-[var(--text-strong)]">
          {activePoi.name}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {activePoi.statusNote}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-[var(--line-soft)] bg-black/20 px-3 py-2.5">
            <p className="eyebrow">Camera Anchor</p>
            <p className="mt-2 font-display text-lg uppercase tracking-[0.16em] text-[var(--text-strong)]">
              {activePoi.focusTarget[0].toFixed(1)} / {activePoi.focusTarget[2].toFixed(1)}
            </p>
          </div>
          <div className="rounded-[18px] border border-[var(--line-soft)] bg-black/20 px-3 py-2.5">
            <p className="eyebrow">Map Sector</p>
            <p className="mt-2 font-display text-lg uppercase tracking-[0.16em] text-[var(--text-strong)]">
              {activePoi.mapPosition[0]}% · {activePoi.mapPosition[1]}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
