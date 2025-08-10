"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface TTSOptions {
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface UseTTSProps {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  onAudioElementChange?: (audioElement: HTMLAudioElement | null) => void;
  characterId?: string; // 캐릭터별 음성 설정을 위한 ID
}

export function useTTS({
  onStart,
  onEnd,
  onError,
  onAudioElementChange,
  characterId,
}: UseTTSProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7); // 기본 볼륨 70%
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 캐릭터별 로컬 스토리지 키 생성
  const getVoiceStorageKey = (characterId?: string) => {
    return characterId
      ? `selectedVoiceId_${characterId}`
      : "selectedVoiceId_default";
  };

  // 볼륨 및 음성 설정 로드 및 이벤트 리스너
  useEffect(() => {
    // 로컬 스토리지에서 볼륨 설정 로드
    const savedVolume = localStorage.getItem("ttsVolume");
    if (savedVolume) {
      setVolume(parseInt(savedVolume) / 100);
    }

    // 캐릭터별 음성 설정 로드
    const voiceStorageKey = getVoiceStorageKey(characterId);
    const savedVoiceId = localStorage.getItem(voiceStorageKey);
    if (savedVoiceId) {
      setSelectedVoiceId(savedVoiceId);
    }

    // 볼륨 변경 이벤트 리스너
    const handleVolumeChange = (event: CustomEvent) => {
      const newVolume = event.detail.volume;
      setVolume(newVolume);

      // 현재 재생 중인 오디오에 즉시 적용
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    };

    // 음성 변경 이벤트 리스너 (현재 캐릭터에 해당하는 변경만 처리)
    const handleVoiceChange = (event: CustomEvent) => {
      const { voiceId, characterId: eventCharacterId } = event.detail;

      // 현재 캐릭터에 해당하는 변경사항만 적용
      if (eventCharacterId === characterId) {
        setSelectedVoiceId(voiceId);
      }
    };

    window.addEventListener(
      "ttsVolumeChange",
      handleVolumeChange as EventListener
    );

    window.addEventListener(
      "ttsVoiceChange",
      handleVoiceChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "ttsVolumeChange",
        handleVolumeChange as EventListener
      );
      window.removeEventListener(
        "ttsVoiceChange",
        handleVoiceChange as EventListener
      );
    };
  }, [characterId]);

  const speak = useCallback(
    async (text: string, options: TTSOptions = {}) => {
      try {
        setError(null);
        setIsLoading(true);

        // 기존 재생 중단
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
          onAudioElementChange?.(null);
        }

        // 기존 요청 중단
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        abortControllerRef.current = new AbortController();

        // 음성 ID 결정 로직: 사용자 설정 > options에서 전달된 voice_id > 기본값
        const finalVoiceId = selectedVoiceId || options.voice_id;

        // TTS API 호출
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            voice_id: finalVoiceId,
            ...options,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();

          // 429 오류(동시 요청 제한)의 경우 조용히 실패 처리
          if (response.status === 429) {
            console.warn("TTS API rate limit exceeded, skipping request");
            return;
          }

          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        // 오디오 데이터를 Blob으로 변환
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // 오디오 엘리먼트 생성 및 재생
        const audio = new Audio(audioUrl);
        audio.volume = volume; // 현재 설정된 볼륨 적용
        audioRef.current = audio;

        // 즉시 새로운 오디오 엘리먼트 알림
        onAudioElementChange?.(audio);

        audio.onloadstart = () => {
          setIsLoading(false);
          setIsPlaying(true);
          onStart?.();
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          onAudioElementChange?.(null);
          onEnd?.();
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          const error = new Error("Audio playback failed");
          setError(error.message);
          onError?.(error);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          onAudioElementChange?.(null);
        };

        await audio.play();
      } catch (err) {
        setIsLoading(false);
        setIsPlaying(false);

        if (err instanceof Error) {
          if (err.name === "AbortError") {
            return; // 요청이 중단된 경우 에러로 처리하지 않음
          }
          setError(err.message);
          onError?.(err);
        } else {
          const error = new Error("Unknown error occurred");
          setError(error.message);
          onError?.(error);
        }
      }
    },
    [onStart, onEnd, onError, onAudioElementChange, volume, selectedVoiceId]
  );

  const stop = useCallback(() => {
    // 진행 중인 요청 중단
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 오디오 재생 중단
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      onAudioElementChange?.(null);
    }

    setIsLoading(false);
    setIsPlaying(false);
  }, [onAudioElementChange]);

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return {
    speak,
    stop,
    pause,
    resume,
    isLoading,
    isPlaying,
    error,
    audioElement: audioRef.current,
  };
}
