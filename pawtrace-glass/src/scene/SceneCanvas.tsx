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

  return (
    <section className="hud-panel relative min-h-[620px] overflow-hidden p-0">
      <div className="scene-mask pointer-events-none absolute inset-0 z-10" />

      <div className="pointer-events-none absolute inset-x-5 top-5 z-20 flex items-start justify-between gap-4">
        <div className="max-w-sm rounded-[24px] border border-white/8 bg-black/30 px-4 py-3 backdrop-blur-xl">
          <p className="eyebrow">3D Main Scene</p>
          <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.18em]">
            Venue Core
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Opening dolly lands on the stadium bowl first, then every POI click
            hands the camera to GSAP for a clean refocus.
          </p>
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2">
          <span className="hud-chip">Auto orbit</span>
          <span className="hud-chip">R3F + GSAP</span>
          <span className="hud-chip">Active: {activePoi.shortLabel}</span>
        </div>
      </div>

      <Canvas
        camera={{ fov: 36, position: [22, 12, 22] }}
        dpr={[1, 1.75]}
        onPointerMissed={() => onPoiSelect('stadium')}
        shadows
      >
        <color attach="background" args={['#050403']} />
        <fog attach="fog" args={['#050403', 13, 34]} />

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
        <div className="rounded-[22px] border border-white/8 bg-black/30 px-4 py-3 backdrop-blur-xl">
          <p className="eyebrow">Focus</p>
          <p className="mt-2 font-display text-2xl uppercase tracking-[0.18em]">
            {activePoi.name}
          </p>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            {activePoi.statusNote}
          </p>
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
