import { FocusRail } from '@/components/FocusRail';
import { HudHeader } from '@/components/HudHeader';
import { MinimapCard } from '@/components/MinimapCard';
import { Timeline } from '@/components/Timeline';
import { useTwinDashboard } from '@/hooks/useTwinDashboard';
import { InfoPanel } from '@/panels/InfoPanel';
import { SceneCanvas } from '@/scene/SceneCanvas';

export default function App() {
  const {
    activePoiId,
    eventMeta,
    pois,
    selectedPoi,
    setActivePoiId,
    snapshot,
    timelineStops,
  } = useTwinDashboard();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="ambient-grid absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,167,90,0.09),transparent_36%),radial-gradient(circle_at_bottom,rgba(116,198,192,0.09),transparent_26%)]" />

      <main className="relative z-10 flex min-h-screen flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <HudHeader
          eventMeta={eventMeta}
          selectedPoi={selectedPoi}
          snapshot={snapshot}
        />

        <section className="grid flex-1 gap-4 xl:grid-cols-[300px,minmax(0,1fr),360px]">
          <div className="flex flex-col gap-4">
            <FocusRail
              activePoiId={activePoiId}
              onSelect={setActivePoiId}
              pois={pois}
            />
            <MinimapCard
              activePoiId={activePoiId}
              onSelect={setActivePoiId}
              pois={pois}
            />
          </div>

          <SceneCanvas
            activePoiId={activePoiId}
            onPoiSelect={setActivePoiId}
            pois={pois}
          />

          <InfoPanel poi={selectedPoi} snapshot={snapshot} />
        </section>

        <Timeline
          activePoiId={activePoiId}
          onSelect={setActivePoiId}
          stops={timelineStops}
        />
      </main>
    </div>
  );
}
