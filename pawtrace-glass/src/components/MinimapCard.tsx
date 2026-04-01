import type { PoiId, PoiRecord } from '@/types';

interface MinimapCardProps {
  activePoiId: PoiId;
  onSelect: (poiId: PoiId) => void;
  pois: PoiRecord[];
}

export const MinimapCard = ({
  activePoiId,
  onSelect,
  pois,
}: MinimapCardProps) => {
  const stadiumPoi = pois.find((poi) => poi.id === 'stadium') ?? pois[0];
  const activePoi = pois.find((poi) => poi.id === activePoiId) ?? stadiumPoi;

  return (
    <section className="hud-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Mini Map</p>
          <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.18em]">
            City Mesh
          </h3>
        </div>
        <span className="hud-chip">{pois.length} nodes</span>
      </div>

      <div className="relative mt-5 aspect-[1.06] overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(214,167,90,0.14),transparent_58%)]" />
        <div className="ambient-grid absolute inset-0 opacity-70" />

        <svg className="absolute inset-0 h-full w-full">
          {pois
            .filter((poi) => poi.id !== 'stadium')
            .map((poi) => (
              <line
                key={poi.id}
                x1={`${stadiumPoi.mapPosition[0]}%`}
                y1={`${stadiumPoi.mapPosition[1]}%`}
                x2={`${poi.mapPosition[0]}%`}
                y2={`${poi.mapPosition[1]}%`}
                stroke={poi.color}
                strokeDasharray="5 7"
                strokeOpacity="0.55"
              />
            ))}
        </svg>

        {pois.map((poi) => {
          const isActive = poi.id === activePoiId;

          return (
            <button
              key={poi.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
              onClick={() => onSelect(poi.id)}
              style={{
                left: `${poi.mapPosition[0]}%`,
                top: `${poi.mapPosition[1]}%`,
              }}
            >
              <span
                className="rounded-full border border-white/20"
                style={{
                  width: isActive ? 18 : 12,
                  height: isActive ? 18 : 12,
                  backgroundColor: poi.color,
                  boxShadow: `0 0 24px ${poi.color}`,
                }}
              />
              <span className="font-display text-[0.72rem] uppercase tracking-[0.22em] text-[rgba(246,242,235,0.75)]">
                {poi.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/8 bg-[var(--panel-strong)] p-4">
        <p className="eyebrow">Selected Node</p>
        <p className="mt-2 font-display text-2xl uppercase tracking-[0.18em]">
          {activePoi.name}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {activePoi.overview}
        </p>
      </div>
    </section>
  );
};
