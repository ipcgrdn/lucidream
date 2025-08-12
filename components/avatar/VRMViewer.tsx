"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useState, useEffect, useRef } from "react";
import VRMModel from "./VRMModel";
import { AnimationPresetType } from "@/lib/vrm-animations";
import { LoaderTwo } from "@/components/ui/loader";
import * as THREE from "three";

// 카메라 줌인 애니메이션 컴포넌트
function CameraZoomIn({ isLoaded }: { isLoaded: boolean }) {
  const { camera } = useThree();
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    // 초기 카메라 위치 (멀리)
    const startPosition = new THREE.Vector3(0, 0.1, -10);
    // 최종 카메라 위치 (가까이)
    const endPosition = new THREE.Vector3(0, 0.1, -1);

    // 카메라를 초기 위치로 설정
    camera.position.copy(startPosition);

    // 애니메이션 시작
    const startTime = Date.now();
    const duration = 3000; // 2초

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic 이징 함수
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // 카메라 위치 보간
      camera.position.lerpVectors(startPosition, endPosition, easedProgress);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    // 약간의 딜레이 후 애니메이션 시작
    const timeoutId = setTimeout(() => {
      animate();
    }, 500);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(timeoutId);
    };
  }, [isLoaded, camera]);

  return null;
}

interface VRMViewerProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  lightIntensity?: number;
  backgroundImage?: string;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
  audioElement?: HTMLAudioElement | null;
  enableLipSync?: boolean;
  dreamId?: string;
}

export default function VRMViewer({
  modelPath,
  className = "",
  autoRotate = false,
  lightIntensity = 1,
  backgroundImage,
  animationPreset = "idle",
  onAnimationChange,
  audioElement,
  enableLipSync = false,
  dreamId,
}: VRMViewerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [currentBackgroundImage, setCurrentBackgroundImage] =
    useState(backgroundImage);

  // 배경 설정 로드 및 이벤트 리스너
  useEffect(() => {
    // 로컬 스토리지에서 설정 로드
    const savedBlur = localStorage.getItem("backgroundBlur");

    if (savedBlur) {
      setBackgroundBlur(parseInt(savedBlur));
    }

    // dream별 배경 설정 로드
    if (dreamId) {
      const dreamBackgroundKey = `selectedBackground_${dreamId}`;
      const savedDreamBackground = localStorage.getItem(dreamBackgroundKey);

      if (savedDreamBackground) {
        setCurrentBackgroundImage(savedDreamBackground);
      } else {
        // dream별 배경이 없으면 기본 배경 사용
        setCurrentBackgroundImage(backgroundImage);
      }
    } else {
      // dreamId가 없으면 전역 배경 사용 (기존 로직)
      const savedBackground = localStorage.getItem("selectedBackground");
      if (savedBackground) {
        setCurrentBackgroundImage(savedBackground);
      } else {
        setCurrentBackgroundImage(backgroundImage);
      }
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
  }, [dreamId, backgroundImage]);

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
        camera={{ position: [0, 0.1, -5], fov: 35 }}
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
          {/* 카메라 줌인 애니메이션 */}
          <CameraZoomIn isLoaded={isLoaded} />

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
            audioElement={audioElement}
            enableLipSync={enableLipSync}
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
