import { Html, Line, Sparkles } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { PoiNode } from '@/scene/PoiNode';
import { StadiumModel } from '@/scene/StadiumModel';
import type { PoiId, PoiRecord } from '@/types';

interface CityLayerProps {
  activePoiId: PoiId;
  onPoiSelect: (poiId: PoiId) => void;
  pois: PoiRecord[];
}

const cityBlocks = [
  { position: [-10.8, 0.9, -9.2], size: [1.2, 1.8, 1.2] },
  { position: [-8.9, 1.2, -9.6], size: [1.4, 2.4, 1.5] },
  { position: [-6.2, 0.7, -10.4], size: [1.1, 1.4, 1.1] },
  { position: [-2.1, 0.85, -9.7], size: [1.3, 1.7, 1.2] },
  { position: [3.2, 1.5, -9.9], size: [1.8, 3.0, 1.4] },
  { position: [6.4, 1.1, -8.8], size: [1.3, 2.2, 1.2] },
  { position: [9.1, 0.8, -7.2], size: [1.1, 1.6, 1.1] },
  { position: [-11.4, 1.1, -3.8], size: [1.4, 2.2, 1.4] },
  { position: [-11.9, 0.9, 1.5], size: [1.1, 1.7, 1.1] },
  { position: [-9.8, 1.3, 4.6], size: [1.5, 2.6, 1.5] },
  { position: [-7.9, 0.8, 10.4], size: [1.2, 1.6, 1.2] },
  { position: [-1.2, 1.4, 10.7], size: [1.6, 2.8, 1.5] },
  { position: [5.6, 1.2, 10.5], size: [1.4, 2.3, 1.3] },
  { position: [10.4, 0.9, 8.8], size: [1.1, 1.9, 1.1] },
  { position: [11.2, 1.2, 2.8], size: [1.3, 2.4, 1.2] },
  { position: [10.5, 0.8, -1.6], size: [1.2, 1.6, 1.1] },
];

const stopEvent = (event: ThreeEvent<MouseEvent>) => {
  event.stopPropagation();
};

const PoiStructure = ({ poi }: { poi: PoiRecord }) => {
  switch (poi.model) {
    case 'airport':
      return (
        <group>
          <mesh position={[0, 0.12, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 1.1]} />
            <meshStandardMaterial color="#14100d" metalness={0.18} roughness={0.78} />
          </mesh>
          <mesh castShadow position={[0.4, 0.28, 0]}>
            <boxGeometry args={[1.4, 0.32, 0.6]} />
            <meshStandardMaterial color="#1f1812" metalness={0.42} roughness={0.45} />
          </mesh>
          <mesh castShadow position={[-0.9, 0.12, 0]}>
            <boxGeometry args={[0.35, 0.18, 0.75]} />
            <meshStandardMaterial color="#f6efe6" emissive="#74c6c0" emissiveIntensity={0.35} />
          </mesh>
        </group>
      );
    case 'shopping_mall':
      return (
        <group>
          <mesh castShadow position={[0, 0.42, 0]}>
            <boxGeometry args={[1.5, 0.8, 1.5]} />
            <meshStandardMaterial color="#1b140f" metalness={0.35} roughness={0.42} />
          </mesh>
          <mesh castShadow position={[0.2, 0.95, 0.1]}>
            <boxGeometry args={[0.92, 0.44, 0.92]} />
            <meshStandardMaterial color="#251b13" emissive="#d6a75a" emissiveIntensity={0.16} />
          </mesh>
        </group>
      );
    case 'turnstile':
      return (
        <group>
          <mesh castShadow position={[0, 0.42, 0]}>
            <boxGeometry args={[0.82, 0.84, 0.22]} />
            <meshStandardMaterial color="#181310" metalness={0.28} roughness={0.52} />
          </mesh>
          <mesh castShadow position={[0, 0.35, 0]}>
            <boxGeometry args={[0.22, 0.56, 0.62]} />
            <meshStandardMaterial color="#8fd4a4" emissive="#8fd4a4" emissiveIntensity={0.22} />
          </mesh>
        </group>
      );
    case 'telecom_tower':
      return (
        <group>
          <mesh castShadow position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.08, 0.16, 2.8, 16]} />
            <meshStandardMaterial color="#f6efe6" emissive="#f6efe6" emissiveIntensity={0.18} />
          </mesh>
          <mesh castShadow position={[0, 2.95, 0]}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial color="#d6a75a" emissive="#d6a75a" emissiveIntensity={0.34} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
};

export const CityLayer = ({
  activePoiId,
  onPoiSelect,
  pois,
}: CityLayerProps) => {
  const stadiumPoi = pois.find((poi) => poi.id === 'stadium') ?? pois[0];

  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[32, 32]} />
        <meshStandardMaterial color="#090705" metalness={0.2} roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.9, 14.8, 90]} />
        <meshBasicMaterial color="#d6a75a" opacity={0.05} transparent />
      </mesh>

      <Sparkles color="#d6a75a" count={80} opacity={0.5} scale={[18, 6, 18]} size={1.5} speed={0.35} />

      {cityBlocks.map((block, index) => (
        <mesh
          castShadow
          key={index}
          position={block.position as [number, number, number]}
          receiveShadow
        >
          <boxGeometry args={block.size as [number, number, number]} />
          <meshStandardMaterial color="#15100c" emissive="#100c09" emissiveIntensity={0.2} metalness={0.45} roughness={0.54} />
        </mesh>
      ))}

      <group
        onClick={(event) => {
          stopEvent(event);
          onPoiSelect('stadium');
        }}
      >
        <StadiumModel active={activePoiId === 'stadium'} />
      </group>

      <Html center distanceFactor={12} occlude={false} position={[0, 3.1, 0]}>
        <button
          className={`poi-label ${activePoiId === 'stadium' ? 'active' : ''}`}
          onClick={() => onPoiSelect('stadium')}
          style={{ pointerEvents: 'auto' }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: stadiumPoi.color }}
          />
          {stadiumPoi.shortLabel}
        </button>
      </Html>

      {pois
        .filter((poi) => poi.id !== 'stadium')
        .map((poi) => {
          const midX = (stadiumPoi.position[0] + poi.position[0]) / 2;
          const midZ = (stadiumPoi.position[2] + poi.position[2]) / 2;
          const arcHeight = 1.6 + Math.hypot(poi.position[0], poi.position[2]) * 0.08;

          return (
            <group key={poi.id}>
              <Line
                color={poi.color}
                lineWidth={1.1}
                opacity={poi.id === activePoiId ? 0.9 : 0.42}
                points={[
                  [stadiumPoi.position[0], 1.35, stadiumPoi.position[2]],
                  [midX, arcHeight, midZ],
                  [poi.position[0], 1.15, poi.position[2]],
                ]}
                transparent
              />
              <PoiNode
                active={poi.id === activePoiId}
                onSelect={onPoiSelect}
                poi={poi}
              >
                <PoiStructure poi={poi} />
              </PoiNode>
            </group>
          );
        })}
    </group>
  );
};
