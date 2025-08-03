"use client";

import { useEffect, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";

interface VRMModelProps {
  url: string;
}

export default function VRMModel({ url }: VRMModelProps) {
  const vrmRef = useRef<VRM | null>(null);

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

      // 초기 팔/손 자세 설정 (자연스럽게 내림)
      if (vrm.humanoid) {
        // 왼쪽 팔
        const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
        const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
        const leftHand = vrm.humanoid.getNormalizedBoneNode("leftHand");

        if (leftUpperArm) {
          leftUpperArm.rotation.x = 0.2; // 팔을 앞으로
          leftUpperArm.rotation.z = 1.3; // 팔을 몸통 옆으로 완전히 내림
        }
        if (leftLowerArm) {
          leftLowerArm.rotation.x = -0.3; // 팔꿈치 약간 구부림
        }
        if (leftHand) {
          leftHand.rotation.x = -0.2; // 손목 자연스럽게
        }

        // 오른쪽 팔
        const rightUpperArm =
          vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
        const rightLowerArm =
          vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
        const rightHand = vrm.humanoid.getNormalizedBoneNode("rightHand");

        if (rightUpperArm) {
          rightUpperArm.rotation.x = 0.2; // 팔을 앞으로
          rightUpperArm.rotation.z = -1.3; // 팔을 몸통 옆으로 완전히 내림
        }
        if (rightLowerArm) {
          rightLowerArm.rotation.x = -0.3; // 팔꿈치 약간 구부림
        }
        if (rightHand) {
          rightHand.rotation.x = -0.2; // 손목 자연스럽게
        }
      }

      console.log("VRM 로드 완료:", vrm);
    }
  }, [gltf]);

  // 애니메이션 루프
  useFrame((state, delta) => {
    if (vrmRef.current) {
      // VRM 업데이트 (필수)
      vrmRef.current.update(delta);

      const time = state.clock.elapsedTime;

      // 표정 애니메이션
      if (vrmRef.current.expressionManager) {
        // 눈 깜빡임 (더 자연스럽게)
        const blinkTime = time * 0.5;
        const blinkValue = Math.sin(blinkTime) > 0.95 ? 1 : 0;
        vrmRef.current.expressionManager.setValue("blink", blinkValue);

        // 미세한 행복 표정
        const happyValue = (Math.sin(time * 0.3) + 1) * 0.1;
        vrmRef.current.expressionManager.setValue("happy", happyValue);
      }

      // 본(Bone) 애니메이션 - 미세한 움직임
      if (vrmRef.current.humanoid) {
        // 숨쉬기 애니메이션 (가슴 확장)
        const breathe = Math.sin(time * 1.5) * 0.015;
        const spine = vrmRef.current.humanoid.getNormalizedBoneNode("spine");
        if (spine) {
          spine.scale.setScalar(1 + breathe);
        }

        // 머리 미세 움직임 (아이들 모션)
        const head = vrmRef.current.humanoid.getNormalizedBoneNode("head");
        if (head) {
          head.rotation.y = Math.sin(time * 0.4) * 0.08;
          head.rotation.x = Math.sin(time * 0.6) * 0.03;
          head.rotation.z = Math.sin(time * 0.5) * 0.02;
        }

        // 어깨 미세 움직임
        const leftShoulder =
          vrmRef.current.humanoid.getNormalizedBoneNode("leftShoulder");
        const rightShoulder =
          vrmRef.current.humanoid.getNormalizedBoneNode("rightShoulder");

        if (leftShoulder && rightShoulder) {
          const shoulderMove = Math.sin(time * 0.8) * 0.03;
          leftShoulder.rotation.z = shoulderMove;
          rightShoulder.rotation.z = -shoulderMove;
        }

        // 목 미세 움직임
        const neck = vrmRef.current.humanoid.getNormalizedBoneNode("neck");
        if (neck) {
          neck.rotation.y = Math.sin(time * 0.3) * 0.05;
        }
      }
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