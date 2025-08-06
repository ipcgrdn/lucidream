export type AnimationPresetType =
  | "idle"
  | "happy"
  | "sad"
  | "surprised"
  | "thinking"
  | "greeting";

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