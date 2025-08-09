import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import {
  VRMAnimationLoaderPlugin,
  createVRMAnimationClip,
  VRMAnimation,
} from "@pixiv/three-vrm-animation";
import { AnimationPresetType } from "./vrm-animations";

// VRMA 파일 경로 매핑
const VRMA_FILE_PATHS: Record<AnimationPresetType, string> = {
  idle: "/animation/idle.vrma",
  happy: "/animation/happy.vrma",
  sad: "/animation/sad.vrma",
  surprised: "/animation/surprised.vrma",
  thinking: "/animation/thinking.vrma",
  greeting: "/animation/greeting.vrma",
  blow_kiss: "/animation/blow_kiss.vrma",
  cheer: "/animation/cheer.vrma",
  clap: "/animation/clap.vrma",
  crazy: "/animation/crazy.vrma",
  dance: "/animation/dance.vrma",
  dance_hard: "/animation/dance_hard.vrma",
  disappointed: "/animation/disappointed.vrma",
  dismiss: "/animation/dismiss.vrma",
  fighting: "/animation/fighting.vrma",
  flying: "/animation/flying.vrma",
  jogging: "/animation/jogging.vrma",
  jump: "/animation/jump.vrma",
  jump_around: "/animation/jump_around.vrma",
  kick: "/animation/kick.vrma",
  kiss: "/animation/kiss.vrma",
  lookling: "/animation/lookling.vrma",
  milking: "/animation/milking.vrma",
  no: "/animation/no.vrma",
  piano: "/animation/piano.vrma",
  pose: "/animation/pose.vrma",
  pose2: "/animation/pose2.vrma",
  reject: "/animation/reject.vrma",
  talking: "/animation/talking.vrma",
  threatening: "/animation/threatening.vrma",
  tired: "/animation/tired.vrma",
  tired_walk: "/animation/tired_walk.vrma",
};

// 현재 사용 가능한 VRMA 파일들 (실제로 존재하는 파일들)
const AVAILABLE_VRMA_FILES = new Set<AnimationPresetType>([
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
]);

// Fallback 매핑: 파일이 없는 경우 사용할 대체 애니메이션
const VRMA_FALLBACK_MAP: Record<AnimationPresetType, AnimationPresetType> = {
  idle: "idle",
  happy: "happy",
  sad: "sad",
  surprised: "surprised",
  thinking: "thinking",
  greeting: "greeting",
  blow_kiss: "blow_kiss",
  cheer: "cheer",
  clap: "clap",
  crazy: "crazy",
  dance: "dance",
  dance_hard: "dance_hard",
  disappointed: "disappointed",
  dismiss: "dismiss",
  fighting: "fighting",
  flying: "flying",
  jogging: "jogging",
  jump: "jump",
  jump_around: "jump_around",
  kick: "kick",
  kiss: "kiss",
  lookling: "lookling",
  milking: "milking",
  no: "no",
  piano: "piano",
  pose: "pose",
  pose2: "pose2",
  reject: "reject",
  talking: "talking",
  threatening: "threatening",
  tired: "tired",
  tired_walk: "tired_walk",
};

// 로드된 VRMA 데이터 캐시
interface VRMACache {
  [key: string]: VRMAnimation;
}

class VRMALoader {
  private loader: GLTFLoader;
  private cache: VRMACache = {};
  private loadingPromises: Map<string, Promise<VRMAnimation>> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
    this.loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
  }

  /**
   * VRMA 파일을 로드합니다 (캐시 지원)
   */
  async loadVRMA(preset: AnimationPresetType): Promise<VRMAnimation | null> {
    // 실제 사용할 프리셋 결정 (fallback 처리)
    const actualPreset = this.resolveActualPreset(preset);
    const filePath = VRMA_FILE_PATHS[actualPreset];

    // 캐시에서 확인
    if (this.cache[filePath]) {
      return this.cache[filePath];
    }

    // 이미 로딩 중인 경우
    if (this.loadingPromises.has(filePath)) {
      return this.loadingPromises.get(filePath)!;
    }

    // 새로운 로딩 프로미스 생성
    const loadingPromise = this.performLoad(filePath);
    this.loadingPromises.set(filePath, loadingPromise);

    try {
      const vrmAnimation = await loadingPromise;
      this.cache[filePath] = vrmAnimation;
      this.loadingPromises.delete(filePath);

      return vrmAnimation;
    } catch (error) {
      this.loadingPromises.delete(filePath);
      console.error(`VRMA 로드 실패 (${preset} → ${actualPreset}):`, error);
      return null;
    }
  }

  /**
   * 실제 사용할 프리셋을 결정합니다 (fallback 처리)
   */
  private resolveActualPreset(
    preset: AnimationPresetType
  ): AnimationPresetType {
    // 해당 VRMA 파일이 사용 가능한 경우 그대로 사용
    if (AVAILABLE_VRMA_FILES.has(preset)) {
      return preset;
    }

    // 그렇지 않으면 fallback 사용
    return VRMA_FALLBACK_MAP[preset] || "idle";
  }

  /**
   * 실제 VRMA 파일 로딩을 수행합니다
   */
  private async performLoad(filePath: string): Promise<VRMAnimation> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        filePath,
        (gltf) => {
          const vrmAnimations = gltf.userData.vrmAnimations;
          if (vrmAnimations && vrmAnimations.length > 0) {
            resolve(vrmAnimations[0]);
          } else {
            reject(new Error(`VRMA 데이터를 찾을 수 없습니다: ${filePath}`));
          }
        },
        undefined, // onProgress
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * VRM 모델에 맞는 애니메이션 클립을 생성합니다
   */
  createAnimationClip(
    vrmAnimation: VRMAnimation,
    vrm: VRM,
    preset: AnimationPresetType
  ): THREE.AnimationClip {
    const clip = createVRMAnimationClip(vrmAnimation, vrm);
    clip.name = preset; // 클립 이름을 프리셋으로 설정
    return clip;
  }

  /**
   * 모든 캐시된 VRMA 데이터를 제거합니다
   */
  clearCache(): void {
    this.cache = {};
    this.loadingPromises.clear();
  }

  /**
   * 특정 프리셋의 캐시를 제거합니다
   */
  clearCacheForPreset(preset: AnimationPresetType): void {
    const filePath = VRMA_FILE_PATHS[preset];
    delete this.cache[filePath];
  }

  /**
   * 사용 가능한 VRMA 파일 목록을 반환합니다
   */
  getAvailablePresets(): AnimationPresetType[] {
    return Array.from(AVAILABLE_VRMA_FILES);
  }

  /**
   * 특정 프리셋이 실제 VRMA 파일을 가지고 있는지 확인합니다
   */
  hasVRMAFile(preset: AnimationPresetType): boolean {
    return AVAILABLE_VRMA_FILES.has(preset);
  }

  /**
   * 특정 프리셋의 fallback 프리셋을 반환합니다
   */
  getFallbackPreset(preset: AnimationPresetType): AnimationPresetType {
    return this.resolveActualPreset(preset);
  }
}

// 싱글톤 인스턴스
export const vrmaLoader = new VRMALoader();

// 유틸리티 함수들
export { VRMALoader, VRMA_FILE_PATHS, AVAILABLE_VRMA_FILES, VRMA_FALLBACK_MAP };
