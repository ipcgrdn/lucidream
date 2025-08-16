"use client";

import { useState } from "react";
import {
  AnimationPresetType,
  getAllAnimationPresets,
} from "@/lib/vrm-animations";
import { UserPlanInfo } from "@/lib/plan";

interface AnimationSectionProps {
  onAnimationPlay?: (presetType: AnimationPresetType) => void;
  userPlan?: UserPlanInfo | null;
  onUpgradeClick?: () => void;
}

export default function AnimationSection({
  onAnimationPlay,
  userPlan,
  onUpgradeClick,
}: AnimationSectionProps) {
  const [selectedAnimation, setSelectedAnimation] =
    useState<AnimationPresetType | null>(null);

  // 첫 10개 애니메이션은 free, 나머지는 premium
  const allAnimations = getAllAnimationPresets();
  const freeAnimationCount = 10;

  const isPremiumAnimation = (index: number) => {
    return index >= freeAnimationCount;
  };

  const isAnimationLocked = (index: number) => {
    if (!userPlan || userPlan.plan === "premium") return false;
    return isPremiumAnimation(index);
  };

  const handleAnimationClick = (
    presetType: AnimationPresetType,
    index: number
  ) => {
    if (isAnimationLocked(index)) {
      onUpgradeClick?.();
      return;
    }

    setSelectedAnimation(presetType);
    onAnimationPlay?.(presetType);
  };

  const getAnimationDisplayName = (presetType: AnimationPresetType): string => {
    return presetType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getAnimationEmoji = (presetType: AnimationPresetType): string => {
    const emojiMap: Record<AnimationPresetType, string> = {
      idle: "🧘‍♀️",
      happy: "😊",
      sad: "🥺",
      surprised: "😲",
      thinking: "🤔",
      greeting: "👋",
      blow_kiss: "😘",
      cheer: "🎉",
      clap: "👏",
      crazy: "🤪",
      dance: "💃",
      dance_hard: "🕺",
      disappointed: "😞",
      dismiss: "🙄",
      fighting: "🥊",
      flying: "🦋",
      jogging: "🏃‍♀️",
      jump: "🦘",
      jump_around: "🌪️",
      kick: "🦵",
      kiss: "💋",
      lookling: "👀",
      milking: "🥛",
      no: "🙅‍♀️",
      piano: "🎹",
      reject: "✋",
      talking: "💬",
      threatening: "😤",
      tired: "😴",
      tired_walk: "🚶‍♀️",
    };
    return emojiMap[presetType] || "🎭";
  };

  return (
    <div className="h-full overflow-y-auto">
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Animations
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {allAnimations.map((presetType, index) => {
            const isSelected = selectedAnimation === presetType;
            const isLocked = isAnimationLocked(index);

            return (
              <button
                key={presetType}
                onClick={() => handleAnimationClick(presetType, index)}
                className={`
                  p-3 rounded-xl transition-all duration-300 text-left relative
                  ${
                    isSelected
                      ? "bg-white/20 border-2 border-white/30 shadow-lg"
                      : isLocked
                      ? "bg-white/5 border border-white/10 opacity-60"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-lg flex-shrink-0 ${
                      isLocked ? "opacity-70" : ""
                    }`}
                  >
                    {getAnimationEmoji(presetType)}
                  </span>
                  <span
                    className={`text-white text-sm font-medium truncate ${
                      isLocked ? "opacity-70" : ""
                    }`}
                  >
                    {getAnimationDisplayName(presetType)}
                  </span>
                </div>

                {/* Lock overlay */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                    <svg
                      className="w-4 h-4 text-white/80"
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
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
