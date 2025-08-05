"use client";

import { useState, useRef, useCallback } from "react";

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
}

export function useTTS({ onStart, onEnd, onError }: UseTTSProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const speak = useCallback(
    async (text: string, options: TTSOptions = {}) => {
      try {
        setError(null);
        setIsLoading(true);

        // 기존 재생 중단
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        // 기존 요청 중단
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // 새로운 AbortController 생성
        abortControllerRef.current = new AbortController();

        // TTS API 호출
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
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
        audioRef.current = audio;

        audio.onloadstart = () => {
          setIsLoading(false);
          setIsPlaying(true);
          onStart?.();
        };

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
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
    [onStart, onEnd, onError]
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
    }

    setIsLoading(false);
    setIsPlaying(false);
  }, []);

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
  };
}
