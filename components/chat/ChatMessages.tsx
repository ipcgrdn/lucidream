"use client";

import { useRef, useEffect, useCallback } from "react";
import { LoaderTwo } from "../ui/loader";
import { useTTS } from "@/hooks/useTTS";
import { AnimationPresetType } from "@/lib/vrm-animations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesLoading?: boolean;
  hasMoreMessages?: boolean;
  loadingMoreMessages?: boolean;
  onLoadMore?: () => void;
  characterId?: string;
  onAnimationTrigger?: (preset: AnimationPresetType) => void;
  autoTTS?: boolean;
  lastCompletedMessage?: string;
  onTTSAudioChange?: (audioElement: HTMLAudioElement | null) => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  messagesLoading = false,
  hasMoreMessages = false,
  loadingMoreMessages = false,
  onLoadMore,
  characterId,
  autoTTS = true,
  lastCompletedMessage,
  onTTSAudioChange,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastProcessedMessageRef = useRef<string>("");

  // TTS 훅
  const {
    speak,
    stop,
    isLoading: ttsLoading,
    isPlaying,
    audioElement,
  } = useTTS({
    onAudioElementChange: onTTSAudioChange,
    characterId,
  });

  // 오디오 엘리먼트 변경 시 상위 컴포넌트에 전달 (초기값)
  useEffect(() => {
    onTTSAudioChange?.(audioElement);
  }, [audioElement, onTTSAudioChange]);

  // 새 메시지가 추가될 때 진행 중인 TTS 중단
  useEffect(() => {
    if (isPlaying && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "user") {
        stop(); // 사용자가 새 메시지를 보내면 TTS 중단
      }
    }
  }, [messages, isPlaying, stop]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 스크롤 감지하여 더 많은 메시지 로드
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || !onLoadMore) return;

    const handleScroll = () => {
      if (
        container.scrollTop === 0 &&
        hasMoreMessages &&
        !loadingMoreMessages
      ) {
        const scrollHeight = container.scrollHeight;
        onLoadMore();
        // 로드 후 스크롤 위치 유지
        setTimeout(() => {
          if (container.scrollHeight > scrollHeight) {
            container.scrollTop = container.scrollHeight - scrollHeight;
          }
        }, 100);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMoreMessages, onLoadMore]);

  // TTS 재생 함수 (사용자가 선택한 음성 사용)
  const handleSpeak = useCallback(
    (text: string) => {
      speak(text, {
        model_id: "eleven_multilingual_v2", // 한국어 지원 모델
      });
    },
    [speak]
  );

  // 자동 TTS 재생
  useEffect(() => {
    if (
      autoTTS &&
      lastCompletedMessage &&
      lastCompletedMessage.trim() &&
      lastCompletedMessage !== lastProcessedMessageRef.current
    ) {
      // 마지막 메시지가 assistant 메시지인지 확인
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage &&
        lastMessage.role === "assistant" &&
        lastMessage.content === lastCompletedMessage
      ) {
        // 이미 처리된 메시지로 표시
        lastProcessedMessageRef.current = lastCompletedMessage;

        // TTS가 이미 진행 중이거나 로딩 중이면 중단
        if (isPlaying || ttsLoading) {
          stop();
        }

        // 짧은 딜레이 후 자동 재생
        const timer = setTimeout(() => {
          speak(lastCompletedMessage, {
            model_id: "eleven_multilingual_v2",
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [lastCompletedMessage, autoTTS, messages]);

  if (messagesLoading) {
    return (
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="flex justify-center items-center h-full">
          <LoaderTwo />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-white text-sm">No messages yet</p>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
    >
      {/* 로딩 표시만 */}
      {loadingMoreMessages && (
        <div className="flex justify-center py-2">
          <div className="flex items-center space-x-2 text-white/60">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      )}

      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-2xl relative group ${
              message.role === "user"
                ? "bg-black/10 text-white ml-2"
                : "bg-white/10 text-black mr-2"
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* AI 메시지 중앙에 TTS 버튼 오버레이 */}
            {message.role === "assistant" && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-2xl backdrop-blur-sm">
                <button
                  onClick={() => {
                    if (isPlaying) {
                      stop();
                    } else {
                      handleSpeak(message.content);
                    }
                  }}
                  disabled={ttsLoading || isLoading}
                  className="p-3 rounded-full bg-white/50 hover:bg-white/80 shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
                  title={
                    isLoading
                      ? "새 메시지 생성 중..."
                      : isPlaying
                      ? "음성 중지"
                      : "음성으로 듣기"
                  }
                >
                  {ttsLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-700"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-gray-700"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3z" />
                      <path d="M16.5 12A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      <path d="M19 12c0-2.53-1.61-4.86-4-5.87v11.74c2.39-1.01 4-3.34 4-5.87z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-2xl mr-2">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-black/60 rounded-full animate-bounce"></div>
              <div
                className="w-1 h-1 bg-black/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-1 bg-black/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
