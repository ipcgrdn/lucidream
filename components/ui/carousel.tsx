"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { findOrCreateDream } from "@/lib/dreams";
import CreateCharacterModal from "@/components/modal/CreateCharacterModal";
import { UserPlanInfo } from "@/lib/plan";

interface SlideData {
  id: string;
  title: string;
  description: string;
  button: string;
  src: string;
  hasTransformation?: boolean;
  isPremium?: boolean;
  isCustom?: boolean;
}

interface CharacterCardProps {
  character: SlideData;
  userId: string;
  userPlan: UserPlanInfo | null;
  onCreateNew?: () => void;
  onUpgradeClick?: () => void;
}

const CharacterCard = ({
  character,
  userId,
  userPlan,
  onCreateNew,
  onUpgradeClick,
}: CharacterCardProps) => {
  const router = useRouter();

  const isLocked = () => {
    if (!userPlan || userPlan.plan === "premium") return false;
    return character.isPremium || character.isCustom;
  };

  const handleClick = async () => {
    if (isLocked()) {
      onUpgradeClick?.();
      return;
    }

    if (character.id === "create-new") {
      onCreateNew?.();
    } else {
      if (!userId) {
        console.error("사용자 ID가 없습니다");
        return;
      }

      const dream = await findOrCreateDream(userId, character.id);

      if (dream) {
        router.push(`/dream/${dream.id}`);
      } else {
        console.error("Dream 생성/조회에 실패했습니다");
      }
    }
  };

  const getBorderStyle = () => {
    if (character.hasTransformation) {
      // 변신 가능한 캐릭터만 - 미니멀한 골드 스타일
      return "border-amber-300/80 shadow-2xl shadow-amber-400/25 ring-1 ring-amber-200/50";
    } else {
      // 기본 캐릭터 (일반 프리미엄 포함)
      return "border-white/20";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/25 border ${getBorderStyle()} ${
        isLocked() ? "relative" : ""
      }`}
    >
      {/* Image Container */}
      <div className="aspect-square relative overflow-hidden">
        {character.src === "create" ? (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <svg
              className="w-16 h-16 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        ) : (
          <Image
            src={character.src}
            alt={character.title}
            width={300}
            height={300}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
              isLocked() ? "filter blur-sm opacity-70" : ""
            }`}
          />
        )}

        {/* Transformation Badge */}
        {character.hasTransformation && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm border border-amber-300/50">
            OUTFIT CHANGE
          </div>
        )}

        {/* Lock Overlay */}
        {isLocked() && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-white/80 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isLocked() ? "hidden" : ""
          }`}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-white font-orbitron font-medium text-xl mb-2 group-hover:text-white/90 transition-colors">
          {character.title}
        </h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-2 group-hover:text-white/80 transition-colors">
          {character.description}
        </p>

        <button className="w-full py-3 bg-white/20 text-white rounded-xl hover:bg-white hover:text-black font-medium transition-all duration-200 backdrop-blur-sm border border-white/30">
          {character.button}
        </button>
      </div>
    </div>
  );
};

interface CarouselProps {
  slides: SlideData[];
  userId: string;
  userPlan: UserPlanInfo | null;
  onUpgradeClick?: () => void;
}

export function Carousel({
  slides,
  userId,
  userPlan,
  onUpgradeClick,
}: CarouselProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {slides.map((slide) => (
            <CharacterCard
              key={slide.id}
              character={slide}
              userId={userId}
              userPlan={userPlan}
              onCreateNew={handleCreateNew}
              onUpgradeClick={onUpgradeClick}
            />
          ))}
        </div>
      </div>

      <CreateCharacterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
