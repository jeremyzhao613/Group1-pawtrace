import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { CityLayer } from '@/scene/CityLayer';
import { CameraControlsHandle, CameraDirector } from '@/scene/CameraDirector';
import { SceneLights } from '@/scene/SceneLights';
import type { PoiId, PoiRecord } from '@/types';

interface SceneCanvasProps {
  activePoiId: PoiId;
  onPoiSelect: (poiId: PoiId) => void;
  pois: PoiRecord[];
}

export const SceneCanvas = ({
  activePoiId,
  onPoiSelect,
  pois,
}: SceneCanvasProps) => {
  const controlsRef = useRef<CameraControlsHandle>(null);
  const activePoi = pois.find((poi) => poi.id === activePoiId) ?? pois[0];
  const availability = activePoi.network[0];
  const latency = activePoi.network.find((item) => item.suffix === 'ms');

  return (
    <section className="hud-panel relative min-h-[620px] overflow-hidden p-0">
      <div className="scene-mask pointer-events-none absolute inset-0 z-10" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_46%,rgba(0,10,16,0.34)_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(116,230,255,0.16)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(116,230,255,0.08)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-px w-28 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(116,230,255,0.36),transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-28 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(116,230,255,0.36),transparent)]" />

      <div className="pointer-events-none absolute inset-x-5 top-5 z-20 flex items-start justify-between gap-4">
        <div className="max-w-sm rounded-[24px] border border-[var(--line-soft)] bg-black/30 px-4 py-3 backdrop-blur-xl">
          <p className="eyebrow">3D Main Scene</p>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.18em] text-[var(--text-strong)]">
            Sector Core
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            The camera now behaves like a command monitor: active node, live
            transport arcs, and signal overlays stay visually dominant.
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2">
          <span className="hud-chip">Auto orbit</span>
          <span className="hud-chip">R3F + GSAP</span>
          <span className="hud-chip hud-chip--accent">Active: {activePoi.shortLabel}</span>
        </div>
      </div>

      <Canvas
        camera={{ fov: 36, position: [22, 12, 22] }}
        dpr={[1, 1.75]}
        onPointerMissed={() => onPoiSelect('stadium')}
        shadows
      >
        <color attach="background" args={['#04080d']} />
        <fog attach="fog" args={['#04080d', 13, 34]} />

        <SceneLights />
        <CityLayer activePoiId={activePoiId} onPoiSelect={onPoiSelect} pois={pois} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.25}
          dampingFactor={0.08}
          enableDamping
          enablePan={false}
          maxDistance={20}
          maxPolarAngle={1.42}
          minDistance={7}
          minPolarAngle={0.62}
          ref={(controls) => {
            controlsRef.current = controls as CameraControlsHandle;
          }}
        />
        <CameraDirector activePoi={activePoi} controlsRef={controlsRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-4">
        <div className="rounded-[22px] border border-[var(--line-soft)] bg-black/30 px-4 py-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">Focus</p>
            <span className="hud-chip !px-3 !py-1.5 text-[0.62rem]">{activePoi.status}</span>
          </div>
          <p className="mt-2 font-display text-2xl uppercase tracking-[0.18em] text-[var(--text-strong)]">
            {activePoi.name}
          </p>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            {activePoi.statusNote}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="hud-chip !px-3 !py-1.5 text-[0.62rem]">
              Availability {availability.value.toFixed(2)}%
            </span>
            {latency ? (
              <span className="hud-chip !px-3 !py-1.5 text-[0.62rem]">
                Latency {latency.value.toFixed(0)} ms
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden md:flex gap-2">
          {['Tap labels', 'Zoom enabled', 'Reset on empty click'].map((item) => (
            <span key={item} className="hud-chip">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
