"use client";

import { useState, useEffect } from "react";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  preview_url: string;
  labels: {
    [key: string]: string;
  };
  settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  } | null;
}

interface AudioSectionProps {
  autoTTS?: boolean;
  onAutoTTSToggle?: () => void;
  characterId?: string; // 캐릭터별 설정을 위한 ID 추가
}

export default function AudioSection({
  autoTTS,
  onAutoTTSToggle,
  characterId,
}: AudioSectionProps) {
  const [ttsVolume, setTtsVolume] = useState(70);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // 캐릭터별 로컬 스토리지 키 생성
  const getVoiceStorageKey = (characterId?: string) => {
    return characterId
      ? `selectedVoiceId_${characterId}`
      : "selectedVoiceId_default";
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 설정값 불러오기
  useEffect(() => {
    const savedTtsVolume = localStorage.getItem("ttsVolume");
    if (savedTtsVolume) {
      setTtsVolume(parseInt(savedTtsVolume));
    }

    const voiceStorageKey = getVoiceStorageKey(characterId);
    const savedVoiceId = localStorage.getItem(voiceStorageKey);
    if (savedVoiceId) {
      setSelectedVoiceId(savedVoiceId);
    }

    // 음성 목록 로드
    loadVoices();
  }, [characterId]);

  // 음성 목록 로드 함수
  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const response = await fetch("/api/voices");
      if (response.ok) {
        const data = await response.json();
        setVoices(data.voices);
      } else {
        console.error("Failed to load voices");
      }
    } catch (error) {
      console.error("Error loading voices:", error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // TTS 볼륨 변경 핸들러
  const handleTtsVolumeChange = (value: number) => {
    setTtsVolume(value);
    localStorage.setItem("ttsVolume", value.toString());

    // 전역 TTS 볼륨 설정을 위한 이벤트 디스패치
    window.dispatchEvent(
      new CustomEvent("ttsVolumeChange", {
        detail: { volume: value / 100 }, // 0-1 범위로 변환
      })
    );
  };

  // 음성 선택 핸들러
  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);

    // 캐릭터별 로컬 스토리지에 저장
    const voiceStorageKey = getVoiceStorageKey(characterId);
    localStorage.setItem(voiceStorageKey, voiceId);

    // 전역 음성 변경 이벤트 디스패치 (캐릭터 ID 포함)
    window.dispatchEvent(
      new CustomEvent("ttsVoiceChange", {
        detail: { voiceId, characterId },
      })
    );
  };

  // 음성 미리듣기 핸들러 (Preview URL 우선, TTS API 폴백)
  const handlePreviewVoice = async (voice: Voice) => {
    if (playingPreview === voice.voice_id) {
      // 현재 재생 중인 미리듣기 중단
      setPlayingPreview(null);
      return;
    }

    setPlayingPreview(voice.voice_id);

    try {
      // 1순위: Preview URL 사용 (무료, 빠름)
      if (voice.preview_url && voice.preview_url.trim() !== "") {
        const audio = new Audio(voice.preview_url);
        audio.volume = 0.7;

        audio.onended = () => {
          setPlayingPreview(null);
        };

        audio.onerror = () => {
          console.warn(
            `Preview URL failed for ${voice.name}, falling back to TTS API`
          );
          generateTTSPreview(voice);
        };

        await audio.play();
        return;
      }

      // 2순위: TTS API 사용 (Preview URL이 없는 경우)
      generateTTSPreview(voice);
    } catch (error) {
      console.error("Error playing preview:", error);
      setPlayingPreview(null);
    }
  };

  // TTS API로 미리듣기 생성 (최소 토큰 사용)
  const generateTTSPreview = async (voice: Voice) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Welcome to Lucidream!",
          voice_id: voice.voice_id,
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.7;

        audio.onended = () => {
          setPlayingPreview(null);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          console.error(`TTS preview failed for voice: ${voice.name}`);
          setPlayingPreview(null);
        };

        await audio.play();
      } else {
        console.error("TTS API failed for preview");
        setPlayingPreview(null);
      }
    } catch (error) {
      console.error("TTS API error:", error);
      setPlayingPreview(null);
    }
  };
  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Voice Settings */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12a3 3 0 106 0v-5a3 3 0 10-6 0v5z"
            />
          </svg>
          Voice Settings
        </h3>

        <div className="space-y-4">
          {/* Auto TTS Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Auto Voice Playback</span>
            <button
              onClick={onAutoTTSToggle}
              className={`
                relative w-12 h-6 rounded-full transition-colors duration-300
                ${autoTTS ? "bg-blue-500" : "bg-white/20"}
              `}
            >
              <div
                className={`
                absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300
                ${autoTTS ? "translate-x-7" : "translate-x-1"}
              `}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Volume Control */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M6 12h.01M6 12a6 6 0 106 0v0"
            />
          </svg>
          Volume Control
        </h3>

        <div className="space-y-4">
          {/* TTS Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/70 text-xs">Volume</label>
              <span className="text-white/60 text-xs">{ttsVolume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs">Low</span>
              <input
                type="range"
                min="0"
                max="100"
                value={ttsVolume}
                onChange={(e) =>
                  handleTtsVolumeChange(parseInt(e.target.value))
                }
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${ttsVolume}%, rgba(255,255,255,0.2) ${ttsVolume}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
              <span className="text-white/50 text-xs">High</span>
            </div>
          </div>
        </div>
      </div>
      {/* Voice Selection - 가장 아래에 위치 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          Voice Selection
        </h3>

        {/* Voice Grid (Default Voice 포함) */}
        {!isLoadingVoices && (
          <div className="grid grid-cols-1 gap-2">
            {/* Default Voice Option - 스크롤 내부로 이동 */}
            <div
              className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                selectedVoiceId === ""
                  ? "bg-blue-500/20 border-blue-500/50"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
              onClick={() => handleVoiceChange("")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate">
                    Default Voice
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 ml-1">
                      System
                    </span>
                  </div>
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">
                    Automatically switch based on language
                  </div>
                </div>
              </div>
            </div>
            {voices.map((voice) => (
              <div
                key={voice.voice_id}
                className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedVoiceId === voice.voice_id
                    ? "bg-blue-500/20 border-blue-500/50"
                    : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
                onClick={() => handleVoiceChange(voice.voice_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">
                      {voice.name}
                      {voice.labels?.gender && (
                        <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-300 ml-1">
                          {voice.labels.gender === "female"
                            ? "Female"
                            : voice.labels.gender === "male"
                            ? "Male"
                            : "Neutral"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/60 mt-1 line-clamp-2">
                      {voice.description || "No description available"}
                    </div>
                  </div>

                  {/* Preview Button - 모든 음성에 표시 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewVoice(voice);
                    }}
                    disabled={playingPreview !== null}
                    className="ml-2 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                    title="Preview voice"
                  >
                    {playingPreview === voice.voice_id ? (
                      <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-white/60"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
