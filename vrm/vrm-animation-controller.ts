import { VRM } from "@pixiv/three-vrm";
import { Vector3 } from "three";
import { VRMAnimationState } from "./vrm-animation";

/**
 * VRM 모델에 애니메이션을 적용하는 컨트롤러 함수들
 */

/**
 * 표정 애니메이션 적용
 */
export function applyExpressions(
  vrm: VRM,
  expressions: VRMAnimationState["expressions"]
) {
  if (!vrm.expressionManager || !expressions) return;

  // 기본 감정 표정 적용
  if (expressions.happy !== undefined) {
    vrm.expressionManager.setValue("happy", expressions.happy);
  }
  if (expressions.angry !== undefined) {
    vrm.expressionManager.setValue("angry", expressions.angry);
  }
  if (expressions.sad !== undefined) {
    vrm.expressionManager.setValue("sad", expressions.sad);
  }
  if (expressions.surprised !== undefined) {
    vrm.expressionManager.setValue("surprised", expressions.surprised);
  }
  if (expressions.relaxed !== undefined) {
    vrm.expressionManager.setValue("relaxed", expressions.relaxed);
  }
  if (expressions.neutral !== undefined) {
    vrm.expressionManager.setValue("neutral", expressions.neutral);
  }

  // 세부 감정 표정
  if (expressions.joy !== undefined) {
    vrm.expressionManager.setValue("joy", expressions.joy);
  }
  if (expressions.sorrow !== undefined) {
    vrm.expressionManager.setValue("sorrow", expressions.sorrow);
  }
  if (expressions.fun !== undefined) {
    vrm.expressionManager.setValue("fun", expressions.fun);
  }
  if (expressions.extra !== undefined) {
    vrm.expressionManager.setValue("extra", expressions.extra);
  }

  // 눈 관련
  if (expressions.blink !== undefined) {
    vrm.expressionManager.setValue("blink", expressions.blink);
  }
  if (expressions.blinkLeft !== undefined) {
    vrm.expressionManager.setValue("blinkLeft", expressions.blinkLeft);
  }
  if (expressions.blinkRight !== undefined) {
    vrm.expressionManager.setValue("blinkRight", expressions.blinkRight);
  }
  if (expressions.lookUp !== undefined) {
    vrm.expressionManager.setValue("lookUp", expressions.lookUp);
  }
  if (expressions.lookDown !== undefined) {
    vrm.expressionManager.setValue("lookDown", expressions.lookDown);
  }
  if (expressions.lookLeft !== undefined) {
    vrm.expressionManager.setValue("lookLeft", expressions.lookLeft);
  }
  if (expressions.lookRight !== undefined) {
    vrm.expressionManager.setValue("lookRight", expressions.lookRight);
  }

  // 입 모양 (립싱크)
  if (expressions.aa !== undefined) {
    vrm.expressionManager.setValue("aa", expressions.aa);
  }
  if (expressions.ih !== undefined) {
    vrm.expressionManager.setValue("ih", expressions.ih);
  }
  if (expressions.ou !== undefined) {
    vrm.expressionManager.setValue("ou", expressions.ou);
  }
  if (expressions.ee !== undefined) {
    vrm.expressionManager.setValue("ee", expressions.ee);
  }
  if (expressions.oh !== undefined) {
    vrm.expressionManager.setValue("oh", expressions.oh);
  }
}

/**
 * 시선 제어 적용
 */
export function applyLookAt(vrm: VRM, lookAt: VRMAnimationState["lookAt"]) {
  if (!vrm.lookAt || !lookAt) return;

  // 시선 타겟 위치 설정
  if (
    lookAt.targetX !== undefined &&
    lookAt.targetY !== undefined &&
    lookAt.targetZ !== undefined
  ) {
    if (vrm.lookAt.target) {
      // Create a new Vector3 and set its position
      const targetPosition = new Vector3(
        lookAt.targetX,
        lookAt.targetY,
        lookAt.targetZ
      );
      // If the target has a position property, use that, otherwise assume it's a Vector3
      if ("position" in vrm.lookAt.target) {
        vrm.lookAt.target.position.copy(targetPosition);
      } else {
        (vrm.lookAt.target as Vector3).copy(targetPosition);
      }
    }
  }

  // 시선 제어 설정
  if (lookAt.autoUpdate !== undefined) {
    vrm.lookAt.autoUpdate = lookAt.autoUpdate;
  }

  // 추가 시선 제어 파라미터들 (스키마에 있지만 VRM 라이브러리에서 직접 지원하지 않는 것들은 주석 처리)
  // intensity, yaw, pitch, smoothFactor는 VRM 1.0 표준에서 직접 지원하지 않음
  // 필요시 커스텀 구현 가능
}

/**
 * 머리/목 제스처 적용
 */
export function applyHeadGestures(
  vrm: VRM,
  headGestures: VRMAnimationState["headGestures"]
) {
  if (!vrm.humanoid || !headGestures) return;

  const head = vrm.humanoid.getNormalizedBoneNode("head");

  if (head) {
    // 직접 회전 제어
    if (headGestures.rotationX !== undefined) {
      head.rotation.x = (headGestures.rotationX * Math.PI) / 180;
    }
    if (headGestures.rotationY !== undefined) {
      head.rotation.y = (headGestures.rotationY * Math.PI) / 180;
    }
    if (headGestures.rotationZ !== undefined) {
      head.rotation.z = (headGestures.rotationZ * Math.PI) / 180;
    }

    // 갸우뚱 (기울기)
    if (
      headGestures.tiltDirection !== undefined &&
      headGestures.tiltIntensity !== undefined
    ) {
      head.rotation.z =
        headGestures.tiltDirection * headGestures.tiltIntensity * 0.3;
    }
  }

  // 끄덕임과 젓기는 애니메이션 시스템에서 처리되어야 하므로 여기서는 주석 처리
  // nodIntensity, nodSpeed, nodRepeat, shakeIntensity, shakeSpeed, shakeRepeat
  // 이는 타이밍 시스템과 함께 구현될 예정
}

/**
 * 손/팔 제스처 적용
 */
export function applyHandGestures(
  vrm: VRM,
  handGestures: VRMAnimationState["handGestures"]
) {
  if (!vrm.humanoid || !handGestures) return;

  // 팔 관련 본들
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
  const leftHand = vrm.humanoid.getNormalizedBoneNode("leftHand");
  const rightHand = vrm.humanoid.getNormalizedBoneNode("rightHand");

  // 팔짱 끼기
  if (handGestures.crossArms !== undefined && handGestures.crossArms > 0) {
    const intensity = handGestures.crossArms;
    if (leftUpperArm && rightUpperArm) {
      leftUpperArm.rotation.z = 1.3 - intensity * 0.8; // 팔을 가슴 앞으로
      rightUpperArm.rotation.z = -1.3 + intensity * 0.8;
      leftUpperArm.rotation.y = intensity * 0.5;
      rightUpperArm.rotation.y = -intensity * 0.5;
    }
  }

  // 팔 벌리기
  if (handGestures.armSpread !== undefined && handGestures.armSpread > 0) {
    const intensity = handGestures.armSpread;
    if (leftUpperArm && rightUpperArm) {
      leftUpperArm.rotation.z = 1.3 + intensity * 0.8; // 팔을 옆으로 벌리기
      rightUpperArm.rotation.z = -1.3 - intensity * 0.8;
    }
  }

  // 직접 팔 회전 제어
  if (leftUpperArm) {
    if (handGestures.leftArmRotationX !== undefined) {
      leftUpperArm.rotation.x = (handGestures.leftArmRotationX * Math.PI) / 180;
    }
    if (handGestures.leftArmRotationY !== undefined) {
      leftUpperArm.rotation.y = (handGestures.leftArmRotationY * Math.PI) / 180;
    }
    if (handGestures.leftArmRotationZ !== undefined) {
      leftUpperArm.rotation.z = (handGestures.leftArmRotationZ * Math.PI) / 180;
    }
  }

  if (rightUpperArm) {
    if (handGestures.rightArmRotationX !== undefined) {
      rightUpperArm.rotation.x =
        (handGestures.rightArmRotationX * Math.PI) / 180;
    }
    if (handGestures.rightArmRotationY !== undefined) {
      rightUpperArm.rotation.y =
        (handGestures.rightArmRotationY * Math.PI) / 180;
    }
    if (handGestures.rightArmRotationZ !== undefined) {
      rightUpperArm.rotation.z =
        (handGestures.rightArmRotationZ * Math.PI) / 180;
    }
  }

  // 손목 회전 제어
  if (leftHand) {
    if (handGestures.leftHandRotationX !== undefined) {
      leftHand.rotation.x = (handGestures.leftHandRotationX * Math.PI) / 180;
    }
    if (handGestures.leftHandRotationY !== undefined) {
      leftHand.rotation.y = (handGestures.leftHandRotationY * Math.PI) / 180;
    }
    if (handGestures.leftHandRotationZ !== undefined) {
      leftHand.rotation.z = (handGestures.leftHandRotationZ * Math.PI) / 180;
    }
  }

  if (rightHand) {
    if (handGestures.rightHandRotationX !== undefined) {
      rightHand.rotation.x = (handGestures.rightHandRotationX * Math.PI) / 180;
    }
    if (handGestures.rightHandRotationY !== undefined) {
      rightHand.rotation.y = (handGestures.rightHandRotationY * Math.PI) / 180;
    }
    if (handGestures.rightHandRotationZ !== undefined) {
      rightHand.rotation.z = (handGestures.rightHandRotationZ * Math.PI) / 180;
    }
  }

  // 손 흔들기, 가리키기, 엄지척, 박수, 팔 올리기는 애니메이션 시스템에서 처리
  // waveHand, waveIntensity, waveSpeed, pointHand, pointDirection, pointIntensity
  // thumbsUpHand, thumbsUpIntensity, clapIntensity, clapSpeed, clapRepeat, armRaise
  // 이는 타이밍 시스템과 함께 구현될 예정
}

/**
 * 몸통/자세 제어 적용
 */
export function applyBodyPosture(
  vrm: VRM,
  bodyPosture: VRMAnimationState["bodyPosture"]
) {
  if (!vrm.humanoid || !bodyPosture) return;

  const spine = vrm.humanoid.getNormalizedBoneNode("spine");
  const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
  const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

  // 척추 회전
  if (spine) {
    if (bodyPosture.spineRotationX !== undefined) {
      spine.rotation.x = (bodyPosture.spineRotationX * Math.PI) / 180;
    }
    if (bodyPosture.spineRotationY !== undefined) {
      spine.rotation.y = (bodyPosture.spineRotationY * Math.PI) / 180;
    }
    if (bodyPosture.spineRotationZ !== undefined) {
      spine.rotation.z = (bodyPosture.spineRotationZ * Math.PI) / 180;
    }
  }

  // 어깨 높이 조절
  if (leftShoulder && bodyPosture.leftShoulderHeight !== undefined) {
    leftShoulder.position.y = bodyPosture.leftShoulderHeight;
  }
  if (rightShoulder && bodyPosture.rightShoulderHeight !== undefined) {
    rightShoulder.position.y = bodyPosture.rightShoulderHeight;
  }

  // 어깨 으쓱
  if (
    bodyPosture.shoulderShrug !== undefined &&
    bodyPosture.shoulderShrug > 0
  ) {
    const intensity = bodyPosture.shoulderShrug;
    if (leftShoulder) {
      leftShoulder.rotation.z = intensity * 0.3;
    }
    if (rightShoulder) {
      rightShoulder.rotation.z = -intensity * 0.3;
    }
  }

  // 어깨 긴장도
  if (
    bodyPosture.shoulderTension !== undefined &&
    bodyPosture.shoulderTension > 0
  ) {
    const tension = bodyPosture.shoulderTension;
    if (leftShoulder) {
      leftShoulder.rotation.x = tension * 0.1;
    }
    if (rightShoulder) {
      rightShoulder.rotation.x = tension * 0.1;
    }
  }

  // 전체 자세 관련 필드들 (confidence, openness, energy, weightShift 등)은
  // 복합적인 애니메이션 처리가 필요하므로 타이밍 시스템에서 구현 예정
  // 호흡 관련 (breathingIntensity, breathingSpeed)도 아이들 모션과 함께 처리
}

/**
 * 전체 애니메이션 상태를 VRM에 적용하는 메인 함수
 */
export function applyVRMAnimation(vrm: VRM, animationState: VRMAnimationState) {
  if (!vrm) return;

  // 각 애니메이션 카테고리별로 적용
  if (animationState.expressions) {
    applyExpressions(vrm, animationState.expressions);
  }

  if (animationState.lookAt) {
    applyLookAt(vrm, animationState.lookAt);
  }

  if (animationState.headGestures) {
    applyHeadGestures(vrm, animationState.headGestures);
  }

  if (animationState.handGestures) {
    applyHandGestures(vrm, animationState.handGestures);
  }

  if (animationState.bodyPosture) {
    applyBodyPosture(vrm, animationState.bodyPosture);
  }

  // idleMotion과 timing은 애니메이션 시스템에서 별도 처리
  // 이는 다음 단계에서 구현 예정
}
