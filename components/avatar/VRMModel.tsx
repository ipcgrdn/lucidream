"use client";

import { useEffect, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import {
  VRMAnimationManager,
  AnimationPresetType,
  getAnimationConfig,
} from "@/lib/vrm-animations";

interface VRMModelProps {
  url: string;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
}

export default function VRMModel({
  url,
  animationPreset = "idle",
  onAnimationChange,
}: VRMModelProps) {
  const vrmRef = useRef<VRM | null>(null);
  const animationManagerRef = useRef<VRMAnimationManager | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // GLTFLoader에 VRM 플러그인 등록
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
  });

  useEffect(() => {
    if (gltf?.userData?.vrm) {
      const vrm = gltf.userData.vrm as VRM;
      vrmRef.current = vrm;

      // VRM 최적화 설정
      vrm.scene.traverse((child) => {
        if (child.type === "Mesh") {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // 절좌의 culling 비활성화 (애니메이션 성능 개선)
      vrm.scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      // 새로운 애니메이션 매니저 초기화
      if (!animationManagerRef.current) {
        animationManagerRef.current = new VRMAnimationManager(vrm);
        // 초기 idle 애니메이션 시작
        animationManagerRef.current.playAnimation("idle", 0.5);
      }
    }
  }, [gltf]);

  // 애니메이션 프리셋 변경 감지
  useEffect(() => {
    if (animationManagerRef.current && animationPreset) {
      // 기존 타이머 정리
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // 새 애니메이션 시작
      animationManagerRef.current.playAnimation(animationPreset, 0.5);

      // idle이 아닌 경우에만 자동 복귀 타이머 설정
      if (animationPreset !== "idle") {
        const config = getAnimationConfig(animationPreset);
        const totalDuration = (config.duration + 1.0) * 1000; // 전환시간 0.5초 + 애니메이션 지속시간 + 여유시간

        animationTimeoutRef.current = setTimeout(() => {
          onAnimationChange?.("idle");
        }, totalDuration);
      }
    }
  }, [animationPreset, onAnimationChange]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationManagerRef.current) {
        animationManagerRef.current.dispose();
      }
    };
  }, []);

  // 애니메이션 루프
  useFrame((_, delta) => {
    if (vrmRef.current) {
      // 🔥 중요: 애니메이션 매니저를 먼저 업데이트해야 함!
      if (animationManagerRef.current) {
        animationManagerRef.current.update(delta);
      }

      // 그 다음 VRM 업데이트 (애니메이션이 적용된 후)
      vrmRef.current.update(delta);
    }
  });

  return gltf?.userData?.vrm ? (
    <primitive
      object={gltf.userData.vrm.scene}
      position={[0, -1, 0]}
      scale={1}
    />
  ) : null;
}