"use client";

import { useEffect, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import { VRMAnimationLoaderPlugin } from "@pixiv/three-vrm-animation";
import { AnimationPresetType, getAnimationConfig } from "@/lib/vrm-animations";
import { VRMAAnimationManager } from "@/lib/vrma-animation-manager";
import { LipSyncManager } from "@/lib/lip-sync-manager";

interface VRMModelProps {
  url: string;
  animationPreset?: AnimationPresetType;
  onAnimationChange?: (preset: AnimationPresetType) => void;
  onLoaded?: () => void;
  audioElement?: HTMLAudioElement | null;
  enableLipSync?: boolean;
}

export default function VRMModel({
  url,
  animationPreset = "idle",
  onAnimationChange,
  onLoaded,
  audioElement,
  enableLipSync = false,
}: VRMModelProps) {
  const vrmRef = useRef<VRM | null>(null);
  const animationManagerRef = useRef<VRMAAnimationManager | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAnimationRef = useRef<AnimationPresetType>("idle");
  const lipSyncManagerRef = useRef<LipSyncManager | null>(null);

  // GLTFLoader에 VRM 및 VRMA 플러그인 등록
  const gltf = useLoader(GLTFLoader, url, (loader) => {
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
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

      // 기존 애니메이션 매니저와 타이머 정리
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }

      // 새로운 VRM에 대한 새로운 애니메이션 매니저 생성
      animationManagerRef.current = new VRMAAnimationManager(vrm);
      currentAnimationRef.current = "idle";
      // 초기 idle 애니메이션 시작 (비동기)
      animationManagerRef.current.playAnimation("idle", 0.5);

      // 립싱크 매니저 초기화 (기존 매니저 정리 후 새로 생성)
      if (enableLipSync) {
        if (lipSyncManagerRef.current) {
          lipSyncManagerRef.current.stopLipSync();
        }
        lipSyncManagerRef.current = new LipSyncManager(vrm);
      }

      // 로딩 완료 콜백 호출
      onLoaded?.();
    }
  }, [gltf, onLoaded, enableLipSync]);

  // 애니메이션 프리셋 변경 감지
  useEffect(() => {
    const playNewAnimation = async () => {
      if (animationManagerRef.current && animationPreset) {
        // 현재 애니메이션과 같으면 스킵
        if (currentAnimationRef.current === animationPreset) {
          return;
        }

        // 현재 애니메이션 상태 업데이트
        currentAnimationRef.current = animationPreset;

        // 기존 타이머 정리
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        try {
          // 새 VRMA 애니메이션 시작 (비동기)
          await animationManagerRef.current.playAnimation(animationPreset, 0.5);

          // idle이 아닌 경우에만 자동 복귀 타이머 설정
          if (animationPreset !== "idle") {
            const config = getAnimationConfig(animationPreset);
            const totalDuration = (config.duration + 1.0) * 1000;

            animationTimeoutRef.current = setTimeout(() => {
              onAnimationChange?.("idle");
            }, totalDuration);
          }
        } catch (error) {
          console.error(`애니메이션 재생 실패: ${animationPreset}`, error);
        }
      }
    };

    playNewAnimation();
  }, [animationPreset]);

  // 오디오 엘리먼트와 립싱크 연동
  useEffect(() => {
    if (!enableLipSync || !lipSyncManagerRef.current) {
      return;
    }

    if (audioElement) {
      // 오디오가 이미 재생 중이면 즉시 립싱크 시작
      if (!audioElement.paused) {
        lipSyncManagerRef.current?.startLipSync(audioElement);
      }

      // 오디오 시작 시 립싱크 시작
      const handlePlay = () => {
        lipSyncManagerRef.current?.startLipSync(audioElement);
      };

      // 오디오 종료 시 립싱크 중단
      const handleEnded = () => {
        lipSyncManagerRef.current?.stopLipSync();
      };

      // 오디오 일시정지 시 립싱크 중단
      const handlePause = () => {
        lipSyncManagerRef.current?.stopLipSync();
      };

      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("ended", handleEnded);
      audioElement.addEventListener("pause", handlePause);

      return () => {
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("ended", handleEnded);
        audioElement.removeEventListener("pause", handlePause);
      };
    } else {
      // 오디오가 없으면 립싱크 중단
      lipSyncManagerRef.current?.stopLipSync();
    }
  }, [audioElement, enableLipSync]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationManagerRef.current) {
        animationManagerRef.current.dispose();
      }
      if (lipSyncManagerRef.current) {
        lipSyncManagerRef.current.stopLipSync();
      }
    };
  }, []);

  // 컴포넌트 cleanup
  useEffect(() => {
    return () => {
      // 애니메이션 타이머 정리
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // 립싱크 정리
      if (lipSyncManagerRef.current) {
        lipSyncManagerRef.current.stopLipSync();
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
