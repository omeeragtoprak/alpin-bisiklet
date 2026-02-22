"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Center } from "@react-three/drei";
import { Suspense, useRef, useState, Component, type ReactNode } from "react";
import * as THREE from "three";
import { RotateCcw, ZoomIn, ZoomOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p className="text-sm">3D model yüklenemedi</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, false, false, (loader) => {
    loader.manager.onError = (u: string) => {
      if (!u.startsWith("blob:")) console.warn("GLTF yükleme hatası:", u);
    };
  });

  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.25;
    }
  });

  // Scene'i clone'la (başka yerde preload edilmişse referans çakışmasın)
  const clonedScene = scene.clone();

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#e2e8f0" wireframe />
    </mesh>
  );
}

interface ProductModelViewerProps {
  modelUrl: string;
  className?: string;
}

export function ProductModelViewer({ modelUrl, className = "" }: ProductModelViewerProps) {
  const [zoom, setZoom] = useState(1);
  const orbitRef = useRef<any>(null);

  const resetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
    setZoom(1);
  };

  return (
    <ModelErrorBoundary>
    <div className={`relative w-full rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/60 border ${className}`}>
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shadow-sm"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
          title="Yaklaştır"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shadow-sm"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.4))}
          title="Uzaklaştır"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shadow-sm"
          onClick={resetCamera}
          title="Kamerayı sıfırla"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-background/70 backdrop-blur-sm text-[11px] text-muted-foreground px-3 py-1 rounded-full pointer-events-none select-none">
        Döndür • Sürükle
      </div>

      <Canvas
        camera={{ position: [4, 2, 4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent", height: "100%" }}
      >
        {/* Lighting — HDR preset yerine manuel ışıklar (CDN bağımlılığı yok) */}
        <ambientLight intensity={3} color="#ffffff" />
        <directionalLight position={[5, 8, 5]} intensity={2} color="#ffffff" castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={1.2} color="#ddeeff" />
        <directionalLight position={[0, -3, 5]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, 10, 0]} intensity={1} color="#ffffff" />

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
        </Suspense>

        <OrbitControls
          ref={orbitRef}
          enablePan={true}
          enableZoom={true}
          minDistance={1 / zoom}
          maxDistance={10 / zoom}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={false}
        />
      </Canvas>
    </div>
    </ModelErrorBoundary>
  );
}
