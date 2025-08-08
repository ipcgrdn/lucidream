"use client";

import { useState, useEffect } from "react";

interface AudioSectionProps {
  autoTTS?: boolean;
  onAutoTTSToggle?: () => void;
}

export default function AudioSection({
  autoTTS,
  onAutoTTSToggle,
}: AudioSectionProps) {
  const [ttsVolume, setTtsVolume] = useState(70);

  // 컴포넌트 마운트 시 로컬 스토리지에서 설정값 불러오기
  useEffect(() => {
    const savedTtsVolume = localStorage.getItem("ttsVolume");
    if (savedTtsVolume) {
      setTtsVolume(parseInt(savedTtsVolume));
    }
  }, []);

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

      {/* Volume Settings */}
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
    </div>
  );
}
