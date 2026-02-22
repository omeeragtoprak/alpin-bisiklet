"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const SIZE_COLORS: Record<string, string> = {
    XS: "#10b981",
    S: "#3b82f6",
    M: "#8b5cf6",
    L: "#f59e0b",
    XL: "#ef4444",
};

function BicycleFrame({ color }: { color: string }) {
    const c = color;
    const metal = { metalness: 0.7, roughness: 0.25 };

    return (
        <group position={[0, 0.28, 0]}>
            {/* Arka tekerlek */}
            <mesh position={[0.38, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.27, 0.032, 16, 48]} />
                <meshStandardMaterial color="#1a1a1a" {...metal} />
            </mesh>
            {/* Ön tekerlek */}
            <mesh position={[-0.38, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.27, 0.032, 16, 48]} />
                <meshStandardMaterial color="#1a1a1a" {...metal} />
            </mesh>
            {/* Tekerlek çubukları */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh key={i} position={[0.38, -0.12, 0]} rotation={[0, 0, (Math.PI / 6) * i]}>
                    <cylinderGeometry args={[0.008, 0.008, 0.52, 4]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
            ))}
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <mesh key={i} position={[-0.38, -0.12, 0]} rotation={[0, 0, (Math.PI / 6) * i]}>
                    <cylinderGeometry args={[0.008, 0.008, 0.52, 4]} />
                    <meshStandardMaterial color="#555" />
                </mesh>
            ))}
            {/* Ana çerçeve — seat tube (dikey) */}
            <mesh position={[0.22, 0.15, 0]}>
                <capsuleGeometry args={[0.025, 0.38, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Top tube (yatay üst) */}
            <mesh position={[-0.06, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.022, 0.54, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Down tube (diagonal) */}
            <mesh position={[-0.09, 0.17, 0]} rotation={[0, 0, Math.PI / 2 - 0.55]}>
                <capsuleGeometry args={[0.026, 0.56, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Chain stay (arka yatay) */}
            <mesh position={[0.3, -0.08, 0]} rotation={[0, 0, 0.12]}>
                <capsuleGeometry args={[0.018, 0.36, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Seat stay */}
            <mesh position={[0.3, 0.18, 0]} rotation={[0, 0, -0.9]}>
                <capsuleGeometry args={[0.015, 0.38, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Fork */}
            <mesh position={[-0.32, 0.05, 0]} rotation={[0, 0, 0.2]}>
                <capsuleGeometry args={[0.02, 0.35, 6, 12]} />
                <meshStandardMaterial color="#888" {...metal} />
            </mesh>
            {/* Head tube */}
            <mesh position={[-0.33, 0.3, 0]} rotation={[0, 0, 0.2]}>
                <capsuleGeometry args={[0.03, 0.1, 6, 12]} />
                <meshStandardMaterial color={c} {...metal} />
            </mesh>
            {/* Gidon */}
            <mesh position={[-0.36, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.018, 0.22, 6, 12]} />
                <meshStandardMaterial color="#999" {...metal} />
            </mesh>
            {/* Sele tüpü uzantısı */}
            <mesh position={[0.22, 0.44, 0]}>
                <capsuleGeometry args={[0.015, 0.14, 6, 12]} />
                <meshStandardMaterial color="#777" {...metal} />
            </mesh>
            {/* Sele */}
            <mesh position={[0.22, 0.525, 0]} rotation={[0, 0, Math.PI / 2]}>
                <capsuleGeometry args={[0.022, 0.18, 6, 12]} />
                <meshStandardMaterial color="#111" roughness={0.9} />
            </mesh>
            {/* Pedal merkezi */}
            <mesh position={[0.12, -0.08, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
                <meshStandardMaterial color="#555" {...metal} />
            </mesh>
        </group>
    );
}

function PersonSilhouette({ height, color }: { height: number; color: string }) {
    // Boy 140–210 arası normalize 0.78–1.08
    const scale = 0.78 + ((height - 140) / 70) * 0.3;

    const torsoH = 0.3 * scale;
    const legH = 0.36 * scale;
    const headR = 0.085 * scale;
    const armLen = 0.28 * scale;

    // Kişiyi bisiklet selesine oturtur
    // Sele dünya pozisyonu: [0.22, 0.28 + 0.525, 0] = [0.22, 0.805, 0]
    const saddleY = 0.805;
    const personY = saddleY + legH * 0.5 + torsoH * 0.5;
    const personX = 0.18;

    // Öne eğilmiş sürüş pozisyonu
    const leanAngle = 0.35; // öne eğilme (radyan)

    return (
        <group position={[personX, personY, 0]} rotation={[0, 0, -leanAngle]}>
            {/* Kafa */}
            <mesh position={[0, torsoH * 0.5 + headR + 0.01, 0]}>
                <sphereGeometry args={[headR, 14, 14]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Gövde */}
            <mesh>
                <capsuleGeometry args={[0.065 * scale, torsoH, 6, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Sol bacak */}
            <mesh position={[-0.04 * scale, -torsoH * 0.5 - legH * 0.5, 0]} rotation={[0.25, 0, 0.05]}>
                <capsuleGeometry args={[0.038 * scale, legH, 6, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Sağ bacak */}
            <mesh position={[0.04 * scale, -torsoH * 0.5 - legH * 0.5, 0]} rotation={[-0.25, 0, -0.05]}>
                <capsuleGeometry args={[0.038 * scale, legH, 6, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {/* Kollar (gidona uzanıyor) */}
            <mesh position={[-0.06 * scale - armLen * 0.4, torsoH * 0.25 - armLen * 0.2, 0]} rotation={[0, 0, 0.9]}>
                <capsuleGeometry args={[0.028 * scale, armLen, 6, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0.06 * scale - armLen * 0.4, torsoH * 0.25 - armLen * 0.2, 0]} rotation={[0, 0, 0.9]}>
                <capsuleGeometry args={[0.028 * scale, armLen, 6, 12]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

interface PersonOnBikeProps {
    height: number;
    sizeLabel: string;
}

export function PersonOnBike({ height, sizeLabel }: PersonOnBikeProps) {
    const color = SIZE_COLORS[sizeLabel] ?? "#8b5cf6";

    return (
        <Canvas style={{ width: "100%", height: "100%" }}>
            <PerspectiveCamera makeDefault position={[0.05, 0.75, 2.0]} fov={42} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[2, 4, 2]} intensity={1.4} castShadow />
            <directionalLight position={[-1, 1, -1]} intensity={0.3} />
            <BicycleFrame color={color} />
            <PersonSilhouette height={height} color={color} />
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2.8}
                maxPolarAngle={Math.PI / 2.1}
                minAzimuthAngle={-0.4}
                maxAzimuthAngle={0.4}
                target={[0, 0.5, 0]}
            />
        </Canvas>
    );
}
