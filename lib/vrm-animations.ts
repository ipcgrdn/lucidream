export type AnimationPresetType =
  | "idle"
  | "happy"
  | "sad"
  | "surprised"
  | "thinking"
  | "greeting"
  | "blow_kiss"
  | "cheer"
  | "clap"
  | "crazy"
  | "dance"
  | "dance_hard"
  | "disappointed"
  | "dismiss"
  | "fighting"
  | "flying"
  | "jogging"
  | "jump"
  | "jump_around"
  | "kick"
  | "kiss"
  | "lookling"
  | "milking"
  | "no"
  | "piano"
  | "reject"
  | "talking"
  | "threatening"
  | "tired"
  | "tired_walk";

export interface AnimationClipConfig {
  name: AnimationPresetType;
  duration: number;
  loop: boolean;
  description: string;
}

// 애니메이션 프리셋 설정 (VRMA 파일 기반)
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
  blow_kiss: {
    name: "blow_kiss",
    duration: 2.5,
    loop: false,
    description: "손키스를 보내는 동작",
  },
  cheer: {
    name: "cheer",
    duration: 3.0,
    loop: false,
    description: "환호하는 동작",
  },
  clap: {
    name: "clap",
    duration: 2.0,
    loop: false,
    description: "박수치는 동작",
  },
  crazy: {
    name: "crazy",
    duration: 3.5,
    loop: false,
    description: "미쳤냐고 하는 표정과 동작",
  },
  dance: {
    name: "dance",
    duration: 4.0,
    loop: false,
    description: "춤추는 동작",
  },
  dance_hard: {
    name: "dance_hard",
    duration: 4.5,
    loop: false,
    description: "격렬하게 춤추는 동작",
  },
  disappointed: {
    name: "disappointed",
    duration: 3.0,
    loop: false,
    description: "실망하는 표정과 동작",
  },
  dismiss: {
    name: "dismiss",
    duration: 2.0,
    loop: false,
    description: "무시하거나 거절하는 동작",
  },
  fighting: {
    name: "fighting",
    duration: 2.5,
    loop: false,
    description: "싸우는 동작",
  },
  flying: {
    name: "flying",
    duration: 4.0,
    loop: true,
    description: "날아가는 동작",
  },
  jogging: {
    name: "jogging",
    duration: 3.0,
    loop: true,
    description: "조깅하는 동작",
  },
  jump: {
    name: "jump",
    duration: 1.5,
    loop: false,
    description: "점프하는 동작",
  },
  jump_around: {
    name: "jump_around",
    duration: 3.0,
    loop: false,
    description: "한 바퀴 도는 동작",
  },
  kick: {
    name: "kick",
    duration: 1.8,
    loop: false,
    description: "발차기 동작",
  },
  kiss: {
    name: "kiss",
    duration: 2.5,
    loop: false,
    description: "키스하는 동작",
  },
  lookling: {
    name: "lookling",
    duration: 3.0,
    loop: true,
    description: "주변을 둘러보는 동작",
  },
  milking: {
    name: "milking",
    duration: 3.5,
    loop: false,
    description: "우유 짜는 동작",
  },
  no: {
    name: "no",
    duration: 2.0,
    loop: false,
    description: "거절하는 동작",
  },
  piano: {
    name: "piano",
    duration: 4.0,
    loop: false,
    description: "피아노 치는 동작",
  },
  reject: {
    name: "reject",
    duration: 2.5,
    loop: false,
    description: "거부하는 동작",
  },
  talking: {
    name: "talking",
    duration: 4.0,
    loop: true,
    description: "말하는 동작",
  },
  threatening: {
    name: "threatening",
    duration: 2.8,
    loop: false,
    description: "위협하는 동작",
  },
  tired: {
    name: "tired",
    duration: 3.5,
    loop: false,
    description: "피곤한 표정과 동작",
  },
  tired_walk: {
    name: "tired_walk",
    duration: 4.0,
    loop: true,
    description: "피곤하게 걷는 동작",
  },
};

// 유틸리티 함수들
export function getAllAnimationPresets(): AnimationPresetType[] {
  return Object.keys(ANIMATION_CONFIGS) as AnimationPresetType[];
}

export function getAnimationConfig(
  presetType: AnimationPresetType
): AnimationClipConfig {
  return ANIMATION_CONFIGS[presetType];
}
