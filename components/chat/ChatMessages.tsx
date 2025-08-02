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
}

export default function ChatMessages({
  messages,
  isLoading,
  messagesLoading = false,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="flex-1 overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
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
