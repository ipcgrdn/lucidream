import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";

export type AnimationPresetType =
  | "idle"
  | "happy"
  | "sad"
  | "surprised"
  | "thinking"
  | "greeting"
  | "nodding"
  | "talking";

export interface AnimationClipConfig {
  name: AnimationPresetType;
  duration: number;
  loop: boolean;
  description: string;
}

// 애니메이션 프리셋 설정
export const ANIMATION_CONFIGS: Record<
  AnimationPresetType,
  AnimationClipConfig
> = {
  idle: {
    name: "idle",
    duration: 4.0, // 주기적 반복
    loop: true,
    description: "기본 대기 상태 - 자연스러운 호흡과 미세한 움직임",
  },
  happy: {
    name: "happy",
    duration: 2.5,
    loop: false,
    description: "기쁘고 즐거운 표정과 동작",
  },
  sad: {
    name: "sad",
    duration: 3.0,
    loop: false,
    description: "슬프고 우울한 표정과 동작",
  },
  surprised: {
    name: "surprised",
    duration: 1.5,
    loop: false,
    description: "놀라고 당황하는 표정과 동작",
  },
  thinking: {
    name: "thinking",
    duration: 4.0,
    loop: false,
    description: "깊이 생각하는 표정과 동작",
  },
  greeting: {
    name: "greeting",
    duration: 2.0,
    loop: false,
    description: "반갑게 인사하는 동작",
  },
  nodding: {
    name: "nodding",
    duration: 1.2,
    loop: false,
    description: "동의하며 고개 끄덕이기",
  },
  talking: {
    name: "talking",
    duration: 3.0,
    loop: true,
    description: "대화 중 자연스러운 동작",
  },
};

// VRM용 애니메이션 클립 생성 클래스
export class VRMAnimationClipFactory {
  static createClip(
    vrm: VRM,
    presetType: AnimationPresetType
  ): THREE.AnimationClip {
    const config = ANIMATION_CONFIGS[presetType];
    const tracks: THREE.KeyframeTrack[] = [];

    switch (presetType) {
      case "idle":
        tracks.push(...this.createIdleAnimation(vrm, config.duration));
        break;
      case "happy":
        tracks.push(...this.createHappyAnimation(vrm, config.duration));
        break;
      case "sad":
        tracks.push(...this.createSadAnimation(vrm, config.duration));
        break;
      case "surprised":
        tracks.push(...this.createSurprisedAnimation(vrm, config.duration));
        break;
      case "thinking":
        tracks.push(...this.createThinkingAnimation(vrm, config.duration));
        break;
      case "greeting":
        tracks.push(...this.createGreetingAnimation(vrm, config.duration));
        break;
      case "nodding":
        tracks.push(...this.createNoddingAnimation(vrm, config.duration));
        break;
      case "talking":
        tracks.push(...this.createTalkingAnimation(vrm, config.duration));
        break;
    }

    return new THREE.AnimationClip(config.name, config.duration, tracks);
  }

  private static createIdleAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 표정 애니메이션: 미세한 행복 + 자연스러운 눈 깜빡임
    if (vrm.expressionManager) {
      const happyTrackName =
        vrm.expressionManager.getExpressionTrackName("happy");
      const blinkTrackName =
        vrm.expressionManager.getExpressionTrackName("blink");

      if (happyTrackName && blinkTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            happyTrackName,
            [0, duration * 0.5, duration],
            [0.1, 0.15, 0.1]
          ),
          new THREE.NumberKeyframeTrack(
            blinkTrackName,
            [
              0,
              duration * 0.2,
              duration * 0.25,
              duration * 0.7,
              duration * 0.75,
              duration,
            ],
            [0, 0, 1, 0, 1, 0]
          )
        );
      } else {
        console.warn("[createIdleAnimation] 표정 트랙명을 가져올 수 없음");
      }
    } else {
      console.warn("[createIdleAnimation] ExpressionManager를 찾을 수 없음");
    }

    // 미세한 머리 움직임
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headQuat1 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0.05, 0.02)
        );
        const headQuat2 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.02, -0.03, -0.01)
        );
        const headQuat3 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.01, 0.04, 0)
        );
        const headQuatRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.25, duration * 0.5, duration * 0.75, duration],
            [
              ...headQuatRest.toArray(),
              ...headQuat1.toArray(),
              ...headQuat2.toArray(),
              ...headQuat3.toArray(),
              ...headQuatRest.toArray(),
            ]
          )
        );
      }

      // 팔을 자연스럽게 내리기 - T포즈 해결
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");

      if (leftUpperArm && rightUpperArm) {
        // 팔을 아래로 내리는 자연스러운 자세 (더 많이 내리기)
        const leftArmDown = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, 1.25)
        ); // +30도 (왼팔 아래로)
        const rightArmDown = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, -1.25)
        ); // -30도 (오른팔 아래로)

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftUpperArm.name + ".quaternion",
            [0, duration],
            [...leftArmDown.toArray(), ...leftArmDown.toArray()]
          ),
          new THREE.QuaternionKeyframeTrack(
            rightUpperArm.name + ".quaternion",
            [0, duration],
            [...rightArmDown.toArray(), ...rightArmDown.toArray()]
          )
        );
      }

      // 미세한 어깨 움직임 (호흡)
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

      if (leftShoulder && rightShoulder) {
        const shoulderUp = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, 0.02)
        );
        const shoulderDown = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, -0.01)
        );
        const shoulderRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftShoulder.name + ".quaternion",
            [0, duration * 0.5, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderUp.toArray(),
              ...shoulderRest.toArray(),
            ]
          ),
          new THREE.QuaternionKeyframeTrack(
            rightShoulder.name + ".quaternion",
            [0, duration * 0.5, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderDown.toArray(),
              ...shoulderRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createHappyAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 행복한 표정
    if (vrm.expressionManager) {
      const happyTrackName =
        vrm.expressionManager.getExpressionTrackName("happy");
      const blinkTrackName =
        vrm.expressionManager.getExpressionTrackName("blink");

      if (happyTrackName && blinkTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            happyTrackName,
            [0, duration * 0.2, duration * 0.8, duration],
            [0.1, 0.9, 0.9, 0.1]
          ),
          new THREE.NumberKeyframeTrack(
            blinkTrackName,
            [0, duration * 0.3, duration * 0.35, duration],
            [0, 0, 1, 0]
          )
        );
      }
    }

    // 기쁜 몸짓
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        // 고개를 살짝 뒤로 젖히며 기쁨 표현
        const headHappy = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.15, 0, 0)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...headRest.toArray(),
              ...headHappy.toArray(),
              ...headHappy.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }

      // 팔을 완전히 만세 자세로 올리기!
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");

      if (leftUpperArm && rightUpperArm) {
        // 만세 자세! 팔을 하늘 위로 올리기
        const leftArmManse = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, -1.5)
        ); // -90도 (왼팔 완전히 올리기)
        const rightArmManse = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, 1.5)
        ); // +90도 (오른팔 완전히 올리기)
        const leftArmRest = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, 1.25)
        ); // 차렷 자세로 복귀
        const rightArmRest = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0, 0, -1.25)
        );

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftUpperArm.name + ".quaternion",
            [0, duration * 0.2, duration * 0.8, duration],
            [
              ...leftArmRest.toArray(),
              ...leftArmManse.toArray(),
              ...leftArmManse.toArray(),
              ...leftArmRest.toArray(),
            ]
          ),
          new THREE.QuaternionKeyframeTrack(
            rightUpperArm.name + ".quaternion",
            [0, duration * 0.2, duration * 0.8, duration],
            [
              ...rightArmRest.toArray(),
              ...rightArmManse.toArray(),
              ...rightArmManse.toArray(),
              ...rightArmRest.toArray(),
            ]
          )
        );
      }

      // 어깨를 살짝 올리는 기쁜 자세
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

      if (leftShoulder && rightShoulder) {
        const shoulderHappy = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.1, 0, 0)
        ); // 어깨 올리기
        const shoulderRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftShoulder.name + ".quaternion",
            [0, duration * 0.2, duration * 0.8, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderHappy.toArray(),
              ...shoulderHappy.toArray(),
              ...shoulderRest.toArray(),
            ]
          ),
          new THREE.QuaternionKeyframeTrack(
            rightShoulder.name + ".quaternion",
            [0, duration * 0.2, duration * 0.8, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderHappy.toArray(),
              ...shoulderHappy.toArray(),
              ...shoulderRest.toArray(),
            ]
          )
        );
      }

      // 척추를 살짝 펴서 당당한 자세
      const spine = vrm.humanoid.getNormalizedBoneNode("spine");
      if (spine) {
        const spineHappy = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.05, 0, 0)
        ); // 가슴 펴기
        const spineRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            spine.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...spineRest.toArray(),
              ...spineHappy.toArray(),
              ...spineHappy.toArray(),
              ...spineRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createSadAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];
    // 슬픈 표정
    if (vrm.expressionManager) {
      const sadTrackName = vrm.expressionManager.getExpressionTrackName("sad");

      if (sadTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            sadTrackName,
            [0, duration * 0.3, duration * 0.7, duration],
            [0, 0.8, 0.8, 0]
          )
        );
      }
    }

    // 고개 숙이기
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headSad = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.15, 0, 0)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.4, duration * 0.6, duration],
            [
              ...headRest.toArray(),
              ...headSad.toArray(),
              ...headSad.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }

      // 어깨 처지기
      const leftShoulder = vrm.humanoid.getNormalizedBoneNode("leftShoulder");
      const rightShoulder = vrm.humanoid.getNormalizedBoneNode("rightShoulder");

      if (leftShoulder && rightShoulder) {
        const shoulderSad = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.1, 0, 0.1)
        );
        const shoulderRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftShoulder.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderSad.toArray(),
              ...shoulderSad.toArray(),
              ...shoulderRest.toArray(),
            ]
          ),
          new THREE.QuaternionKeyframeTrack(
            rightShoulder.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...shoulderRest.toArray(),
              ...shoulderSad.toArray(),
              ...shoulderSad.toArray(),
              ...shoulderRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createSurprisedAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 놀란 표정
    if (vrm.expressionManager) {
      const surprisedTrackName =
        vrm.expressionManager.getExpressionTrackName("surprised");

      if (surprisedTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            surprisedTrackName,
            [0, duration * 0.1, duration * 0.7, duration],
            [0, 1.0, 0.8, 0]
          )
        );
      }
    }

    // 고개 살짝 뒤로
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headSurprised = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.08, 0, 0)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.1, duration * 0.6, duration],
            [
              ...headRest.toArray(),
              ...headSurprised.toArray(),
              ...headSurprised.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createThinkingAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 생각하는 표정
    if (vrm.expressionManager) {
      const neutralTrackName =
        vrm.expressionManager.getExpressionTrackName("neutral");

      if (neutralTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            neutralTrackName,
            [0, duration * 0.2, duration * 0.8, duration],
            [0, 0.7, 0.7, 0]
          )
        );
      }
    }

    // 고개 살짝 기울이기
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headThink1 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.05, 0.1, 0)
        );
        const headThink2 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.08, 0.15, 0.02)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...headRest.toArray(),
              ...headThink1.toArray(),
              ...headThink2.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }

      // 한 손을 턱에 가져가는 듯한 동작 (미묘하게)
      const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
      if (leftUpperArm) {
        const armThinking = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.3, 0.1, 0.4)
        );
        const armRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            leftUpperArm.name + ".quaternion",
            [0, duration * 0.4, duration * 0.6, duration],
            [
              ...armRest.toArray(),
              ...armThinking.toArray(),
              ...armThinking.toArray(),
              ...armRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createGreetingAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 인사 표정
    if (vrm.expressionManager) {
      const happyTrackName =
        vrm.expressionManager.getExpressionTrackName("happy");

      if (happyTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            happyTrackName,
            [0, duration * 0.2, duration * 0.8, duration],
            [0.1, 0.7, 0.7, 0.1]
          )
        );
      }
    }

    // 인사하는 고개 숙이기
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headBow = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.3, 0, 0)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.3, duration * 0.7, duration],
            [
              ...headRest.toArray(),
              ...headBow.toArray(),
              ...headBow.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }

      // 오른손 살짝 들어 인사
      const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
      if (rightUpperArm) {
        const armWave = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(-0.3, -0.2, -0.5)
        );
        const armRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            rightUpperArm.name + ".quaternion",
            [0, duration * 0.2, duration * 0.8, duration],
            [
              ...armRest.toArray(),
              ...armWave.toArray(),
              ...armWave.toArray(),
              ...armRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createNoddingAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 끄덕임 표정
    if (vrm.expressionManager) {
      const happyTrackName =
        vrm.expressionManager.getExpressionTrackName("happy");

      if (happyTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            happyTrackName,
            [0, duration * 0.5, duration],
            [0.1, 0.5, 0.1]
          )
        );
      }
    }

    // 고개 끄덕이기
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headNod = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.25, 0, 0)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.3, duration * 0.6, duration],
            [
              ...headRest.toArray(),
              ...headNod.toArray(),
              ...headRest.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }

  private static createTalkingAnimation(
    vrm: VRM,
    duration: number
  ): THREE.KeyframeTrack[] {
    const tracks: THREE.KeyframeTrack[] = [];

    // 대화 표정
    if (vrm.expressionManager) {
      const neutralTrackName =
        vrm.expressionManager.getExpressionTrackName("neutral");
      const aaTrackName = vrm.expressionManager.getExpressionTrackName("aa");

      if (neutralTrackName && aaTrackName) {
        tracks.push(
          new THREE.NumberKeyframeTrack(
            neutralTrackName,
            [0, duration * 0.3, duration * 0.7, duration],
            [0.2, 0.6, 0.4, 0.2]
          ),
          // 말하는 중 입 움직임
          new THREE.NumberKeyframeTrack(
            aaTrackName,
            [
              0,
              duration * 0.1,
              duration * 0.2,
              duration * 0.4,
              duration * 0.5,
              duration * 0.7,
              duration * 0.8,
              duration,
            ],
            [0, 0.3, 0, 0.4, 0, 0.2, 0, 0]
          )
        );
      }
    }

    // 대화 중 자연스러운 머리 움직임
    if (vrm.humanoid) {
      const head = vrm.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const headTalk1 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.02, 0.05, 0)
        );
        const headTalk2 = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.01, -0.03, 0.01)
        );
        const headRest = new THREE.Quaternion();

        tracks.push(
          new THREE.QuaternionKeyframeTrack(
            head.name + ".quaternion",
            [0, duration * 0.3, duration * 0.6, duration],
            [
              ...headRest.toArray(),
              ...headTalk1.toArray(),
              ...headTalk2.toArray(),
              ...headRest.toArray(),
            ]
          )
        );
      }
    }

    return tracks;
  }
}

// VRM 애니메이션 매니저 클래스
export class VRMAnimationManager {
  private vrm: VRM;
  private mixer: THREE.AnimationMixer;
  private currentAction: THREE.AnimationAction | null = null;
  private currentPreset: AnimationPresetType = "idle";

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
  }

  playAnimation(
    presetType: AnimationPresetType,
    fadeDuration: number = 0.5
  ): void {
    const clip = VRMAnimationClipFactory.createClip(this.vrm, presetType);
    const config = ANIMATION_CONFIGS[presetType];

    const newAction = this.mixer.clipAction(clip);
    newAction.setLoop(
      config.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      config.loop ? Infinity : 1
    );

    if (this.currentAction && this.currentAction !== newAction) {
      this.currentAction.fadeOut(fadeDuration);
    }

    newAction.reset().fadeIn(fadeDuration).play();
    this.currentAction = newAction;
    this.currentPreset = presetType;
  }

  update(deltaTime: number): void {
    this.mixer.update(deltaTime);
  }

  getCurrentPreset(): AnimationPresetType {
    return this.currentPreset;
  }

  stopCurrentAnimation(fadeDuration: number = 0.5): void {
    if (this.currentAction) {
      this.currentAction.fadeOut(fadeDuration);
    }
  }

  returnToIdle(fadeDuration: number = 1.0): void {
    this.playAnimation("idle", fadeDuration);
  }

  dispose(): void {
    this.mixer.uncacheRoot(this.vrm.scene);
  }
}

// 유틸리티 함수들
export function getAllAnimationPresets(): AnimationPresetType[] {
  return Object.keys(ANIMATION_CONFIGS) as AnimationPresetType[];
}

export function getAnimationConfig(
  presetType: AnimationPresetType
): AnimationClipConfig {
  return ANIMATION_CONFIGS[presetType];
}
