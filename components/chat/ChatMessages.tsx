"use client";

import { useRef, useEffect } from "react";
import { LoaderTwo } from "../ui/loader";

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
}

export default function ChatMessages({
  messages,
  isLoading,
  messagesLoading = false,
  hasMoreMessages = false,
  loadingMoreMessages = false,
  onLoadMore,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  if (messagesLoading) {
    return (
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <div className="flex justify-center items-center h-full">
          <LoaderTwo />
        </div>
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

      {messages.length === 0 ? (
        <div />
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-4xl ${
                message.role === "user"
                  ? "bg-black/10 text-white ml-2"
                  : "bg-white/10 text-black mr-2"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            </div>
          </div>
        ))
      )}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-4xl mr-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-black/60 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-black/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-black/60 rounded-full animate-bounce"
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
