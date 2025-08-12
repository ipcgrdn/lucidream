"use client";

import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export default function ChatInput({
  inputValue,
  setInputValue,
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [shouldAutoSend, setShouldAutoSend] = useState(false);

  // 음성 인식 훅
  const { isRecording, isProcessing, startRecording, stopRecording } =
    useSpeechRecognition({
      onTranscriptionComplete: (text: string) => {
        setInputValue(text);
        setShouldAutoSend(true); // 자동 전송 플래그 설정
      },
      onError: (error: string) => {
        console.error(error);
      },
    });

  // inputValue가 변경되고 shouldAutoSend가 true일 때 자동 전송
  useEffect(() => {
    if (shouldAutoSend && inputValue.trim()) {
      setShouldAutoSend(false);
      setTimeout(() => {
        onSendMessage();
      }, 100);
    }
  }, [inputValue, shouldAutoSend, onSendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "40px";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  return (
    <div className="flex gap-2 items-end">
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={
          isRecording
            ? "Say something..."
            : isProcessing
            ? "Translating..."
            : "Ask something..."
        }
        className="flex w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder-white/70 resize-none focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all duration-200 overflow-hidden items-center backdrop-blur-sm"
        style={{ height: "40px", maxHeight: "80px" }}
        disabled={isLoading || isRecording || isProcessing}
      />

      <button
        onClick={onSendMessage}
        disabled={!inputValue.trim() || isLoading}
        className="bg-white/15 hover:bg-white/25 disabled:bg-white/5 disabled:text-white/30 text-white p-2 rounded-2xl transition-all duration-200 flex items-center justify-center w-[40px] h-[40px] flex-shrink-0 backdrop-blur-sm border border-white/10 hover:border-white/20"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg
            className="w-4 h-4 rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        )}
      </button>

      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        disabled={isLoading || isProcessing}
        className={`p-2 rounded-2xl transition-all duration-200 flex items-center justify-center w-[40px] h-[40px] flex-shrink-0 backdrop-blur-sm border ${
          isRecording
            ? "bg-red-500/30 hover:bg-red-500/40 text-red-200 border-red-400/30 hover:border-red-400/50 animate-pulse"
            : isProcessing
            ? "bg-yellow-500/30 text-yellow-200 border-yellow-400/30"
            : "bg-white/15 hover:bg-white/25 text-white/80 hover:text-white border-white/10 hover:border-white/20"
        }`}
      >
        {isProcessing ? (
          <div className="w-4 h-4 border-2 border-yellow-200/50 border-t-yellow-200 rounded-full animate-spin" />
        ) : (
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
        )}
      </button>
    </div>
  );
}
