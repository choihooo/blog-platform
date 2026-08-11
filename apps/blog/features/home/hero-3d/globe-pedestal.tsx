"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function GlobePedestal({ reducedMotion }: { reducedMotion: boolean }) {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!reducedMotion && globeRef.current) {
      globeRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={globeRef} position={[0, -2.25, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.94, 64, 32]} />
        <meshStandardMaterial color="#2673ba" roughness={0.72} />
      </mesh>
      <mesh scale={1.006}>
        <sphereGeometry args={[0.94, 24, 12]} />
        <meshBasicMaterial color="#dcecf8" transparent opacity={0.42} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.96, 0]}>
        <torusGeometry args={[0.95, 0.018, 10, 96]} />
        <meshStandardMaterial color="#18202a" roughness={0.55} />
      </mesh>
    </group>
  );
}
