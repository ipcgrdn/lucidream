import { AnimationPresetType } from "./vrm-animations";

export interface ParsedResponse {
  text: string;
  animationPreset: AnimationPresetType;
}

// AI 응답에서 애니메이션 프리셋을 추출하는 함수
export function parseAnimationFromResponse(response: string): ParsedResponse {
  // [ANIMATION:preset_name] 패턴 매칭
  const animationRegex = /^\[ANIMATION:(\w+)\]\s*/;
  const match = response.match(animationRegex);

  let animationPreset: AnimationPresetType = "idle"; // 기본값
  let text = response;

  if (match) {
    const extractedPreset = match[1].toLowerCase();

    // 유효한 프리셋인지 확인
    const validPresets: AnimationPresetType[] = [
      "idle",
      "happy",
      "sad",
      "surprised",
      "thinking",
      "greeting",
      "blow_kiss",
      "cheer",
      "clap",
      "crazy",
      "dance",
      "dance_hard",
      "disappointed",
      "dismiss",
      "fighting",
      "flying",
      "jogging",
      "jump",
      "jump_around",
      "kick",
      "kiss",
      "lookling",
      "milking",
      "no",
      "piano",
      "pose",
      "pose2",
      "reject",
      "talking",
      "threatening",
      "tired",
      "tired_walk",
    ];

    if (validPresets.includes(extractedPreset as AnimationPresetType)) {
      animationPreset = extractedPreset as AnimationPresetType;
    } else {
      // 잘못된 프리셋 이름 로깅 및 기본값 사용
      console.warn(
        `[Invalid Animation]: "${extractedPreset}" is not a valid preset. Using "idle" instead.`
      );
      console.warn(`[Valid Presets]: ${validPresets.join(", ")}`);
      animationPreset = "idle";
    }

    // 텍스트에서 애니메이션 태그 제거
    text = response.replace(animationRegex, "").trim();
  }

  return {
    text,
    animationPreset,
  };
}

// 스트리밍 중에 애니메이션 태그를 감지하는 함수
export function detectAnimationInStream(currentContent: string): {
  hasAnimation: boolean;
  animationPreset?: AnimationPresetType;
  cleanedContent: string;
} {
  const animationRegex = /^\[ANIMATION:(\w+)\]\s*/;
  const match = currentContent.match(animationRegex);

  if (match) {
    const extractedPreset = match[1].toLowerCase();

    const validPresets: AnimationPresetType[] = [
      "idle",
      "happy",
      "sad",
      "surprised",
      "thinking",
      "greeting",
      "blow_kiss",
      "cheer",
      "clap",
      "crazy",
      "dance",
      "dance_hard",
      "disappointed",
      "dismiss",
      "fighting",
      "flying",
      "jogging",
      "jump",
      "jump_around",
      "kick",
      "kiss",
      "lookling",
      "milking",
      "no",
      "piano",
      "pose",
      "pose2",
      "reject",
      "talking",
      "threatening",
      "tired",
      "tired_walk",
    ];

    if (validPresets.includes(extractedPreset as AnimationPresetType)) {
      return {
        hasAnimation: true,
        animationPreset: extractedPreset as AnimationPresetType,
        cleanedContent: currentContent.replace(animationRegex, "").trim(),
      };
    } else {
      // 잘못된 프리셋 감지시 로깅하고 무시
      console.warn(
        `[Invalid Animation Stream]: "${extractedPreset}" is not valid. Ignoring animation.`
      );
    }
  }

  return {
    hasAnimation: false,
    cleanedContent: currentContent,
  };
}
