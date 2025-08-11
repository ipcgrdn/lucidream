"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { findOrCreateDream } from "@/lib/dreams";
import CreateCharacterModal from "@/components/modal/CreateCharacterModal";

interface SlideData {
  id: string;
  title: string;
  description: string;
  button: string;
  src: string;
}

interface CharacterCardProps {
  character: SlideData;
  userId: string;
  onCreateNew?: () => void;
}

const CharacterCard = ({
  character,
  userId,
  onCreateNew,
}: CharacterCardProps) => {
  const router = useRouter();

  const handleClick = async () => {
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

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-black/25 border border-white/20"
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
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-white font-bold text-xl mb-2 group-hover:text-white/90 transition-colors">
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
}

export function Carousel({ slides, userId }: CarouselProps) {
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
              onCreateNew={handleCreateNew}
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
