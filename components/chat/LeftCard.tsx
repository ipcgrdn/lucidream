"use client";

import { useState } from "react";
import { Character } from "@/lib/characters";
import { Dream } from "@/lib/dreams";

import CharacterSection from "./sections/CharacterSection";
import AudioSection from "./sections/AudioSection";
import DreamSection from "./sections/DreamSection";
import AnimationSection from "./sections/AnimationSection";
import { Flower, Headphones, UserRound, PlayCircle } from "lucide-react";
import { AnimationPresetType } from "@/lib/vrm-animations";

export type LeftCardSection = "character" | "audio" | "dream" | "animation";

interface LeftCardProps {
  isOpen: boolean;
  character?: Character;
  dream?: Dream;
  autoTTS?: boolean;
  onAutoTTSToggle?: () => void;
  onAnimationPlay?: (presetType: AnimationPresetType) => void;
}

export default function LeftCard({
  isOpen,
  character,
  dream,
  autoTTS,
  onAutoTTSToggle,
  onAnimationPlay,
}: LeftCardProps) {
  const [activeSection, setActiveSection] = useState<LeftCardSection>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leftCardActiveSection");
      return (saved as LeftCardSection) || "character";
    }
    return "character";
  });

  // 활성 섹션 변경 핸들러
  const handleSectionChange = (section: LeftCardSection) => {
    setActiveSection(section);
    localStorage.setItem("leftCardActiveSection", section);
  };

  return (
    <div
      className={`
      fixed left-2 md:left-6 top-1/2 -translate-y-1/2 h-[70%] w-full md:w-120 
      bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl shadow-2xl
      transform transition-all duration-500 ease-out z-40
      ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"}
      before:absolute before:inset-0 before:rounded-2xl 
      before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent
      before:backdrop-blur-xl
    `}
    >
      <div className="relative h-full p-4 flex flex-col">
        {/* 섹션 네비게이션 */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2 bg-white/5 rounded-2xl p-1">
            {/* 캐릭터 섹션 */}
            <button
              onClick={() => handleSectionChange("character")}
              className={`
                p-3 rounded-xl transition-all duration-300 
                ${
                  activeSection === "character"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/60 hover:text-white/80 hover:bg-white/10"
                }
              `}
            >
              <UserRound className="w-5 h-5" />
            </button>

            {/* 오디오 섹션 */}
            <button
              onClick={() => handleSectionChange("audio")}
              className={`
                p-3 rounded-xl transition-all duration-300 
                ${
                  activeSection === "audio"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/60 hover:text-white/80 hover:bg-white/10"
                }
              `}
            >
              <Headphones className="w-5 h-5" />
            </button>

            {/* Animation 섹션 */}
            <button
              onClick={() => handleSectionChange("animation")}
              className={`
                p-3 rounded-xl transition-all duration-300 
                ${
                  activeSection === "animation"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/60 hover:text-white/80 hover:bg-white/10"
                }
              `}
            >
              <PlayCircle className="w-5 h-5" />
            </button>

            {/* Dream 섹션 */}
            <button
              onClick={() => handleSectionChange("dream")}
              className={`
                p-3 rounded-xl transition-all duration-300 
                ${
                  activeSection === "dream"
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/60 hover:text-white/80 hover:bg-white/10"
                }
              `}
            >
              <Flower className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 섹션 내용 */}
        <div className="flex-1 overflow-hidden">
          {activeSection === "character" && (
            <CharacterSection character={character} />
          )}

          {activeSection === "audio" && (
            <AudioSection autoTTS={autoTTS} onAutoTTSToggle={onAutoTTSToggle} />
          )}

          {activeSection === "dream" && (
            <DreamSection dream={dream} character={character} />
          )}

          {activeSection === "animation" && (
            <AnimationSection onAnimationPlay={onAnimationPlay} />
          )}
        </div>
      </div>
    </div>
  );
}
