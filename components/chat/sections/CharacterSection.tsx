"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderTwo } from "@/components/ui/loader";
import { Character } from "@/lib/characters";
import { deleteCustomCharacter } from "@/lib/custom_character";
import { useAuth } from "@/contexts/Authcontext";
import Image from "next/image";

interface CharacterSectionProps {
  character?: Character;
}

export default function CharacterSection({ character }: CharacterSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!character) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderTwo />
      </div>
    );
  }

  // 커스텀 캐릭터인지 확인 (UUID 형식의 ID를 가지고 있거나 created_at이 있는 경우)
  const isCustomCharacter =
    character.created_at ||
    (character.id.length > 10 && character.id.includes("-"));

  // 커스텀 캐릭터 삭제 핸들러
  const handleDeleteCharacter = async () => {
    if (!user || !isCustomCharacter) return;

    if (
      window.confirm(
        "Are you sure you want to delete this character? All data will be permanently deleted."
      )
    ) {
      setIsDeleting(true);
      try {
        const success = await deleteCustomCharacter(character.id, user.id);
        if (success) {
          router.push("/dream");
        } else {
          alert("Failed to delete character.");
        }
      } catch (error) {
        console.error("Character deletion error:", error);
        alert("Character deletion failed.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

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

      {/* 커스텀 캐릭터인 경우에만 삭제 버튼 표시 */}
      {isCustomCharacter && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Management
          </h3>

          <div className="space-y-3">
            {/* Delete Character (Danger Zone) */}
            <button
              onClick={handleDeleteCharacter}
              disabled={isDeleting}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg py-3 text-red-300 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Character
                </>
              )}
            </button>
            <p className="text-red-300/60 text-xs text-center mt-2">
              All character data will be permanently deleted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
