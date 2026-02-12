"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

function Terrain() {
    const meshRef = useRef<THREE.Mesh>(null);

    const geometry = useMemo(() => {
        const geo = new THREE.PlaneGeometry(20, 20, 64, 64);
        const positions = geo.attributes.position;

        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            // Create mountain-like terrain
            const height =
                Math.sin(x * 0.5) * Math.cos(y * 0.3) * 1.5 +
                Math.sin(x * 0.8 + 1) * Math.cos(y * 0.6 + 2) * 0.8 +
                Math.sin(x * 1.2 + 3) * Math.cos(y * 1.1) * 0.4;
            positions.setZ(i, height);
        }

        geo.computeVertexNormals();
        return geo;
    }, []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
            <meshStandardMaterial
                color="#2d5a3d"
                wireframe
                transparent
                opacity={0.15}
            />
        </mesh>
    );
}

function FloatingPeak({ position, scale }: { position: [number, number, number]; scale: number }) {
    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh position={position} scale={scale}>
                <coneGeometry args={[0.5, 1.5, 4]} />
                <meshStandardMaterial color="#4a9d6e" transparent opacity={0.2} />
            </mesh>
            {/* Snow cap */}
            <mesh position={[position[0], position[1] + 0.6 * scale, position[2]]} scale={scale * 0.4}>
                <coneGeometry args={[0.35, 0.4, 4]} />
                <meshStandardMaterial color="#e8f0e8" transparent opacity={0.3} />
            </mesh>
        </Float>
    );
}

export function MountainScene({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 pointer-events-none ${className}`}>
            <Canvas
                camera={{ position: [0, 2, 8], fov: 60 }}
                gl={{ alpha: true, antialias: true }}
                style={{ background: "transparent" }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fffbe6" />
                <fog attach="fog" args={["#f0f7f0", 5, 20]} />

                <Terrain />

                <FloatingPeak position={[-3, 0.5, -2]} scale={1.2} />
                <FloatingPeak position={[2, 0.8, -3]} scale={1.5} />
                <FloatingPeak position={[0, 0.3, -1]} scale={0.8} />
                <FloatingPeak position={[-1.5, 0.6, -4]} scale={1.8} />
                <FloatingPeak position={[3.5, 0.4, -1.5]} scale={1.0} />

                <Stars radius={50} depth={30} count={200} factor={3} fade speed={0.5} />
            </Canvas>
        </div>
    );
}
