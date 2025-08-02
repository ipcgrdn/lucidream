"use client";

import { useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RightCardProps {
  isOpen: boolean;
}

export default function RightCard({ isOpen }: RightCardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputValue };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "오류가 발생했습니다. 다시 시도해주세요.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`
      fixed right-6 top-1/2 -translate-y-1/2 h-[70%] w-120 
      bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl shadow-2xl
      transform transition-all duration-500 ease-out z-40
      ${isOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"}
      before:absolute before:inset-0 before:rounded-2xl 
      before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent
      before:backdrop-blur-xl
    `}
    >
      <div className="relative h-full p-6 flex flex-col">
        <ChatMessages messages={messages} isLoading={isLoading} />

        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
