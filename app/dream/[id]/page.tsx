"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/Authcontext";
import { getDreamById, Dream } from "@/lib/dreams";
import { getCharacterById, Character } from "@/lib/characters";
import { VRMAnimationState } from "@/vrm/vrm-animation";

import ChatNavbar from "@/components/chat/ChatNavbar";
import ChatBackground from "@/components/chat/ChatBackground";
import LeftCard from "@/components/chat/LeftCard";
import RightCard from "@/components/chat/RightCard";
import { LoaderTwo } from "@/components/ui/loader";

export default function DreamChatPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const dreamId = params.id as string;

  const [isLeftCardOpen, setIsLeftCardOpen] = useState(true);
  const [isRightCardOpen, setIsRightCardOpen] = useState(true);

  const [dream, setDream] = useState<Dream | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [dreamLoading, setDreamLoading] = useState(true);
  const [vrmAnimationData, setVrmAnimationData] = useState<
    VRMAnimationState | undefined
  >(undefined);

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
      } catch (error) {
        console.error("Dream 데이터 로딩 에러:", error);
        router.push("/dream");
      } finally {
        setDreamLoading(false);
      }
    };

    loadDreamData();
  }, [dreamId, user, router]);

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
        onLeftMenuClick={() => setIsLeftCardOpen(!isLeftCardOpen)}
        onRightMenuClick={() => setIsRightCardOpen(!isRightCardOpen)}
      />

      <ChatBackground character={character} animationData={vrmAnimationData} />

      <LeftCard isOpen={isLeftCardOpen} />
      <RightCard
        isOpen={isRightCardOpen}
        dreamId={dreamId}
        character={character}
        onAnimationData={setVrmAnimationData}
      />
    </div>
  );
}
