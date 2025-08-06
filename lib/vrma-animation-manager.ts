import * as THREE from "three";
import { VRM } from "@pixiv/three-vrm";
import { vrmaLoader } from "./vrma-loader";
import { AnimationPresetType, getAnimationConfig } from "./vrm-animations";

/**
 * VRMA 파일 기반 애니메이션 매니저
 * 기존의 하드코딩된 애니메이션을 대체합니다
 */
export class VRMAAnimationManager {
  private vrm: VRM;
  private mixer: THREE.AnimationMixer;
  private currentAction: THREE.AnimationAction | null = null;
  private currentPreset: AnimationPresetType = "idle";
  private loadedClips: Map<AnimationPresetType, THREE.AnimationClip> =
    new Map();

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
  }

  /**
   * 애니메이션을 재생합니다 (VRMA 파일 기반)
   */
  async playAnimation(
    presetType: AnimationPresetType,
    fadeDuration: number = 0.5
  ): Promise<void> {
    try {
      // VRMA 애니메이션 클립 획득 (캐시 또는 로드)
      const clip = await this.getAnimationClip(presetType);
      if (!clip) {
        console.warn(`VRMA 애니메이션을 로드할 수 없습니다: ${presetType}`);
        return;
      }

      // 새 애니메이션 액션 생성
      const config = getAnimationConfig(presetType);
      const newAction = this.mixer.clipAction(clip);

      // 루프 설정
      newAction.setLoop(
        config.loop ? THREE.LoopRepeat : THREE.LoopOnce,
        config.loop ? Infinity : 1
      );

      // 기존 애니메이션 페이드아웃
      if (this.currentAction && this.currentAction !== newAction) {
        this.currentAction.fadeOut(fadeDuration);
      }

      // 새 애니메이션 페이드인 및 재생
      newAction.reset().fadeIn(fadeDuration).play();
      this.currentAction = newAction;
      this.currentPreset = presetType;
    } catch (error) {
      console.error(`VRMA 애니메이션 재생 실패 (${presetType}):`, error);
    }
  }

  /**
   * 애니메이션 클립을 가져옵니다 (캐시 우선, 없으면 로드)
   */
  private async getAnimationClip(
    preset: AnimationPresetType
  ): Promise<THREE.AnimationClip | null> {
    // 캐시에서 확인
    if (this.loadedClips.has(preset)) {
      return this.loadedClips.get(preset)!;
    }

    try {
      // VRMA 데이터 로드
      const vrmAnimation = await vrmaLoader.loadVRMA(preset);
      if (!vrmAnimation) {
        return null;
      }

      // 애니메이션 클립 생성
      const clip = vrmaLoader.createAnimationClip(
        vrmAnimation,
        this.vrm,
        preset
      );

      // 캐시에 저장
      this.loadedClips.set(preset, clip);

      return clip;
    } catch (error) {
      console.error(`애니메이션 클립 생성 실패 (${preset}):`, error);
      return null;
    }
  }

  /**
   * 애니메이션 매니저를 업데이트합니다
   */
  update(deltaTime: number): void {
    this.mixer.update(deltaTime);
  }

  /**
   * 현재 재생중인 애니메이션 프리셋을 반환합니다
   */
  getCurrentPreset(): AnimationPresetType {
    return this.currentPreset;
  }

  /**
   * 현재 애니메이션을 중지합니다
   */
  stopCurrentAnimation(fadeDuration: number = 0.5): void {
    if (this.currentAction) {
      this.currentAction.fadeOut(fadeDuration);
    }
  }

  /**
   * idle 애니메이션으로 돌아갑니다
   */
  async returnToIdle(fadeDuration: number = 1.0): Promise<void> {
    await this.playAnimation("idle", fadeDuration);
  }

  /**
   * 애니메이션 매니저를 정리합니다
   */
  dispose(): void {
    // 모든 액션 중지
    if (this.currentAction) {
      this.currentAction.stop();
    }

    // 믹서 정리
    this.mixer.uncacheRoot(this.vrm.scene);

    // 클립 캐시 정리
    this.loadedClips.clear();
  }

  /**
   * 특정 프리셋의 캐시를 미리 로드합니다 (선택적 최적화)
   */
  async preloadAnimation(preset: AnimationPresetType): Promise<void> {
    try {
      await this.getAnimationClip(preset);
    } catch (error) {
      console.warn(`애니메이션 미리 로드 실패 (${preset}):`, error);
    }
  }

  /**
   * 여러 프리셋을 한번에 미리 로드합니다
   */
  async preloadAnimations(presets: AnimationPresetType[]): Promise<void> {
    const loadPromises = presets.map((preset) => this.preloadAnimation(preset));
    await Promise.allSettled(loadPromises);
  }
}
