"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

const SIZE_COLORS: Record<string, string> = {
    XS: "#10b981",
    S:  "#3b82f6",
    M:  "#8b5cf6",
    L:  "#f59e0b",
    XL: "#ef4444",
};

const WHEEL_R    = 0.265;
const SPOKE_N    = 18;
const ROAD_SPEED = 1.8;  // scene-units/second (controls both wheel spin + road)
const ROAD_Y     = -(WHEEL_R + 0.003);

// Çerçeve boyutu ölçeği — XS küçük, XL büyük
const FRAME_SCALES: Record<string, number> = {
    XS: 0.86,
    S:  0.92,
    M:  1.00,
    L:  1.07,
    XL: 1.14,
};

// ─── Tube helper ─────────────────────────────────────────────────────────────

interface TubeMeshProps {
    from: Vec3; to: Vec3; mid?: Vec3;
    radius?: number; color: string;
    metalness?: number; roughness?: number;
}

function TubeMesh({ from, to, mid, radius = 0.013, color, metalness = 0.72, roughness = 0.22 }: TubeMeshProps) {
    const geo = useMemo(() => {
        const pts: THREE.Vector3[] = [new THREE.Vector3(...from)];
        if (mid) pts.push(new THREE.Vector3(...mid));
        pts.push(new THREE.Vector3(...to));
        const curve = new THREE.CatmullRomCurve3(pts);
        return new THREE.TubeGeometry(curve, pts.length > 2 ? 18 : 1, radius, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from[0], from[1], from[2], to[0], to[1], to[2], mid?.[0], mid?.[1], mid?.[2], radius]);

    return (
        <mesh geometry={geo}>
            <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        </mesh>
    );
}

// ─── Spinning wheel internals (rim + hub + spokes) ───────────────────────────

function WheelSpinner({ color }: { color: string }) {
    const ref = useRef<THREE.Group>(null!);

    const spokeGeos = useMemo(() =>
        Array.from({ length: SPOKE_N }, (_, i) => {
            const a = (i / SPOKE_N) * Math.PI * 2;
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(Math.cos(a) * (WHEEL_R - 0.022), Math.sin(a) * (WHEEL_R - 0.022), 0),
            ]);
            return new THREE.TubeGeometry(curve, 1, 0.0025, 4, false);
        }),
        [],
    );

    // Rotate clockwise (bike moving forward = -X direction)
    useFrame((_, delta) => {
        ref.current.rotation.z -= (delta * ROAD_SPEED) / WHEEL_R;
    });

    return (
        <group ref={ref}>
            {/* Rim */}
            <mesh>
                <torusGeometry args={[WHEEL_R - 0.022, 0.011, 10, 64]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.14} />
            </mesh>
            {/* Hub — cylinder along Z (axle depth) */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.065, 16]} />
                <meshStandardMaterial color={color} metalness={0.92} roughness={0.1} />
            </mesh>
            {/* Spokes */}
            {spokeGeos.map((geo, i) => (
                <mesh key={i} geometry={geo}>
                    <meshStandardMaterial color="#9ca3af" metalness={0.55} roughness={0.45} />
                </mesh>
            ))}
        </group>
    );
}

function Wheel({ cx, color }: { cx: number; color: string }) {
    return (
        <group position={[cx, 0, 0]}>
            {/* Static tire — torus default is XY plane (vertical) */}
            <mesh>
                <torusGeometry args={[WHEEL_R, 0.028, 14, 80]} />
                <meshStandardMaterial color="#0b0b0b" roughness={0.96} metalness={0.04} />
            </mesh>
            <WheelSpinner color={color} />
        </group>
    );
}

// ─── Infinite road ────────────────────────────────────────────────────────────

const DASH_PERIOD = 0.80;
const DASH_LEN    = 0.28;
const NUM_DASHES  = 18;

function Road() {
    const dashGroupRef = useRef<THREE.Group>(null!);
    const timeRef      = useRef(0);

    // Dashes scroll in +X (bike moves in -X = forward)
    useFrame((_, delta) => {
        timeRef.current += delta * ROAD_SPEED;
        const offset = timeRef.current % DASH_PERIOD;
        if (dashGroupRef.current) dashGroupRef.current.position.x = offset;
    });

    return (
        <group>
            {/* Asphalt — koyu gri, açık arka plana karşı kontrast */}
            <mesh position={[0, ROAD_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[16, 1.8]} />
                <meshStandardMaterial color="#3a3e4a" roughness={0.92} metalness={0.06} />
            </mesh>
            {/* Left white edge */}
            <mesh position={[0, ROAD_Y + 0.001, 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[16, 0.038]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Right white edge */}
            <mesh position={[0, ROAD_Y + 0.001, -0.68]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[16, 0.038]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* Animated center dashes */}
            <group ref={dashGroupRef}>
                {Array.from({ length: NUM_DASHES }, (_, i) => {
                    const x = (i - Math.floor(NUM_DASHES / 2)) * DASH_PERIOD;
                    return (
                        <mesh key={i} position={[x, ROAD_Y + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[DASH_LEN, 0.042]} />
                            <meshStandardMaterial color="#f0c030" />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}

// ─── Frame coordinates ────────────────────────────────────────────────────────

const REAR_X = 0.415;
const FRONT_X = -0.415;

const BB:  Vec3 = [0.13,   -0.04,  0];
const RD:  Vec3 = [REAR_X,  0,     0];
const FD:  Vec3 = [FRONT_X, 0,     0];
const STT: Vec3 = [0.235,   0.305, 0];
const HTT: Vec3 = [-0.245,  0.325, 0];
const HTB: Vec3 = [-0.275,  0.205, 0];

const SEAT_POST_TOP: Vec3 = [0.195, 0.455, 0];
const SADDLE_L: Vec3      = [0.08,  0.470, 0];
const SADDLE_R: Vec3      = [0.30,  0.470, 0];

// ─── Bike Frame ────────────────────────────────────────────────────────────────

function BikeFrame({ color }: { color: string }) {
    const silver = "#b2b6bf";
    const dark   = "#111111";

    return (
        <group>
            <Wheel cx={REAR_X}  color={color} />
            <Wheel cx={FRONT_X} color={color} />

            <TubeMesh from={BB}  to={STT} radius={0.016} color={color} />
            <TubeMesh from={STT} to={HTT} radius={0.013} color={color} />
            <TubeMesh from={BB}  to={HTB} radius={0.020} color={color} />
            <TubeMesh from={BB}  to={RD}  radius={0.012} color={color} />
            <TubeMesh from={STT} to={RD}  radius={0.009} color={color} />
            <TubeMesh from={HTT} to={HTB} radius={0.023} color={color} />

            {/* Fork */}
            <TubeMesh from={HTB} mid={[-0.355, 0.075, 0]} to={FD} radius={0.011} color={silver} />

            {/* Seat post + saddle */}
            <TubeMesh from={STT} to={SEAT_POST_TOP} radius={0.009} color={silver} />
            <TubeMesh from={SADDLE_L} to={SADDLE_R} radius={0.014} color={dark} metalness={0.1} roughness={0.92} />
            <TubeMesh from={[0.10, 0.462, 0.022]}  to={[0.28, 0.462, 0.022]}  radius={0.003} color={silver} />
            <TubeMesh from={[0.10, 0.462, -0.022]} to={[0.28, 0.462, -0.022]} radius={0.003} color={silver} />

            {/* Stem + drop handlebars */}
            <TubeMesh from={HTT} to={[-0.195, 0.375, 0]} radius={0.010} color={silver} />
            <TubeMesh from={[-0.175, 0.375, -0.055]} to={[-0.175, 0.375, 0.055]} radius={0.009} color={dark} metalness={0.3} roughness={0.7} />
            <TubeMesh from={[-0.175, 0.375, -0.055]} mid={[-0.145, 0.315, -0.064]} to={[-0.135, 0.280, -0.057]} radius={0.008} color={dark} metalness={0.3} roughness={0.7} />
            <TubeMesh from={[-0.175, 0.375,  0.055]} mid={[-0.145, 0.315,  0.064]} to={[-0.135, 0.280,  0.057]} radius={0.008} color={dark} metalness={0.3} roughness={0.7} />

            {/* Chainring */}
            <mesh position={BB}>
                <torusGeometry args={[0.080, 0.009, 8, 48]} />
                <meshStandardMaterial color={color} metalness={0.82} roughness={0.18} />
            </mesh>

            {/* Cranks + pedals */}
            <TubeMesh from={BB} to={[BB[0]+0.068, BB[1]-0.020,  0.022]} radius={0.008} color={dark} />
            <TubeMesh from={BB} to={[BB[0]-0.068, BB[1]+0.020, -0.022]} radius={0.008} color={dark} />
            <TubeMesh from={[BB[0]+0.058, BB[1]-0.015, -0.024]} to={[BB[0]+0.082, BB[1]-0.024,  0.046]} radius={0.009} color={dark} metalness={0.5} roughness={0.5} />
            <TubeMesh from={[BB[0]-0.058, BB[1]+0.015,  0.024]} to={[BB[0]-0.082, BB[1]+0.024, -0.046]} radius={0.009} color={dark} metalness={0.5} roughness={0.5} />
        </group>
    );
}

// ─── Person ────────────────────────────────────────────────────────────────────

function PersonSilhouette({ height, color }: { height: number; color: string }) {
    const sc = 0.78 + ((height - 140) / 70) * 0.30;

    const hipX = 0.20;
    const hipY = 0.470;

    const lean      = 0.76;
    const torsoLen  = 0.295 * sc;
    const shoulderX = hipX - Math.sin(lean) * torsoLen;
    const shoulderY = hipY + Math.cos(lean) * torsoLen;

    const headR = 0.068 * sc;
    const headX = shoulderX - 0.018 * sc;
    const headY = shoulderY + headR + 0.038 * sc;

    const elbowX = shoulderX - 0.065 * sc;
    const elbowY = shoulderY - 0.105 * sc;
    const handX  = -0.155;
    const handY  =  0.320;

    // Power stroke — knee in front (toward -X = front of bike)
    const kneeF_X = hipX - 0.10 * sc;
    const kneeF_Y = hipY - 0.22 * sc;
    const footF_X = BB[0] - 0.02;
    const footF_Y = BB[1] - 0.02;

    // Recovery stroke — knee slightly behind
    const kneeB_X = hipX + 0.05 * sc;
    const kneeB_Y = hipY - 0.17 * sc;
    const footB_X = BB[0] + 0.10;
    const footB_Y = BB[1] + 0.05;

    const SKIN = "#f0c4a0";
    const SHOE = "#1c1c1c";

    return (
        <group>
            <mesh position={[headX - 0.008 * sc, headY + headR * 0.55, 0]}>
                <sphereGeometry args={[headR * 0.75, 12, 12]} />
                <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} />
            </mesh>
            <mesh position={[headX, headY, 0]}>
                <sphereGeometry args={[headR, 14, 14]} />
                <meshStandardMaterial color={SKIN} roughness={0.85} metalness={0} />
            </mesh>
            <TubeMesh from={[shoulderX, shoulderY, 0]} to={[headX, headY - headR - 0.01, 0]} radius={0.022 * sc} color={SKIN} metalness={0} roughness={0.85} />
            <TubeMesh from={[hipX, hipY, 0]} to={[shoulderX, shoulderY, 0]} radius={0.058 * sc} color={color} metalness={0} roughness={0.88} />

            {([-1, 1] as const).map((side) => (
                <group key={side}>
                    <TubeMesh from={[shoulderX, shoulderY, side * 0.046 * sc]} to={[elbowX, elbowY, side * 0.043 * sc]} radius={0.028 * sc} color={color} metalness={0} roughness={0.88} />
                    <TubeMesh from={[elbowX, elbowY, side * 0.043 * sc]} to={[handX, handY, side * 0.052]} radius={0.020 * sc} color={SKIN} metalness={0} roughness={0.82} />
                </group>
            ))}

            {/* Front leg */}
            <TubeMesh from={[hipX, hipY, 0.038 * sc]} to={[kneeF_X, kneeF_Y, 0.036 * sc]} radius={0.038 * sc} color={color} metalness={0} roughness={0.88} />
            <TubeMesh from={[kneeF_X, kneeF_Y, 0.036 * sc]} to={[footF_X, footF_Y, 0.032 * sc]} radius={0.028 * sc} color={SKIN} metalness={0} roughness={0.82} />
            <TubeMesh from={[footF_X + 0.02, footF_Y, 0.032 * sc]} to={[footF_X - 0.06, footF_Y, 0.032 * sc]} radius={0.020 * sc} color={SHOE} metalness={0} roughness={0.95} />

            {/* Back leg */}
            <TubeMesh from={[hipX, hipY, -0.038 * sc]} to={[kneeB_X, kneeB_Y, -0.036 * sc]} radius={0.038 * sc} color={color} metalness={0} roughness={0.88} />
            <TubeMesh from={[kneeB_X, kneeB_Y, -0.036 * sc]} to={[footB_X, footB_Y, -0.028 * sc]} radius={0.028 * sc} color={SKIN} metalness={0} roughness={0.82} />
            <TubeMesh from={[footB_X + 0.03, footB_Y, -0.028 * sc]} to={[footB_X - 0.04, footB_Y, -0.028 * sc]} radius={0.020 * sc} color={SHOE} metalness={0} roughness={0.95} />
        </group>
    );
}

// ─── Scene ────────────────────────────────────────────────────────────────────

interface PersonOnBikeProps {
    height: number;
    sizeLabel: string;
}

export function PersonOnBike({ height, sizeLabel }: PersonOnBikeProps) {
    const color      = SIZE_COLORS[sizeLabel] ?? "#8b5cf6";
    const frameScale = FRAME_SCALES[sizeLabel] ?? 1.0;
    // Tekerlerin yere değmesi için Y ayarı
    const bikeY      = WHEEL_R * (frameScale - 1);

    return (
        <Canvas
            style={{ width: "100%", height: "100%" }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
        >
            {/* Light sky background */}
            <color attach="background" args={["#eef2f7"]} />

            <PerspectiveCamera makeDefault position={[0, 0.18, 2.0]} fov={40} />

            {/* Gün ışığı ortamı */}
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 8, 4]}  intensity={1.6} castShadow />
            <directionalLight position={[-3, 3, -2]} intensity={0.5} />
            <hemisphereLight args={["#c8ddf5", "#a8b890", 0.6]} />

            <Road />

            {/* Çerçeve boyutuna göre ölçeklenmiş bisiklet + kişi */}
            <group scale={frameScale} position={[0, bikeY, 0]}>
                <BikeFrame color={color} />
                <PersonSilhouette height={height} color={color} />
            </group>

            <OrbitControls
                enableZoom={true}
                enablePan={false}
                autoRotate={true}
                autoRotateSpeed={0.4}
                minDistance={0.8}
                maxDistance={4.0}
                target={[0, 0.20, 0]}
            />
        </Canvas>
    );
}
