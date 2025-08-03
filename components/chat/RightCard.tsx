"use client";

import { useState, useEffect } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

import { getChatsByDreamIdPaginated, saveChatMessage } from "@/lib/dream_chats";
import { Character } from "@/lib/characters";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RightCardProps {
  isOpen: boolean;
  dreamId: string;
  character: Character;
}

export default function RightCard({
  isOpen,
  dreamId,
  character,
}: RightCardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);

  // 최초 채팅 메시지 로드 (최근 20개)
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (!dreamId) return;

      setMessagesLoading(true);
      try {
        const { chats, hasMore } = await getChatsByDreamIdPaginated(
          dreamId,
          20,
          0
        );
        const convertedMessages: Message[] = chats.map((chat) => ({
          role: chat.type === "user" ? "user" : "assistant",
          content: chat.message,
        }));
        setMessages(convertedMessages);
        setHasMoreMessages(hasMore);
      } catch (error) {
        console.error("메시지 로딩 에러:", error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadInitialMessages();
  }, [dreamId]);

  // 더 많은 메시지 로드
  const loadMoreMessages = async () => {
    if (loadingMoreMessages || !hasMoreMessages || !dreamId) return;

    setLoadingMoreMessages(true);
    try {
      const { chats, hasMore } = await getChatsByDreamIdPaginated(
        dreamId,
        20,
        messages.length
      );
      const convertedMessages: Message[] = chats.map((chat) => ({
        role: chat.type === "user" ? "user" : "assistant",
        content: chat.message,
      }));

      // 기존 메시지 앞에 추가
      setMessages((prev) => [...convertedMessages, ...prev]);
      setHasMoreMessages(hasMore);
    } catch (error) {
      console.error("추가 메시지 로딩 에러:", error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !dreamId) return;

    const userMessageContent = inputValue;
    const userMessage: Message = { role: "user", content: userMessageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // 사용자 메시지를 데이터베이스에 저장
      await saveChatMessage(dreamId, userMessageContent, "user");

      // OpenAI API 호출 - 최근 10개 메시지만 전송
      const recentMessages = newMessages.slice(-10);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: recentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          characterId: character.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";

      // 어시스턴트 메시지를 미리 추가하고 스트리밍으로 업데이트
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    assistantMessageContent += data.content;
                    // 실시간으로 메시지 업데이트
                    setMessages((prev) => {
                      const updatedMessages = [...prev];
                      updatedMessages[updatedMessages.length - 1] = {
                        role: "assistant",
                        content: assistantMessageContent,
                      };
                      return updatedMessages;
                    });
                  } else if (data.done) {
                    // 스트리밍 완료 후 데이터베이스에 저장
                    await saveChatMessage(
                      dreamId,
                      assistantMessageContent,
                      "character"
                    );
                    break;
                  }
                } catch (parseError) {
                  console.error("JSON parse error:", parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
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
          onLoadMore={loadMoreMessages}
        />

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
