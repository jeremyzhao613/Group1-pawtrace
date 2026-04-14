export const SceneLights = () => (
  <>
    <ambientLight color="#d6f4ff" intensity={0.48} />
    <directionalLight
      castShadow
      color="#9ae9ff"
      intensity={2.4}
      position={[10, 15, 8]}
      shadow-mapSize-height={2048}
      shadow-mapSize-width={2048}
      shadow-camera-far={40}
      shadow-camera-left={-18}
      shadow-camera-right={18}
      shadow-camera-top={18}
      shadow-camera-bottom={-18}
    />
    <spotLight
      angle={0.42}
      color="#74e6ff"
      distance={36}
      intensity={3.4}
      penumbra={0.8}
      position={[-10, 14, -4]}
    />
    <pointLight color="#74e6ff" distance={14} intensity={18} position={[0, 3.2, 0]} />
    <pointLight color="#ffb15c" distance={18} intensity={7} position={[0, 8, 0]} />
  </>
);
