// VRM 애니메이션 옵션 체계 정의
// AI가 모든 값을 직접 선택하여 세밀한 제어 가능

/**
 * VRM 표정 시스템
 * 모든 값은 0.0 ~ 1.0 사이의 float 값
 */
export interface VRMExpressions {
  // === 기본 감정 표정 ===
  happy?: number; // 기쁨/행복 (0.0 ~ 1.0)
  angry?: number; // 화남/분노 (0.0 ~ 1.0)
  sad?: number; // 슬픔/우울 (0.0 ~ 1.0)
  surprised?: number; // 놀람/경악 (0.0 ~ 1.0)
  relaxed?: number; // 편안함/평온 (0.0 ~ 1.0)
  neutral?: number; // 중립/무표정 (0.0 ~ 1.0)

  // === 세부 감정 표정 ===
  joy?: number; // 기쁨 (happy보다 강함) (0.0 ~ 1.0)
  sorrow?: number; // 슬픔 (sad보다 깊음) (0.0 ~ 1.0)
  fun?: number; // 즐거움/재미 (0.0 ~ 1.0)
  extra?: number; // 추가/커스텀 표정 (0.0 ~ 1.0)

  // === 눈 관련 ===
  blink?: number; // 양쪽 눈 깜빡임 (0.0 ~ 1.0)
  blinkLeft?: number; // 왼쪽 눈 깜빡임 (0.0 ~ 1.0)
  blinkRight?: number; // 오른쪽 눈 깜빡임 (0.0 ~ 1.0)
  lookUp?: number; // 눈동자 위로 (0.0 ~ 1.0)
  lookDown?: number; // 눈동자 아래로 (0.0 ~ 1.0)
  lookLeft?: number; // 눈동자 왼쪽으로 (0.0 ~ 1.0)
  lookRight?: number; // 눈동자 오른쪽으로 (0.0 ~ 1.0)

  // === 입 모양 (립싱크/발음용) ===
  aa?: number; // "아" 소리 (0.0 ~ 1.0)
  ih?: number; // "이" 소리 (0.0 ~ 1.0)
  ou?: number; // "우" 소리 (0.0 ~ 1.0)
  ee?: number; // "에" 소리 (0.0 ~ 1.0)
  oh?: number; // "오" 소리 (0.0 ~ 1.0)
}

/**
 * VRM 시선 제어
 */
export interface VRMLookAt {
  // === 시선 타겟 위치 (월드 좌표) ===
  targetX?: number; // X 좌표 (기본: 0.0)
  targetY?: number; // Y 좌표 (기본: 1.0, 사용자 눈높이)
  targetZ?: number; // Z 좌표 (기본: -1.0, 사용자 위치)

  // === 시선 제어 설정 ===
  intensity?: number; // 시선 추적 강도 (0.0: 무시, 1.0: 완전 추적)
  yaw?: number; // 좌우 회전 각도 (-45 ~ 45도)
  pitch?: number; // 상하 회전 각도 (-30 ~ 30도)

  // === 부드러운 움직임 ===
  smoothFactor?: number; // 애니메이션 부드러움 (1.0 ~ 20.0, 기본: 10.0)
  autoUpdate?: boolean; // 자동 업데이트 여부 (기본: true)
}

/**
 * VRM 머리/목 제스처
 */
export interface VRMHeadGestures {
  // === 고개 끄덕임 ===
  nodIntensity?: number; // 끄덕임 강도 (0.0 ~ 1.0)
  nodSpeed?: number; // 끄덕임 속도 (0.5 ~ 3.0, 기본: 1.0)
  nodRepeat?: number; // 반복 횟수 (1 ~ 5, 기본: 1)

  // === 고개 젓기 ===
  shakeIntensity?: number; // 젓기 강도 (0.0 ~ 1.0)
  shakeSpeed?: number; // 젓기 속도 (0.5 ~ 3.0, 기본: 1.0)
  shakeRepeat?: number; // 반복 횟수 (1 ~ 5, 기본: 1)

  // === 갸우뚱 ===
  tiltDirection?: number; // 기울기 방향 (-1.0: 왼쪽, 1.0: 오른쪽)
  tiltIntensity?: number; // 기울기 강도 (0.0 ~ 1.0)

  // === 직접 회전 제어 ===
  rotationX?: number; // 머리 X축 회전 (-30 ~ 30도)
  rotationY?: number; // 머리 Y축 회전 (-45 ~ 45도)
  rotationZ?: number; // 머리 Z축 회전 (-30 ~ 30도)
}

/**
 * VRM 손/팔 제스처
 */
export interface VRMHandGestures {
  // === 손 흔들기 ===
  waveHand?: "none" | "left" | "right" | "both";
  waveIntensity?: number; // 흔들기 강도 (0.0 ~ 1.0)
  waveSpeed?: number; // 흔들기 속도 (0.5 ~ 3.0, 기본: 1.0)

  // === 가리키기 ===
  pointHand?: "none" | "left" | "right";
  pointDirection?: "forward" | "up" | "down" | "left" | "right";
  pointIntensity?: number; // 가리키기 강도 (0.0 ~ 1.0)

  // === 엄지척 ===
  thumbsUpHand?: "none" | "left" | "right" | "both";
  thumbsUpIntensity?: number; // 엄지척 강도 (0.0 ~ 1.0)

  // === 박수 ===
  clapIntensity?: number; // 박수 강도 (0.0 ~ 1.0)
  clapSpeed?: number; // 박수 속도 (0.5 ~ 3.0, 기본: 1.0)
  clapRepeat?: number; // 박수 반복 횟수 (1 ~ 10, 기본: 3)

  // === 팔 동작 ===
  crossArms?: number; // 팔짱 끼기 (0.0 ~ 1.0)
  armSpread?: number; // 팔 벌리기 (0.0 ~ 1.0)
  armRaise?: "none" | "left" | "right" | "both"; // 팔 올리기

  // === 직접 팔 위치 제어 ===
  leftArmRotationX?: number; // 왼팔 X축 회전 (-180 ~ 180도)
  leftArmRotationY?: number; // 왼팔 Y축 회전 (-180 ~ 180도)
  leftArmRotationZ?: number; // 왼팔 Z축 회전 (-180 ~ 180도)
  rightArmRotationX?: number; // 오른팔 X축 회전 (-180 ~ 180도)
  rightArmRotationY?: number; // 오른팔 Y축 회전 (-180 ~ 180도)
  rightArmRotationZ?: number; // 오른팔 Z축 회전 (-180 ~ 180도)

  // === 손목/손가락 ===
  leftHandRotationX?: number; // 왼손목 X축 회전 (-90 ~ 90도)
  leftHandRotationY?: number; // 왼손목 Y축 회전 (-90 ~ 90도)
  leftHandRotationZ?: number; // 왼손목 Z축 회전 (-90 ~ 90도)
  rightHandRotationX?: number; // 오른손목 X축 회전 (-90 ~ 90도)
  rightHandRotationY?: number; // 오른손목 Y축 회전 (-90 ~ 90도)
  rightHandRotationZ?: number; // 오른손목 Z축 회전 (-90 ~ 90도)
}

/**
 * VRM 몸통/자세 제어
 */
export interface VRMBodyPosture {
  // === 척추/등 ===
  spineRotationX?: number; // 척추 X축 회전 (-30 ~ 30도, 앞뒤 구부리기)
  spineRotationY?: number; // 척추 Y축 회전 (-45 ~ 45도, 좌우 회전)
  spineRotationZ?: number; // 척추 Z축 회전 (-30 ~ 30도, 좌우 기울기)

  // === 어깨 ===
  shoulderTension?: number; // 어깨 긴장도 (0.0 ~ 1.0)
  shoulderShrug?: number; // 어깨 으쓱 (0.0 ~ 1.0)
  leftShoulderHeight?: number; // 왼쪽 어깨 높이 (-0.5 ~ 0.5)
  rightShoulderHeight?: number; // 오른쪽 어깨 높이 (-0.5 ~ 0.5)

  // === 전체 자세 ===
  confidence?: number; // 자신감 있는 자세 (0.0 ~ 1.0)
  openness?: number; // 개방적인 자세 (0.0 ~ 1.0)
  energy?: number; // 에너지 있는 자세 (0.0 ~ 1.0)

  // === 무게 중심 이동 ===
  weightShiftX?: number; // 좌우 체중 이동 (-1.0 ~ 1.0)
  weightShiftZ?: number; // 앞뒤 체중 이동 (-1.0 ~ 1.0)

  // === 호흡 ===
  breathingIntensity?: number; // 호흡 강도 (0.0 ~ 1.0)
  breathingSpeed?: number; // 호흡 속도 (0.5 ~ 2.0, 기본: 1.0)
}

/**
 * VRM 아이들 모션 (기본 대기 동작)
 */
export interface VRMIdleMotion {
  // === 자동 눈 깜빡임 ===
  autoBlinkEnabled?: boolean; // 자동 깜빡임 활성화
  blinkFrequency?: number; // 깜빡임 빈도 (0.1 ~ 5.0 초당)
  blinkIrregularity?: number; // 불규칙성 (0.0 ~ 1.0)
  blinkDuration?: number; // 깜빡임 지속시간 (0.1 ~ 0.5초)

  // === 미세 머리 움직임 ===
  headIdleEnabled?: boolean; // 머리 아이들 모션 활성화
  headIdleIntensity?: number; // 머리 움직임 강도 (0.0 ~ 1.0)
  headIdleSpeed?: number; // 머리 움직임 속도 (0.1 ~ 2.0)

  // === 미세 몸 움직임 ===
  bodySwayEnabled?: boolean; // 몸 흔들림 활성화
  bodySwayIntensity?: number; // 몸 흔들림 강도 (0.0 ~ 1.0)
  bodySwaySpeed?: number; // 몸 흔들림 속도 (0.1 ~ 1.0)

  // === 자동 호흡 ===
  autoBreathingEnabled?: boolean; // 자동 호흡 활성화
  breathingDepth?: number; // 호흡 깊이 (0.0 ~ 1.0)
  breathingRate?: number; // 호흡 속도 (0.5 ~ 2.0)
}

/**
 * VRM 애니메이션 타이밍 제어
 */
export interface VRMAnimationTiming {
  duration?: number; // 애니메이션 지속 시간 (초, 0.1 ~ 10.0)
  delay?: number; // 시작 지연 시간 (초, 0.0 ~ 5.0)

  // === 이징 함수 ===
  easing?:
    | "linear"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "bounce"
    | "elastic";

  // === 반복 설정 ===
  loop?: boolean; // 무한 반복 여부
  repeat?: number; // 반복 횟수 (1 ~ 10)
  yoyo?: boolean; // 왕복 애니메이션 여부

  // === 자동 복원 ===
  autoRevert?: boolean; // 자동으로 원래 상태로 복원
  revertDelay?: number; // 복원 지연 시간 (초, 0.0 ~ 5.0)
  revertDuration?: number; // 복원 애니메이션 시간 (초, 0.1 ~ 3.0)
}

/**
 * 통합 VRM 애니메이션 상태
 * AI가 이 인터페이스의 값들을 직접 선택하여 전달
 */
export interface VRMAnimationState {
  expressions?: VRMExpressions;
  lookAt?: VRMLookAt;
  headGestures?: VRMHeadGestures;
  handGestures?: VRMHandGestures;
  bodyPosture?: VRMBodyPosture;
  idleMotion?: VRMIdleMotion;
  timing?: VRMAnimationTiming;
}

/**
 * AI 응답과 함께 전달되는 애니메이션 데이터
 */
export interface AIResponseWithAnimation {
  textResponse: string;
  animation: VRMAnimationState;
  priority?: "low" | "medium" | "high"; // 애니메이션 우선순위
}
