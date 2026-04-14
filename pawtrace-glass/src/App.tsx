import { FocusRail } from '@/components/FocusRail';
import { HudHeader } from '@/components/HudHeader';
import { MinimapCard } from '@/components/MinimapCard';
import { Timeline } from '@/components/Timeline';
import { useTwinDashboard } from '@/hooks/useTwinDashboard';
import { InfoPanel } from '@/panels/InfoPanel';
import { SceneCanvas } from '@/scene/SceneCanvas';
import { formatNetworkValue } from '@/utils/format';
import type { DashboardSnapshot } from '@/types';

const deriveRiskTier = (network: DashboardSnapshot['network']) => {
  const availability = network.find((item) => item.label === 'Availability')?.value ?? 100;
  const coverage = network.find((item) => item.label === 'Coverage')?.value ?? 100;
  const latency = network.find((item) => item.suffix === 'ms')?.value ?? 0;

  if (availability < 99.7 || coverage < 96 || latency > 16) {
    return {
      label: 'Elevated',
      note: `Coverage ${coverage.toFixed(1)}% · latency ${latency.toFixed(0)} ms`,
    };
  }

  if (availability < 99.85 || coverage < 97.5 || latency > 13) {
    return {
      label: 'Watch',
      note: `Availability ${availability.toFixed(2)}% with soft pressure detected`,
    };
  }

  return {
    label: 'Nominal',
    note: 'Availability and response remain inside the comfort band',
  };
};

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

  const availability = snapshot.network[0];
  const latency = snapshot.network.find((item) => item.suffix === 'ms');
  const riskTier = deriveRiskTier(snapshot.network);
  const missionCards = [
    {
      label: 'Risk Tier',
      value: riskTier.label,
      note: riskTier.note,
    },
    {
      label: 'Access Mesh',
      value: formatNetworkValue(availability.value, availability.suffix),
      note: availability.note,
    },
    {
      label: 'Edge Latency',
      value: latency ? formatNetworkValue(latency.value, latency.suffix) : 'N/A',
      note: 'Median interactive response',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="ambient-grid absolute inset-0 opacity-55" />
      <div className="data-lattice absolute inset-0 opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(116,230,255,0.12),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(255,177,92,0.1),transparent_22%),radial-gradient(circle_at_50%_72%,rgba(111,243,200,0.08),transparent_26%)]" />
      <div className="scanline-mask pointer-events-none absolute inset-0 opacity-50" />

      <main className="relative z-10 flex min-h-screen flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
        <HudHeader
          eventMeta={eventMeta}
          poiCount={pois.length}
          selectedPoi={selectedPoi}
          snapshot={snapshot}
        />

        <section className="grid flex-1 gap-4 xl:grid-cols-[320px,minmax(0,1fr),380px]">
          <div className="flex flex-col gap-4">
            <section className="hud-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Mission Overview</p>
                  <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.2em] text-[var(--text-strong)]">
                    Command Deck
                  </h2>
                </div>
                <span className="hud-chip hud-chip--accent">Live Sync</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Selected node feeds the scene camera, chart stack, and alert rail.
                Visual intensity now follows live telemetry instead of decorative chrome.
              </p>

              <div className="mt-5 grid gap-3">
                {missionCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[22px] border border-[var(--line-soft)] bg-[var(--panel-soft)] px-4 py-3"
                  >
                    <p className="eyebrow">{card.label}</p>
                    <p className="mt-2 font-display text-2xl uppercase tracking-[0.16em] text-[var(--text-strong)]">
                      {card.value}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      {card.note}
                    </p>
                  </div>
                ))}
              </div>
            </section>

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

          <div className="flex min-w-0 flex-col gap-4">
            <section className="hud-panel px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="hud-chip">Mode: Predictive Twin</span>
                  <span className="hud-chip">Active Node: {selectedPoi.shortLabel}</span>
                  <span className="hud-chip">Program: {eventMeta.city}</span>
                </div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  <span className="status-dot bg-[var(--accent-cyan)]" />
                  Scene feed coherent
                </div>
              </div>
            </section>

            <SceneCanvas
              activePoiId={activePoiId}
              onPoiSelect={setActivePoiId}
              pois={pois}
            />
          </div>

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
