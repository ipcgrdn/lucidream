"use client";

import ChatMessages from "./ChatMessages";
import { Character } from "@/lib/characters";
import { AnimationPresetType } from "@/lib/vrm-animations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RightCardProps {
  isOpen: boolean;
  messages: Message[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  onLoadMore: () => void;
  character: Character;
  onAnimationTrigger?: (preset: AnimationPresetType) => void;
  isLoading: boolean;
  autoTTS: boolean;
  lastCompletedMessage: string;
}

export default function RightCard({
  isOpen,
  messages,
  messagesLoading,
  hasMoreMessages,
  loadingMoreMessages,
  onLoadMore,
  character,
  onAnimationTrigger,
  isLoading,
  autoTTS,
  lastCompletedMessage,
}: RightCardProps) {

  return (
    <div
      className={`
      fixed right-2 md:right-6 top-1/2 -translate-y-1/2 h-[70%] w-full md:w-120 
      bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl shadow-2xl
      transform transition-all duration-500 ease-out z-40
      ${isOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"}
      before:absolute before:inset-0 before:rounded-2xl 
      before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent
      before:backdrop-blur-xl
    `}
    >
      <div className="relative h-full p-6 flex flex-col">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          messagesLoading={messagesLoading}
          hasMoreMessages={hasMoreMessages}
          loadingMoreMessages={loadingMoreMessages}
          onLoadMore={onLoadMore}
          characterId={character.id}
          onAnimationTrigger={onAnimationTrigger}
          autoTTS={autoTTS}
          lastCompletedMessage={lastCompletedMessage}
        />
      </div>
    </div>
  );
}
