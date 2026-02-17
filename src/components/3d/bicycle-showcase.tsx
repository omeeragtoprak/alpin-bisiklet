"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function BicycleModel() {
	const { scene } = useGLTF("/bycle.glb");
	const groupRef = useRef<THREE.Group>(null);

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
		}
	});

	return (
		<group ref={groupRef} scale={3.5} position={[0, -0.5, 0]}>
			<primitive object={scene} />
		</group>
	);
}

export function BicycleShowcase({ className = "" }: { className?: string }) {
	return (
		<div className={`relative w-full h-full ${className}`}>
			<Canvas
				camera={{ position: [4, 2, 4], fov: 40 }}
				gl={{ alpha: true, antialias: true }}
				style={{ background: "transparent" }}
			>
				<ambientLight intensity={2} color="#ffffff" />
				<directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
				<directionalLight position={[-5, 5, -5]} intensity={1} color="#ffffff" />
				<directionalLight position={[0, 5, -5]} intensity={0.5} color="#ffffff" />

				<Suspense fallback={null}>
					<BicycleModel />
				</Suspense>

				<OrbitControls
					enablePan={false}
					enableZoom={false}
					minPolarAngle={Math.PI / 4}
					maxPolarAngle={Math.PI / 2.2}
				/>
			</Canvas>
		</div>
	);
}

useGLTF.preload("/bycle.glb");
