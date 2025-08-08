"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import VRMModel from "./VRMModel";
import { AnimationPresetType } from "@/lib/vrm-animations";
import { LoaderTwo } from "@/components/ui/loader";

interface VRMViewerProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  lightIntensity?: number;
  backgroundImage?: string;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
}

export default function VRMViewer({
  modelPath,
  className = "",
  autoRotate = false,
  lightIntensity = 1,
  backgroundImage,
  animationPreset = "idle",
  onAnimationChange,
}: VRMViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(10);
  const [currentBackgroundImage, setCurrentBackgroundImage] =
    useState(backgroundImage);

  // 배경 설정 로드 및 이벤트 리스너
  useEffect(() => {
    // 로컬 스토리지에서 설정 로드
    const savedBlur = localStorage.getItem("backgroundBlur");
    const savedBackground = localStorage.getItem("selectedBackground");

    if (savedBlur) {
      setBackgroundBlur(parseInt(savedBlur));
    }
    if (savedBackground) {
      setCurrentBackgroundImage(savedBackground);
    }

    // 블러 변경 이벤트 리스너
    const handleBlurChange = (event: CustomEvent) => {
      setBackgroundBlur(event.detail.blur);
    };

    // 배경 이미지 변경 이벤트 리스너
    const handleBackgroundImageChange = (event: CustomEvent) => {
      setCurrentBackgroundImage(event.detail.backgroundImage);
    };

    window.addEventListener(
      "backgroundBlurChange",
      handleBlurChange as EventListener
    );
    window.addEventListener(
      "backgroundImageChange",
      handleBackgroundImageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "backgroundBlurChange",
        handleBlurChange as EventListener
      );
      window.removeEventListener(
        "backgroundImageChange",
        handleBackgroundImageChange as EventListener
      );
    };
  }, []);

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* 로딩 오버레이 */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <LoaderTwo />
        </div>
      )}

      {/* 배경 이미지 */}
      {currentBackgroundImage && (
        <div
          className="absolute inset-0 opacity-70 transition-all duration-300"
          style={{
            backgroundImage: `url(${currentBackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: `blur(${backgroundBlur}px)`,
            transform: `scale(${1 + backgroundBlur / 100})`, // 블러시 약간 확대하여 가장자리 없애기
          }}
        />
      )}

      <Canvas
        className="relative z-10"
        camera={{ position: [0, 0.1, -1], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <Suspense
          fallback={
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.5, 1.8, 0.3]} />
              <meshStandardMaterial color="#666" opacity={0.5} transparent />
            </mesh>
          }
        >
          {/* 조명 설정 */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[1, 1, 1]}
            intensity={lightIntensity}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* VRM 모델 */}
          <VRMModel
            url={modelPath}
            animationPreset={animationPreset}
            onAnimationChange={onAnimationChange}
            onLoaded={() => setIsLoaded(true)}
          />

          {/* 환경 및 컨트롤 */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            maxPolarAngle={Math.PI / 2}
            minDistance={1.2}
            maxDistance={8}
            target={[0, 0.1, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
