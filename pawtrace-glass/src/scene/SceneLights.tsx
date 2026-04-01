export const SceneLights = () => (
  <>
    <ambientLight color="#f6efe6" intensity={0.55} />
    <directionalLight
      castShadow
      color="#ffdca3"
      intensity={2.2}
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
      color="#d6a75a"
      distance={36}
      intensity={3.2}
      penumbra={0.8}
      position={[-10, 14, -4]}
    />
    <pointLight color="#74c6c0" distance={12} intensity={16} position={[0, 3.2, 0]} />
    <pointLight color="#f6efe6" distance={18} intensity={10} position={[0, 8, 0]} />
  </>
);
