import { VRM } from "@pixiv/three-vrm";

interface LipSyncConfig {
  smoothingFactor: number; // 0-1, 높을수록 부드러움
  sensitivity: number; // 0-2, 민감도
  minThreshold: number; // 최소 임계값
  maxAmplitude: number; // 최대 진폭
}

export class LipSyncManager {
  private vrm: VRM;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing = false;
  private animationFrameId: number | null = null;

  // 현재 mouth shape 값들
  private currentMouthShapes = {
    aa: 0, // 아
    ih: 0, // 이
    ou: 0, // 오/우
    ee: 0, // 에
    oh: 0, // 오
  };

  // 이전 값들 (스무딩용)
  private previousMouthShapes = { ...this.currentMouthShapes };

  private config: LipSyncConfig = {
    smoothingFactor: 0.7,
    sensitivity: 1.2,
    minThreshold: 0.01,
    maxAmplitude: 0.8,
  };

  constructor(vrm: VRM, config?: Partial<LipSyncConfig>) {
    this.vrm = vrm;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 오디오 엘리먼트와 립싱크 시작
   */
  public startLipSync(audioElement: HTMLAudioElement): void {
    this.stopLipSync(); // 기존 분석 중단

    try {
      // 오디오가 준비될 때까지 기다림
      const startLipSyncWhenReady = () => {
        // AudioContext 생성
        this.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)();

        // MediaElementSource 생성
        const source = this.audioContext.createMediaElementSource(audioElement);

        // AnalyserNode 생성
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // 연결: source -> analyser -> destination
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // 분석용 데이터 배열
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        this.isAnalyzing = true;
        this.analyze();
      };

      // 오디오가 준비되지 않았으면 기다림
      if (audioElement.readyState < 2) {
        const handleCanPlay = () => {
          audioElement.removeEventListener("canplay", handleCanPlay);
          startLipSyncWhenReady();
        };

        audioElement.addEventListener("canplay", handleCanPlay);
      } else {
        // 이미 준비되었으면 바로 시작
        startLipSyncWhenReady();
      }
    } catch (error) {
      console.error("립싱크 시작 실패:", error);
    }
  }

  /**
   * 립싱크 중단
   */
  public stopLipSync(): void {
    this.isAnalyzing = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;

    // mouth shapes 초기화
    this.resetMouthShapes();
  }

  /**
   * 실시간 오디오 분석
   */
  private analyze(): void {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) {
      return;
    }

    // frequency 데이터 획득
    this.analyser.getByteFrequencyData(this.dataArray);

    // 주파수 대역별 분석을 통한 mouth shape 계산
    this.calculateMouthShapes();

    // VRM에 적용
    this.applyMouthShapes();

    this.animationFrameId = requestAnimationFrame(() => this.analyze());
  }

  /**
   * 주파수 데이터로부터 mouth shape 계산
   */
  private calculateMouthShapes(): void {
    if (!this.dataArray) return;

    // 주파수 대역별 에너지 계산
    const lowFreq = this.getFrequencyEnergy(0, 4); // ~86Hz (low rumble)
    const midLowFreq = this.getFrequencyEnergy(4, 8); // 86-172Hz (vowel fundamentals)
    const midFreq = this.getFrequencyEnergy(8, 16); // 172-344Hz (vowel formants)
    const midHighFreq = this.getFrequencyEnergy(16, 32); // 344-688Hz (consonants)
    const highFreq = this.getFrequencyEnergy(32, 64); // 688-1376Hz (sibilants)

    // 전체 에너지
    const totalEnergy =
      (lowFreq + midLowFreq + midFreq + midHighFreq + highFreq) / 5;

    // 임계값 이하면 입 닫기
    if (totalEnergy < this.config.minThreshold) {
      this.currentMouthShapes.aa = 0;
      this.currentMouthShapes.ih = 0;
      this.currentMouthShapes.ou = 0;
      this.currentMouthShapes.ee = 0;
      this.currentMouthShapes.oh = 0;
      return;
    }

    // 각 mouth shape 계산 (간단한 휴리스틱)
    const sensitivity = this.config.sensitivity;
    const maxAmp = this.config.maxAmplitude;

    // 'aa' (아) - 낮은-중간 주파수가 강할 때
    this.currentMouthShapes.aa = Math.min(
      (midLowFreq + midFreq) * sensitivity * 0.6,
      maxAmp
    );

    // 'ih' (이) - 중간-높은 주파수가 강할 때
    this.currentMouthShapes.ih = Math.min(
      (midFreq + midHighFreq) * sensitivity * 0.5,
      maxAmp
    );

    // 'ou' (오/우) - 낮은 주파수가 강할 때
    this.currentMouthShapes.ou = Math.min(
      (lowFreq + midLowFreq) * sensitivity * 0.7,
      maxAmp
    );

    // 'ee' (에) - 중간 주파수 특화
    this.currentMouthShapes.ee = Math.min(midFreq * sensitivity * 0.6, maxAmp);

    // 'oh' (오) - 전체적으로 균등하지만 낮은 주파수 우세
    this.currentMouthShapes.oh = Math.min(
      totalEnergy * sensitivity * 0.4,
      maxAmp
    );
  }

  /**
   * 특정 주파수 대역의 에너지 계산
   */
  private getFrequencyEnergy(startIndex: number, endIndex: number): number {
    if (!this.dataArray) return 0;

    let sum = 0;
    const length = Math.min(
      endIndex - startIndex,
      this.dataArray.length - startIndex
    );

    for (let i = startIndex; i < startIndex + length; i++) {
      sum += this.dataArray[i];
    }

    return sum / (length * 255); // 0-1 정규화
  }

  /**
   * 계산된 mouth shapes를 VRM에 적용
   */
  private applyMouthShapes(): void {
    const expressionManager = this.vrm.expressionManager;
    const smoothing = this.config.smoothingFactor;

    // 스무딩 적용
    for (const [key, value] of Object.entries(this.currentMouthShapes)) {
      const prev =
        this.previousMouthShapes[key as keyof typeof this.previousMouthShapes];
      const smoothed = prev * smoothing + value * (1 - smoothing);

      // VRM expression에 적용
      try {
        expressionManager?.setValue(key, smoothed);
      } catch {
        // expression이 존재하지 않는 경우 무시
      }

      this.previousMouthShapes[key as keyof typeof this.previousMouthShapes] =
        smoothed;
    }
  }

  /**
   * mouth shapes 초기화
   */
  private resetMouthShapes(): void {
    const expressionManager = this.vrm.expressionManager;

    Object.keys(this.currentMouthShapes).forEach((key) => {
      try {
        expressionManager?.setValue(key, 0);
      } catch {
        // expression이 존재하지 않는 경우 무시
      }
    });

    this.currentMouthShapes = {
      aa: 0,
      ih: 0,
      ou: 0,
      ee: 0,
      oh: 0,
    };

    this.previousMouthShapes = { ...this.currentMouthShapes };
  }

  /**
   * 설정 업데이트
   */
  public updateConfig(newConfig: Partial<LipSyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 mouth shape 값들 반환
   */
  public getCurrentMouthShapes() {
    return { ...this.currentMouthShapes };
  }

  /**
   * 분석 중인지 확인
   */
  public isActive(): boolean {
    return this.isAnalyzing;
  }
}
