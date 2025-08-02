"use client";

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
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="메시지를 입력하세요..."
        className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[50px] max-h-[100px]"
        rows={1}
        disabled={isLoading}
      />
      <button
        onClick={onSendMessage}
        disabled={!inputValue.trim() || isLoading}
        className="bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-white p-3 rounded-2xl transition-colors duration-200 flex items-center justify-center min-w-[50px]"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <svg
            className="w-5 h-5 rotate-90"
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