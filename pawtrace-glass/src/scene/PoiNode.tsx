import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ReactNode, useRef } from 'react';
import { Group, Mesh, MeshBasicMaterial } from 'three';
import type { PoiId, PoiRecord } from '@/types';

interface PoiNodeProps {
  active: boolean;
  children: ReactNode;
  onSelect: (poiId: PoiId) => void;
  poi: PoiRecord;
}

export const PoiNode = ({
  active,
  children,
  onSelect,
  poi,
}: PoiNodeProps) => {
  const markerRef = useRef<Group | null>(null);
  const rippleOneRef = useRef<Mesh | null>(null);
  const rippleTwoRef = useRef<Mesh | null>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (markerRef.current) {
      markerRef.current.position.y = 0.08 + Math.sin(elapsed * 1.6 + poi.position[0]) * 0.04;
    }

    const animateRipple = (mesh: Mesh | null, phase: number) => {
      if (!mesh) {
        return;
      }

      const progress = (elapsed * 0.32 + phase) % 1;
      const scale = 1 + progress * 2.2;
      const material = mesh.material as MeshBasicMaterial;

      mesh.scale.set(scale, scale, scale);
      material.opacity = 0.3 * (1 - progress);
    };

    animateRipple(rippleOneRef.current, 0);
    animateRipple(rippleTwoRef.current, 0.5);
  });

  const handleSelect = () => {
    onSelect(poi.id);
  };

  return (
    <group position={poi.position}>
      {children}

      <group ref={markerRef}>
        <mesh
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.44, 0.62, 40]} />
          <meshBasicMaterial color={poi.color} depthWrite={false} transparent opacity={0.85} />
        </mesh>

        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.72, 12]} />
          <meshBasicMaterial color={poi.color} />
        </mesh>

        <mesh
          position={[0, 0.05, 0]}
          ref={rippleOneRef}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.68, 0.74, 40]} />
          <meshBasicMaterial color={poi.color} depthWrite={false} transparent />
        </mesh>

        <mesh
          position={[0, 0.05, 0]}
          ref={rippleTwoRef}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.68, 0.74, 40]} />
          <meshBasicMaterial color={poi.color} depthWrite={false} transparent />
        </mesh>
      </group>

      <Html
        center
        distanceFactor={12}
        occlude={false}
        position={[0, 1.45, 0]}
        transform={false}
      >
        <button
          className={`poi-label ${active ? 'active' : ''}`}
          onClick={handleSelect}
          style={{ pointerEvents: 'auto' }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: poi.color }}
          />
          {poi.shortLabel}
        </button>
      </Html>
    </group>
  );
};
