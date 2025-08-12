"use client";

import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionProps {
  onTranscriptionComplete: (text: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = ({
  onTranscriptionComplete,
  onError,
}: UseSpeechRecognitionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringRef = useRef<boolean>(false);
  const speechDetectedRef = useRef<boolean>(false);

  // 오디오 레벨 모니터링 함수
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !monitoringRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current.getByteFrequencyData(dataArray);

    // 평균 음성 레벨 계산
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

    const SPEECH_THRESHOLD = 25; // 음성 감지 임계값 (조정 가능)
    const SILENCE_THRESHOLD = 15; // 무음 감지 임계값
    const SILENCE_DURATION = 2000; // 2초간 무음 시 종료

    if (average > SPEECH_THRESHOLD) {
      // 음성 감지됨
      if (!speechDetectedRef.current) {
        console.log("🎤 Speech detected! Starting recording...");
        speechDetectedRef.current = true;
        setIsRecording(true);

        // MediaRecorder 시작
        if (mediaRecorderRef.current?.state === "inactive") {
          mediaRecorderRef.current.start();
        }
      }

      // 무음 타이머 리셋
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else if (average < SILENCE_THRESHOLD && speechDetectedRef.current) {
      // 무음 감지됨 (이미 음성이 감지된 후)
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          console.log("🔇 Silence detected! Stopping recording...");
          stopRecording();
        }, SILENCE_DURATION);
      }
    }

    // 다음 프레임에서 다시 모니터링
    if (monitoringRef.current) {
      requestAnimationFrame(monitorAudioLevel);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      console.log("🎙️ Initializing voice detection...");

      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio Context 설정
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      // 마이크 입력을 Audio Context에 연결
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder 설정 (자동으로 시작되지 않음)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 데이터 수집
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 완료 처리
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });

        console.log("📦 Processing recorded audio...");
        // Whisper API 호출
        await sendToWhisper(audioBlob);
      };

      // 상태 초기화
      speechDetectedRef.current = false;
      monitoringRef.current = true;

      // 오디오 레벨 모니터링 시작
      console.log("👂 Listening for speech...");
      monitorAudioLevel();
    } catch (error) {
      console.error("Failed to start recording:", error);
      onError?.("마이크 접근이 거부되었습니다. 마이크 권한을 허용해주세요.");
    }
  }, [onError, monitorAudioLevel]);

  const stopRecording = useCallback(() => {
    console.log("🛑 Stopping voice detection...");

    // 모니터링 중지
    monitoringRef.current = false;
    speechDetectedRef.current = false;

    // 무음 타이머 정리
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // MediaRecorder 중지 (녹음 중인 경우만)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsProcessing(true);
    }

    // 오디오 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Audio Context 정리
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);
    analyserRef.current = null;
  }, []);

  const sendToWhisper = async (audioBlob: Blob) => {
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      // Whisper API 호출
      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("음성 변환에 실패했습니다.");
      }

      const data = await response.json();

      if (data.success && data.text) {
        onTranscriptionComplete(data.text);
      } else {
        throw new Error("음성이 인식되지 않았습니다.");
      }
    } catch (error) {
      console.error("Whisper API error:", error);
      onError?.("음성 변환 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
