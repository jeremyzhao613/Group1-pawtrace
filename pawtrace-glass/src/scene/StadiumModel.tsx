import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import {
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';

interface StadiumModelProps {
  active: boolean;
}

export const StadiumModel = ({ active }: StadiumModelProps) => {
  const shellRef = useRef<Mesh | null>(null);
  const lightRingRef = useRef<Mesh | null>(null);
  const scanRingRef = useRef<Mesh | null>(null);
  const rigRef = useRef<Group | null>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (rigRef.current) {
      rigRef.current.rotation.y = elapsed * 0.05;
    }

    if (shellRef.current) {
      const material = shellRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = active ? 0.78 : 0.36;
    }

    if (lightRingRef.current) {
      const material = lightRingRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity =
        (active ? 2.2 : 1.2) + Math.sin(elapsed * 2.4) * 0.22;
    }

    if (scanRingRef.current) {
      const progress = (elapsed * 0.22) % 1;
      const scale = 1.1 + progress * 1.8;
      const material = scanRingRef.current.material as MeshBasicMaterial;
      scanRingRef.current.scale.set(scale, scale, scale);
      material.opacity = 0.38 * (1 - progress);
    }
  });

  return (
    <group ref={rigRef}>
      <mesh position={[0, 0.04, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.6, 96]} />
        <meshStandardMaterial color="#08131a" metalness={0.28} roughness={0.88} />
      </mesh>

      <mesh
        castShadow
        position={[0, 0.72, 0]}
        receiveShadow
        ref={shellRef}
      >
        <cylinderGeometry args={[3.6, 4.4, 1.4, 56, 1, true]} />
        <meshStandardMaterial
          color="#11202b"
          emissive="#0d1f2a"
          metalness={0.82}
          roughness={0.3}
          side={DoubleSide}
        />
      </mesh>

      <mesh castShadow position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[2.55, 2.55, 0.14, 48]} />
        <meshStandardMaterial color="#10363d" metalness={0.22} roughness={0.7} />
      </mesh>

      <mesh position={[0, 1.52, 0]} ref={lightRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.05, 0.14, 16, 96]} />
        <meshStandardMaterial
          color="#7ae9ff"
          emissive="#74e6ff"
          emissiveIntensity={1.7}
          metalness={0.72}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0.08, 0]} ref={scanRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.2, 4.36, 64]} />
        <meshBasicMaterial
          color="#74e6ff"
          depthWrite={false}
          opacity={0.32}
          transparent
        />
      </mesh>

      {Array.from({ length: 18 }).map((_, index) => {
        const angle = (index / 18) * Math.PI * 2;
        const x = Math.cos(angle) * 3.8;
        const z = Math.sin(angle) * 3.8;

        return (
          <mesh
            castShadow
            key={index}
            position={[x, 1.25, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.12, 1.3, 0.24]} />
            <meshStandardMaterial color="#c8f3ff" emissive="#74e6ff" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};
