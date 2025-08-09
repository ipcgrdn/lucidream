"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/Authcontext";
import { getDreamById, Dream } from "@/lib/dreams";
import { getCharacterById, Character } from "@/lib/characters";
import { AnimationPresetType } from "@/lib/vrm-animations";

import ChatNavbar from "@/components/chat/ChatNavbar";
import ChatBackground from "@/components/chat/ChatBackground";
import LeftCard from "@/components/chat/LeftCard";
import RightCard from "@/components/chat/RightCard";
import ChatInput from "@/components/chat/ChatInput";
import { LoaderTwo } from "@/components/ui/loader";
import { getChatsByDreamIdPaginated, saveChatMessage } from "@/lib/dream_chats";
import { detectAnimationInStream } from "@/lib/animation-parser";
import { detectAffectionInStream } from "@/lib/affection-parser";
import { AffectionSystem, AffectionLevel } from "@/lib/affection";
import LevelUpCelebration from "@/components/ui/level-up-celebration";

export default function DreamChatPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const dreamId = params.id as string;

  const [isLeftCardOpen, setIsLeftCardOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isLeftCardOpen");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [isRightCardOpen, setIsRightCardOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isRightCardOpen");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [dream, setDream] = useState<Dream | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [dreamLoading, setDreamLoading] = useState(true);

  // 애니메이션 상태 관리
  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationPresetType>("idle");

  // 채팅 관련 상태
  interface Message {
    role: "user" | "assistant";
    content: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [autoTTS, setAutoTTS] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("autoTTS");
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [lastCompletedMessage, setLastCompletedMessage] = useState<string>("");

  // 립싱크를 위한 오디오 엘리먼트 상태
  const [currentAudioElement, setCurrentAudioElement] =
    useState<HTMLAudioElement | null>(null);

  // 호감도 상태 관리
  const [currentAffectionPoints, setCurrentAffectionPoints] =
    useState<number>(50);

  // 레벨업 축하 상태
  const [isLevelUpVisible, setIsLevelUpVisible] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<AffectionLevel | null>(
    null
  );
  const [newLevel, setNewLevel] = useState<AffectionLevel | null>(null);

  // 애니메이션 변경 핸들러
  const handleAnimationChange = useCallback((preset: AnimationPresetType) => {
    setCurrentAnimation(preset);
  }, []);

  // 레벨업 축하 완료 핸들러
  const handleLevelUpComplete = useCallback(() => {
    setIsLevelUpVisible(false);
    setPreviousLevel(null);
    setNewLevel(null);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadDreamData = async () => {
      if (!dreamId || !user) return;

      setDreamLoading(true);
      try {
        const dreamData = await getDreamById(dreamId);

        if (!dreamData) {
          console.error("Dream을 찾을 수 없습니다");
          router.push("/dream");
          return;
        }

        // 사용자가 해당 dream의 소유자인지 확인
        if (dreamData.user_id !== user.id) {
          console.error("접근 권한이 없습니다");
          router.push("/dream");
          return;
        }

        const characterData = getCharacterById(dreamData.character_id);

        if (!characterData) {
          console.error("캐릭터를 찾을 수 없습니다");
          router.push("/dream");
          return;
        }

        setDream(dreamData);
        setCharacter(characterData);
        setCurrentAffectionPoints(dreamData.affection_points);
      } catch (error) {
        console.error("Dream 데이터 로딩 에러:", error);
        router.push("/dream");
      } finally {
        setDreamLoading(false);
      }
    };

    loadDreamData();
  }, [dreamId, user, router]);

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
    if (!inputValue.trim() || isLoading || !dreamId || !character) return;

    // 새 메시지 전송 시 이전 TTS 완료 상태 초기화
    setLastCompletedMessage("");

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
          currentAffectionPoints: currentAffectionPoints,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessageContent = "";
      let hasTriggeredAnimation = false;
      let detectedAffectionChange = 0;

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

                    // 애니메이션 감지 (한 번만 실행)
                    if (!hasTriggeredAnimation) {
                      const animationDetection = detectAnimationInStream(
                        assistantMessageContent
                      );

                      if (
                        animationDetection.hasAnimation &&
                        animationDetection.animationPreset
                      ) {
                        handleAnimationChange(
                          animationDetection.animationPreset
                        );
                        hasTriggeredAnimation = true;
                      }
                    }

                    // 애니메이션과 호감도 태그를 제거한 깨끗한 텍스트로 메시지 업데이트
                    const animationResult = detectAnimationInStream(
                      assistantMessageContent
                    );
                    const affectionResult = detectAffectionInStream(
                      animationResult.cleanedContent
                    );

                    // 호감도 변화 감지
                    if (
                      affectionResult.hasAffectionChange &&
                      detectedAffectionChange === 0
                    ) {
                      detectedAffectionChange = affectionResult.affectionChange;
                    }

                    const cleanContent = affectionResult.cleanedContent;

                    // 실시간으로 메시지 업데이트
                    setMessages((prev) => {
                      const updatedMessages = [...prev];
                      updatedMessages[updatedMessages.length - 1] = {
                        role: "assistant",
                        content: cleanContent,
                      };
                      return updatedMessages;
                    });
                  } else if (data.done) {
                    // 스트리밍 완료 후 데이터베이스에 저장 (모든 태그 제거된 텍스트로)
                    const finalAnimationResult = detectAnimationInStream(
                      assistantMessageContent
                    );
                    const finalAffectionResult = detectAffectionInStream(
                      finalAnimationResult.cleanedContent
                    );
                    const finalCleanContent =
                      finalAffectionResult.cleanedContent;

                    await saveChatMessage(
                      dreamId,
                      finalCleanContent,
                      "character"
                    );

                    // 호감도 변화가 있으면 업데이트
                    if (detectedAffectionChange !== 0) {
                      const newAffectionPoints = Math.max(
                        -100,
                        Math.min(
                          currentAffectionPoints + detectedAffectionChange,
                          2000
                        )
                      );

                      // 레벨업 체크
                      const shouldTriggerLevelUp =
                        AffectionSystem.shouldTriggerSpecialResponse(
                          currentAffectionPoints,
                          newAffectionPoints
                        );

                      if (shouldTriggerLevelUp) {
                        const oldLevel = AffectionSystem.calculateLevel(
                          currentAffectionPoints
                        );
                        const currentNewLevel =
                          AffectionSystem.calculateLevel(newAffectionPoints);

                        setPreviousLevel(oldLevel);
                        setNewLevel(currentNewLevel);
                        setIsLevelUpVisible(true);
                      }

                      setCurrentAffectionPoints(newAffectionPoints);

                      // 데이터베이스에 호감도 업데이트
                      try {
                        const { supabase } = await import("@/lib/supabase");
                        await supabase
                          .from("dreams")
                          .update({ affection_points: newAffectionPoints })
                          .eq("id", dreamId);
                      } catch (error) {
                        console.error("호감도 업데이트 에러:", error);
                      }
                    }

                    // 자동 TTS를 위해 완료된 메시지 설정
                    if (autoTTS) {
                      setLastCompletedMessage(finalCleanContent);
                    }
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

  if (loading || dreamLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <LoaderTwo />
      </div>
    );
  }

  if (!dream || !character) {
    return null;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <ChatNavbar
        onBackClick={() => router.push("/dream")}
        onLeftMenuClick={() => {
          const newState = !isLeftCardOpen;
          setIsLeftCardOpen(newState);
          localStorage.setItem("isLeftCardOpen", JSON.stringify(newState));
        }}
        onRightMenuClick={() => {
          const newState = !isRightCardOpen;
          setIsRightCardOpen(newState);
          localStorage.setItem("isRightCardOpen", JSON.stringify(newState));
        }}
        onProfileClick={() => {
          alert("Profile");
        }}
        userAvatarUrl={user?.user_metadata?.avatar_url}
      />

      <ChatBackground
        character={character}
        animationPreset={currentAnimation}
        onAnimationChange={handleAnimationChange}
        audioElement={currentAudioElement}
        enableLipSync={true}
      />

      <LeftCard
        isOpen={isLeftCardOpen}
        character={character}
        dream={dream}
        affectionPoints={currentAffectionPoints}
        autoTTS={autoTTS}
        onAutoTTSToggle={() => {
          const newAutoTTS = !autoTTS;
          setAutoTTS(newAutoTTS);
          localStorage.setItem("autoTTS", JSON.stringify(newAutoTTS));
        }}
        onAnimationPlay={handleAnimationChange}
      />

      <RightCard
        isOpen={isRightCardOpen}
        messages={messages}
        messagesLoading={messagesLoading}
        hasMoreMessages={hasMoreMessages}
        loadingMoreMessages={loadingMoreMessages}
        onLoadMore={loadMoreMessages}
        character={character}
        onAnimationTrigger={handleAnimationChange}
        isLoading={isLoading}
        autoTTS={autoTTS}
        lastCompletedMessage={lastCompletedMessage}
        onTTSAudioChange={setCurrentAudioElement}
      />

      {/* 페이지 하단 중앙에 ChatInput 배치 */}
      <div className="fixed bottom-0 md:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/20 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:rounded-3xl before:pointer-events-none relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-white/5 rounded-4xl"></div>
          <div className="relative z-10">
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Level Up Celebration Modal */}
      {previousLevel && newLevel && (
        <LevelUpCelebration
          isVisible={isLevelUpVisible}
          previousLevel={previousLevel}
          newLevel={newLevel}
          onComplete={handleLevelUpComplete}
        />
      )}
    </div>
  );
}
