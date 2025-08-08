"use client";

import { useState, useEffect } from "react";
import { Dream, deleteDream } from "@/lib/dreams";
import { Character } from "@/lib/characters";
import Image from "next/image";
import { LoaderTwo } from "@/components/ui/loader";
import { useRouter } from "next/navigation";
import BackgroundSelectionModal from "@/components/modal/BackgroundSelectionModal";

interface DreamSectionProps {
  dream?: Dream;
  character?: Character;
}

export default function DreamSection({ dream, character }: DreamSectionProps) {
  const router = useRouter();
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState<string>(
    character?.backgroundImage || ""
  );
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  // 컴포넌트 마운트 시 로컬 스토리지에서 설정값 불러오기
  useEffect(() => {
    const savedBackgroundBlur = localStorage.getItem("backgroundBlur");
    const savedBackground = localStorage.getItem("selectedBackground");

    if (savedBackgroundBlur) {
      setBackgroundBlur(parseInt(savedBackgroundBlur));
    }
    if (savedBackground) {
      setSelectedBackground(savedBackground);
    }
  }, []);

  // 배경 블러 변경 핸들러
  const handleBackgroundBlurChange = (value: number) => {
    setBackgroundBlur(value);
    localStorage.setItem("backgroundBlur", value.toString());

    // 전역 배경 블러 설정을 위한 이벤트 디스패치
    window.dispatchEvent(
      new CustomEvent("backgroundBlurChange", {
        detail: { blur: value },
      })
    );
  };

  // 배경 선택 핸들러
  const handleBackgroundSelect = (backgroundPath: string) => {
    setSelectedBackground(backgroundPath);
    localStorage.setItem("selectedBackground", backgroundPath);
    setShowBackgroundModal(false);

    // 전역 배경 변경 이벤트 디스패치
    window.dispatchEvent(
      new CustomEvent("backgroundImageChange", {
        detail: { backgroundImage: backgroundPath },
      })
    );
  };

  // Dream 삭제 핸들러
  const handleDeleteDream = async () => {
    if (!dream) return;

    if (
      window.confirm(
        "Are you sure you want to leave this dream? All chat history will be permanently deleted."
      )
    ) {
      const success = await deleteDream(dream.id);
      if (success) {
        router.push("/dream");
      } else {
        alert("Dream deletion failed.");
      }
    }
  };

  if (!dream || !character) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoaderTwo />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6">
      {/* Background Settings */}
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Background Settings
        </h3>

        <div className="space-y-4">
          {/* Current Background Preview */}
          <div className="w-full h-24 rounded-lg overflow-hidden bg-white/5">
            <Image
              src={selectedBackground}
              alt="Current background"
              width={400}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Background Blur Effect */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/70 text-xs">Blur</label>
              <span className="text-white/60 text-xs">{backgroundBlur}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs">Sharp</span>
              <input
                type="range"
                min="0"
                max="20"
                value={backgroundBlur}
                onChange={(e) =>
                  handleBackgroundBlurChange(parseInt(e.target.value))
                }
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (backgroundBlur / 20) * 100
                  }%, rgba(255,255,255,0.2) ${
                    (backgroundBlur / 20) * 100
                  }%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
              <span className="text-white/50 text-xs">Blurred</span>
            </div>
          </div>

          {/* Change Background Button */}
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-white/80 text-sm transition-colors"
          >
            Select New Background
          </button>
        </div>
      </div>

      {/* Dream Management */}
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
          Dream Management
        </h3>

        <div className="space-y-3">
          {/* Delete Dream (Danger Zone) */}
          <button
            onClick={handleDeleteDream}
            className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg py-3 text-red-300 text-sm transition-colors flex items-center justify-center gap-2"
          >
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
            Leave Dream
          </button>
          <p className="text-red-300/60 text-xs text-center mt-2">
            All chat history will be permanently deleted.
          </p>
        </div>
      </div>

      {/* Background Selection Modal */}
      {character && (
        <BackgroundSelectionModal
          isOpen={showBackgroundModal}
          onClose={() => setShowBackgroundModal(false)}
          character={character}
          selectedBackground={selectedBackground}
          onSelectBackground={handleBackgroundSelect}
        />
      )}
    </div>
  );
}
