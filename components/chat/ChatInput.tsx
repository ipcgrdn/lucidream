"use client";

import { useEffect, useRef } from "react";

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
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
        placeholder="Ask something..."
        className="flex w-full bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder-white/70 resize-none focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all duration-200 overflow-hidden items-center backdrop-blur-sm"
        style={{ height: "40px", maxHeight: "80px" }}
        disabled={isLoading}
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
    </div>
  );
}
