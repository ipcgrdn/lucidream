"use client";

import { LoaderTwo } from "@/components/ui/loader";
import { Character } from "@/lib/characters";
import AffectionBar from "@/components/ui/affection-bar";
import Image from "next/image";

interface CharacterSectionProps {
  character?: Character;
  affectionPoints?: number;
}

export default function CharacterSection({
  character,
  affectionPoints,
}: CharacterSectionProps) {
  if (!character) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderTwo />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* 캐릭터 프로필 */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-white/10">
          <Image
            src={character.previewImage}
            alt={character.name}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{character.name}</h2>
        <p className="text-white/70 text-sm">{character.description}</p>
      </div>

      {/* 호감도 바 */}
      <AffectionBar points={affectionPoints} animate={true} />

      {/* 성격 정보 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          Personality
        </h3>
        <p className="text-white/80 text-sm leading-relaxed">
          {character.personality}
        </p>
      </div>

      {/* 특성 태그들 */}
      <div className="bg-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Traits
        </h3>
        <div className="flex flex-wrap gap-2">
          {character.traits.map((trait, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-white/10 text-white/90 text-xs rounded-full border border-white/20"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
