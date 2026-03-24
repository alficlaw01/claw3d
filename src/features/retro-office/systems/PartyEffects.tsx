"use client";

import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const CONFETTI_COUNT = 180;
const FLOOR_Y = -0.5;
const CEILING_Y = 5.5;
const CONFETTI_SPREAD_X = 12;
const CONFETTI_SPREAD_Z = 12;

// Party colour palette
const CONFETTI_COLORS = [
  "#ff2d78", // hot pink
  "#ffd700", // gold
  "#00e5ff", // cyan
  "#76ff03", // lime
  "#ff6d00", // orange
  "#ea80fc", // purple
  "#00e676", // green
  "#ff1744", // red
];

interface ConfettiPiece {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  color: string;
  scale: number;
}

const buildConfetti = (): ConfettiPiece[] =>
  Array.from({ length: CONFETTI_COUNT }, () => ({
    x: (Math.random() - 0.5) * CONFETTI_SPREAD_X * 2,
    y: Math.random() * (CEILING_Y - FLOOR_Y) + FLOOR_Y,
    z: (Math.random() - 0.5) * CONFETTI_SPREAD_Z * 2,
    vx: (Math.random() - 0.5) * 0.003,
    vy: -(Math.random() * 0.008 + 0.003),
    vz: (Math.random() - 0.5) * 0.003,
    rotX: Math.random() * Math.PI * 2,
    rotY: Math.random() * Math.PI * 2,
    rotZ: Math.random() * Math.PI * 2,
    rotSpeedX: (Math.random() - 0.5) * 0.04,
    rotSpeedY: (Math.random() - 0.5) * 0.04,
    rotSpeedZ: (Math.random() - 0.5) * 0.04,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    scale: Math.random() * 0.04 + 0.03,
  }));

export function PartyEffects() {
  // Confetti instanced mesh
  const confettiMeshRef = useRef<THREE.InstancedMesh>(null);
  const confettiDataRef = useRef<ConfettiPiece[]>(buildConfetti());

  const confettiGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const confettiMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  // Initialise per-instance colours via setColorAt
  useEffect(() => {
    const mesh = confettiMeshRef.current;
    if (!mesh) return;
    confettiDataRef.current.forEach((piece, i) => {
      mesh.setColorAt(i, new THREE.Color(piece.color));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, []);

  // Disco lights rotation
  const discoGroupRef = useRef<THREE.Group>(null);
  const lightPhaseRef = useRef(0);

  useFrame((_, delta) => {
    // --- Confetti animation ---
    const mesh = confettiMeshRef.current;
    if (mesh) {
      const data = confettiDataRef.current;
      const dummy = new THREE.Object3D();
      let needsColorUpdate = false;

      for (let i = 0; i < CONFETTI_COUNT; i++) {
        const p = data[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.rotX += p.rotSpeedX;
        p.rotY += p.rotSpeedY;
        p.rotZ += p.rotSpeedZ;

        // Slight sway
        p.vx += (Math.random() - 0.5) * 0.0003;
        p.vz += (Math.random() - 0.5) * 0.0003;

        // Reset when below floor
        if (p.y < FLOOR_Y) {
          p.y = CEILING_Y;
          p.x = (Math.random() - 0.5) * CONFETTI_SPREAD_X * 2;
          p.z = (Math.random() - 0.5) * CONFETTI_SPREAD_Z * 2;
          needsColorUpdate = true;
        }

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(p.rotX, p.rotY, p.rotZ);
        dummy.scale.setScalar(p.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Refresh colour when confetti resets
        if (needsColorUpdate) {
          mesh.setColorAt(i, new THREE.Color(p.color));
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (needsColorUpdate && mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }

    // --- Disco lights rotation ---
    lightPhaseRef.current += delta * 0.6;
    const group = discoGroupRef.current;
    if (group) {
      group.rotation.y = lightPhaseRef.current;
      // Pulse intensity
      const pulse = 1.8 + Math.sin(lightPhaseRef.current * 3) * 0.7;
      group.children.forEach((child) => {
        if (child instanceof THREE.PointLight) {
          child.intensity = pulse * 2.5;
        }
      });
    }
  });

  return (
    <>
      {/* Confetti particles */}
      <instancedMesh
        ref={confettiMeshRef}
        args={[confettiGeometry, confettiMaterial, CONFETTI_COUNT]}
        frustumCulled={false}
      />

      {/* Rotating disco lights group */}
      <group ref={discoGroupRef} position={[0, 4, 0]}>
        <pointLight
          color="#ff2d78"
          intensity={3}
          distance={14}
          position={[3, 0.5, 0]}
        />
        <pointLight
          color="#00e5ff"
          intensity={3}
          distance={14}
          position={[-3, 0.5, 0]}
        />
        <pointLight
          color="#ffd700"
          intensity={2.5}
          distance={12}
          position={[0, 0.5, 3]}
        />
        <pointLight
          color="#76ff03"
          intensity={2.5}
          distance={12}
          position={[0, 0.5, -3]}
        />
        <pointLight
          color="#ea80fc"
          intensity={2}
          distance={10}
          position={[2, 0.5, 2]}
        />
      </group>

      {/* Static warm ambient fill — adds party warmth without overpowering scene */}
      <pointLight
        color="#ff8c42"
        intensity={1.2}
        distance={18}
        position={[0, 3.5, 0]}
      />

      {/* Party banner — floating in the open space above the scene */}
      <Text
        position={[0, 2.8, -2.5]}
        fontSize={0.55}
        color="#ffd700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#ff2d78"
        maxWidth={8}
        textAlign="center"
        font="https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2"
      >
        {"JASON HQ 🎉"}
      </Text>
    </>
  );
}
