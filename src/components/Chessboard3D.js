import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

console.log("✅ Chessboard3D loaded"); // Add this!

function Chessboard3D() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={1} />
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[8, 0.5, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}

export default Chessboard3D;
