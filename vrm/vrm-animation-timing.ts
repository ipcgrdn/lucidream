import { VRM } from "@pixiv/three-vrm";
import { VRMAnimationState } from "./vrm-animation";
import { applyVRMAnimation } from "./vrm-animation-controller";

/**
 * 이징 함수들
 */
const EasingFunctions = {
  linear: (t: number) => t,
  "ease-in": (t: number) => t * t,
  "ease-out": (t: number) => 1 - Math.pow(1 - t, 2),
  "ease-in-out": (t: number) =>
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
};

/**
 * 진행 중인 애니메이션 정보
 */
interface AnimationInstance {
  id: string;
  vrm: VRM;
  targetState: VRMAnimationState;
  originalState: Partial<VRMAnimationState>;
  startTime: number;
  duration: number;
  delay: number;
  easing: keyof typeof EasingFunctions;
  repeat: number;
  currentRepeat: number;
  yoyo: boolean;
  isReversePhase: boolean;
  autoRevert: boolean;
  revertDelay: number;
  revertDuration: number;
  onComplete?: () => void;
}

/**
 * 애니메이션 매니저 클래스
 */
class VRMAnimationManager {
  private activeAnimations = new Map<string, AnimationInstance>();
  private animationIdCounter = 0;

  /**
   * 애니메이션 시작
   */
  startAnimation(
    vrm: VRM,
    animationState: VRMAnimationState,
    onComplete?: () => void
  ): string {
    const timing = animationState.timing;
    if (!timing) {
      // 타이밍 정보가 없으면 즉시 적용
      applyVRMAnimation(vrm, animationState);
      if (onComplete) onComplete();
      return "";
    }

    const animationId = `anim_${++this.animationIdCounter}`;

    // 현재 상태를 원본 상태로 저장 (자동 복원용)
    const originalState = this.captureCurrentState(vrm);

    const animation: AnimationInstance = {
      id: animationId,
      vrm,
      targetState: animationState,
      originalState,
      startTime: Date.now() + (timing.delay || 0) * 1000,
      duration: (timing.duration || 2.0) * 1000,
      delay: (timing.delay || 0) * 1000,
      easing: timing.easing || "ease-in-out",
      repeat: timing.repeat || 1,
      currentRepeat: 0,
      yoyo: timing.yoyo || false,
      isReversePhase: false,
      autoRevert: timing.autoRevert || false,
      revertDelay: (timing.revertDelay || 0) * 1000,
      revertDuration: (timing.revertDuration || 1.0) * 1000,
      onComplete,
    };

    this.activeAnimations.set(animationId, animation);

    return animationId;
  }

  /**
   * 애니메이션 정지
   */
  stopAnimation(animationId: string) {
    this.activeAnimations.delete(animationId);
  }

  /**
   * 모든 애니메이션 정지
   */
  stopAllAnimations() {
    this.activeAnimations.clear();
  }

  /**
   * 애니메이션 업데이트 (매 프레임 호출)
   */
  update() {
    const currentTime = Date.now();
    const completedAnimations: string[] = [];

    for (const [id, animation] of this.activeAnimations) {
      // 지연 시간 체크
      if (currentTime < animation.startTime) {
        continue;
      }

      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1.0);

      // 이징 적용
      const easingFunction =
        EasingFunctions[animation.easing] || EasingFunctions.linear;
      let easedProgress = easingFunction(progress);

      // Yoyo 효과 (왕복 애니메이션)
      if (animation.yoyo && animation.isReversePhase) {
        easedProgress = 1 - easedProgress;
      }

      // 애니메이션 적용
      this.applyInterpolatedAnimation(animation, easedProgress);

      // 완료 체크
      if (progress >= 1.0) {
        animation.currentRepeat++;

        // 반복 처리
        if (animation.currentRepeat < animation.repeat) {
          // Yoyo 효과
          if (animation.yoyo) {
            animation.isReversePhase = !animation.isReversePhase;
          }
          animation.startTime = currentTime; // 다음 반복 시작
        } else {
          // 애니메이션 완료
          completedAnimations.push(id);

          // 자동 복원 처리
          if (animation.autoRevert) {
            this.startRevertAnimation(animation);
          } else if (animation.onComplete) {
            animation.onComplete();
          }
        }
      }
    }

    // 완료된 애니메이션 제거
    completedAnimations.forEach((id) => {
      this.activeAnimations.delete(id);
    });
  }

  /**
   * 보간된 애니메이션 적용
   */
  private applyInterpolatedAnimation(
    animation: AnimationInstance,
    progress: number
  ) {
    const { vrm, targetState, originalState } = animation;

    // 표정 보간
    if (targetState.expressions && originalState.expressions) {
      this.interpolateExpressions(
        vrm,
        originalState.expressions,
        targetState.expressions,
        progress
      );
    }

    // 시선 보간
    if (targetState.lookAt && originalState.lookAt) {
      this.interpolateLookAt(
        vrm,
        originalState.lookAt,
        targetState.lookAt,
        progress
      );
    }

    // 머리 제스처 보간
    if (targetState.headGestures && originalState.headGestures) {
      this.interpolateHeadGestures(
        vrm,
        originalState.headGestures,
        targetState.headGestures,
        progress
      );
    }

    // 손/팔 제스처 보간
    if (targetState.handGestures && originalState.handGestures) {
      this.interpolateHandGestures(
        vrm,
        originalState.handGestures,
        targetState.handGestures,
        progress
      );
    }

    // 몸통/자세 보간
    if (targetState.bodyPosture && originalState.bodyPosture) {
      this.interpolateBodyPosture(
        vrm,
        originalState.bodyPosture,
        targetState.bodyPosture,
        progress
      );
    }
  }

  /**
   * 현재 VRM 상태 캡처
   */
  private captureCurrentState(vrm: VRM): Partial<VRMAnimationState> {
    const state: Partial<VRMAnimationState> = {};

    // 표정 상태 캡처
    if (vrm.expressionManager) {
      state.expressions = {
        happy: vrm.expressionManager.getValue("happy") || 0,
        angry: vrm.expressionManager.getValue("angry") || 0,
        sad: vrm.expressionManager.getValue("sad") || 0,
        surprised: vrm.expressionManager.getValue("surprised") || 0,
        relaxed: vrm.expressionManager.getValue("relaxed") || 0,
        neutral: vrm.expressionManager.getValue("neutral") || 0,
        joy: vrm.expressionManager.getValue("joy") || 0,
        sorrow: vrm.expressionManager.getValue("sorrow") || 0,
        fun: vrm.expressionManager.getValue("fun") || 0,
        extra: vrm.expressionManager.getValue("extra") || 0,
        blink: vrm.expressionManager.getValue("blink") || 0,
        blinkLeft: vrm.expressionManager.getValue("blinkLeft") || 0,
        blinkRight: vrm.expressionManager.getValue("blinkRight") || 0,
        lookUp: vrm.expressionManager.getValue("lookUp") || 0,
        lookDown: vrm.expressionManager.getValue("lookDown") || 0,
        lookLeft: vrm.expressionManager.getValue("lookLeft") || 0,
        lookRight: vrm.expressionManager.getValue("lookRight") || 0,
        aa: vrm.expressionManager.getValue("aa") || 0,
        ih: vrm.expressionManager.getValue("ih") || 0,
        ou: vrm.expressionManager.getValue("ou") || 0,
        ee: vrm.expressionManager.getValue("ee") || 0,
        oh: vrm.expressionManager.getValue("oh") || 0,
      };
    }

    // 시선 상태 캡처
    if (vrm.lookAt && vrm.lookAt.target) {
      let currentTargetX = 0, currentTargetY = 1, currentTargetZ = 0;
      
      if (vrm.lookAt.target && 'position' in vrm.lookAt.target) {
        const target = vrm.lookAt.target as any;
        currentTargetX = target.position?.x || 0;
        currentTargetY = target.position?.y || 1;
        currentTargetZ = target.position?.z || 0;
      }
      
      state.lookAt = {
        targetX: currentTargetX,
        targetY: currentTargetY,
        targetZ: currentTargetZ,
        intensity: 1,
        yaw: 0,
        pitch: 0,
        smoothFactor: 10,
        autoUpdate: true,
      };
    }

    // 현재 본 상태를 실제로 캡처
    if (vrm.humanoid) {
      // 머리 회전 캡처
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      const currentHeadRotation = head ? {
        rotationX: (head.rotation.x * 180) / Math.PI,
        rotationY: (head.rotation.y * 180) / Math.PI,
        rotationZ: (head.rotation.z * 180) / Math.PI,
      } : { rotationX: 0, rotationY: 0, rotationZ: 0 };

      state.headGestures = {
        nodIntensity: 0,
        nodSpeed: 1,
        nodRepeat: 1,
        shakeIntensity: 0,
        shakeSpeed: 1,
        shakeRepeat: 1,
        tiltDirection: 0,
        tiltIntensity: 0,
        ...currentHeadRotation,
      };

      // 팔 회전 캡처
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
      const leftHand = vrm.humanoid.getNormalizedBoneNode("leftHand");
      const rightHand = vrm.humanoid.getNormalizedBoneNode("rightHand");

      const currentArmRotations = {
        leftArmRotationX: leftUpperArm ? (leftUpperArm.rotation.x * 180) / Math.PI : 0,
        leftArmRotationY: leftUpperArm ? (leftUpperArm.rotation.y * 180) / Math.PI : 0,
        leftArmRotationZ: leftUpperArm ? (leftUpperArm.rotation.z * 180) / Math.PI : 0,
        rightArmRotationX: rightUpperArm ? (rightUpperArm.rotation.x * 180) / Math.PI : 0,
        rightArmRotationY: rightUpperArm ? (rightUpperArm.rotation.y * 180) / Math.PI : 0,
        rightArmRotationZ: rightUpperArm ? (rightUpperArm.rotation.z * 180) / Math.PI : 0,
        leftHandRotationX: leftHand ? (leftHand.rotation.x * 180) / Math.PI : 0,
        leftHandRotationY: leftHand ? (leftHand.rotation.y * 180) / Math.PI : 0,
        leftHandRotationZ: leftHand ? (leftHand.rotation.z * 180) / Math.PI : 0,
        rightHandRotationX: rightHand ? (rightHand.rotation.x * 180) / Math.PI : 0,
        rightHandRotationY: rightHand ? (rightHand.rotation.y * 180) / Math.PI : 0,
        rightHandRotationZ: rightHand ? (rightHand.rotation.z * 180) / Math.PI : 0,
      };

      state.handGestures = {
        waveHand: "none",
        waveIntensity: 0,
        waveSpeed: 1,
        pointHand: "none",
        pointDirection: "forward",
        pointIntensity: 0,
        thumbsUpHand: "none",
        thumbsUpIntensity: 0,
        clapIntensity: 0,
        clapSpeed: 1,
        clapRepeat: 1,
        crossArms: 0,
        armSpread: 0,
        armRaise: "none",
        ...currentArmRotations,
      };

      // 척추 회전 캡처
      const spine = vrm.humanoid.getNormalizedBoneNode("spine");
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

      const currentSpineRotation = spine ? {
        spineRotationX: (spine.rotation.x * 180) / Math.PI,
        spineRotationY: (spine.rotation.y * 180) / Math.PI,
        spineRotationZ: (spine.rotation.z * 180) / Math.PI,
      } : { spineRotationX: 0, spineRotationY: 0, spineRotationZ: 0 };

      state.bodyPosture = {
        shoulderTension: 0,
        shoulderShrug: 0,
        leftShoulderHeight: leftShoulder ? leftShoulder.position.y : 0,
        rightShoulderHeight: rightShoulder ? rightShoulder.position.y : 0,
        confidence: 0.5,
        openness: 0.5,
        energy: 0.5,
        weightShiftX: 0,
        weightShiftZ: 0,
        breathingIntensity: 0.3,
        breathingSpeed: 1,
        ...currentSpineRotation,
      };
    }
    return state;
  }

  /**
   * 자동 복원 애니메이션 시작
   */
  private startRevertAnimation(originalAnimation: AnimationInstance) {
    const revertAnimationState: VRMAnimationState = {
      ...originalAnimation.originalState,
      timing: {
        duration: originalAnimation.revertDuration / 1000,
        delay: originalAnimation.revertDelay / 1000,
        easing: "ease-out",
        loop: false,
        repeat: 1,
        yoyo: false,
        autoRevert: false,
        revertDelay: 0,
        revertDuration: 0,
      },
    } as VRMAnimationState;

    // 복원 애니메이션 시작
    setTimeout(() => {
      this.startAnimation(
        originalAnimation.vrm,
        revertAnimationState,
        originalAnimation.onComplete
      );
    }, originalAnimation.revertDelay);
  }

  /**
   * 표정 보간
   */
  private interpolateExpressions(
    vrm: VRM,
    from: any,
    to: any,
    progress: number
  ) {
    if (!vrm.expressionManager) return;

    const expressionKeys = Object.keys(to);
    for (const key of expressionKeys) {
      const fromValue = from[key] || 0;
      const toValue = to[key] || 0;
      const interpolatedValue = fromValue + (toValue - fromValue) * progress;
      vrm.expressionManager.setValue(key, interpolatedValue);
    }
  }

  /**
   * 시선 보간
   */
  private interpolateLookAt(vrm: VRM, from: any, to: any, progress: number) {
    // 현재는 즉시 적용, 필요시 보간 구현
    if (vrm.lookAt && vrm.lookAt.target && "set" in vrm.lookAt.target) {
      const targetX = from.targetX + (to.targetX - from.targetX) * progress;
      const targetY = from.targetY + (to.targetY - from.targetY) * progress;
      const targetZ = from.targetZ + (to.targetZ - from.targetZ) * progress;

      if (vrm.lookAt.target && "position" in vrm.lookAt.target) {
        vrm.lookAt.target.position.set(targetX, targetY, targetZ);
      }
    }
  }

  /**
   * 머리 제스처 보간
   */
  private interpolateHeadGestures(
    vrm: VRM,
    from: any,
    to: any,
    progress: number
  ) {
    if (!vrm.humanoid) return;

    const head = vrm.humanoid.getNormalizedBoneNode("head");
    if (head) {
      if (to.rotationX !== undefined) {
        const fromRot = from.rotationX || 0;
        const toRot = to.rotationX;
        const interpolatedRot = fromRot + (toRot - fromRot) * progress;
        head.rotation.x = (interpolatedRot * Math.PI) / 180;
      }
      if (to.rotationY !== undefined) {
        const fromRot = from.rotationY || 0;
        const toRot = to.rotationY;
        const interpolatedRot = fromRot + (toRot - fromRot) * progress;
        head.rotation.y = (interpolatedRot * Math.PI) / 180;
      }
      if (to.rotationZ !== undefined) {
        const fromRot = from.rotationZ || 0;
        const toRot = to.rotationZ;
        const interpolatedRot = fromRot + (toRot - fromRot) * progress;
        head.rotation.z = (interpolatedRot * Math.PI) / 180;
      }
    }
  }

  /**
   * 손/팔 제스처 보간
   */
  private interpolateHandGestures(
    vrm: VRM,
    from: any,
    to: any,
    progress: number
  ) {
    if (!vrm.humanoid) return;

    // 팔 회전 보간
    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");

    if (leftUpperArm) {
      this.interpolateBoneRotation(
        leftUpperArm,
        from,
        to,
        "leftArmRotation",
        progress
      );
    }
    if (rightUpperArm) {
      this.interpolateBoneRotation(
        rightUpperArm,
        from,
        to,
        "rightArmRotation",
        progress
      );
    }

    // 손목 회전 보간
    const leftHand = vrm.humanoid.getNormalizedBoneNode("leftHand");
    const rightHand = vrm.humanoid.getNormalizedBoneNode("rightHand");

    if (leftHand) {
      this.interpolateBoneRotation(
        leftHand,
        from,
        to,
        "leftHandRotation",
        progress
      );
    }
    if (rightHand) {
      this.interpolateBoneRotation(
        rightHand,
        from,
        to,
        "rightHandRotation",
        progress
      );
    }
  }

  /**
   * 몸통/자세 보간
   */
  private interpolateBodyPosture(
    vrm: VRM,
    from: any,
    to: any,
    progress: number
  ) {
    if (!vrm.humanoid) return;

    const spine = vrm.humanoid.getNormalizedBoneNode("spine");
    if (spine) {
      this.interpolateBoneRotation(spine, from, to, "spineRotation", progress);
    }

    // 어깨 위치 보간
    const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
    const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

    if (leftShoulder && to.leftShoulderHeight !== undefined) {
      const fromHeight = from.leftShoulderHeight || 0;
      const toHeight = to.leftShoulderHeight;
      const interpolatedHeight =
        fromHeight + (toHeight - fromHeight) * progress;
      leftShoulder.position.y = interpolatedHeight;
    }

    if (rightShoulder && to.rightShoulderHeight !== undefined) {
      const fromHeight = from.rightShoulderHeight || 0;
      const toHeight = to.rightShoulderHeight;
      const interpolatedHeight =
        fromHeight + (toHeight - fromHeight) * progress;
      rightShoulder.position.y = interpolatedHeight;
    }
  }

  /**
   * 본 회전 보간 헬퍼
   */
  private interpolateBoneRotation(
    bone: any,
    from: any,
    to: any,
    prefix: string,
    progress: number
  ) {
    ["X", "Y", "Z"].forEach((axis) => {
      const fromKey = `${prefix}${axis}`;
      const toKey = `${prefix}${axis}`;

      if (to[toKey] !== undefined) {
        const fromRot = from[fromKey] || 0;
        const toRot = to[toKey];
        const interpolatedRot = fromRot + (toRot - fromRot) * progress;
        const axisLower = axis.toLowerCase() as "x" | "y" | "z";
        bone.rotation[axisLower] = (interpolatedRot * Math.PI) / 180;
      }
    });
  }
}

// 글로벌 애니메이션 매니저 인스턴스
export const vrmAnimationManager = new VRMAnimationManager();

/**
 * 타이밍이 포함된 애니메이션 적용
 */
export function applyVRMAnimationWithTiming(
  vrm: VRM,
  animationState: VRMAnimationState,
  onComplete?: () => void
): string {
  return vrmAnimationManager.startAnimation(vrm, animationState, onComplete);
}

/**
 * 매 프레임 업데이트 (VRMModel에서 호출)
 */
export function updateVRMAnimations() {
  vrmAnimationManager.update();
}
