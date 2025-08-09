"use client";

import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { AffectionLevel } from "@/lib/affection";

interface LevelUpCelebrationProps {
  isVisible: boolean;
  previousLevel: AffectionLevel;
  newLevel: AffectionLevel;
  onComplete: () => void;
}

export default function LevelUpCelebration({
  isVisible,
  previousLevel,
  newLevel,
  onComplete,
}: LevelUpCelebrationProps) {
  const [stage, setStage] = useState<"fadeIn" | "celebrate" | "fadeOut">(
    "fadeIn"
  );
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setStage("celebrate"), 1500);
    const timer2 = setTimeout(() => setStage("fadeOut"), 4500);
    const timer3 = setTimeout(() => onComplete(), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`
      fixed inset-0 z-[9999] flex items-center justify-center
      transition-opacity duration-500
      ${stage === "fadeOut" ? "opacity-0" : "opacity-100"}
    `}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Confetti Effect */}
      {(stage === "celebrate" || stage === "fadeOut") && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={100}
          recycle={false}
          gravity={0.3}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 text-center px-8 max-w-2xl">
        {/* Level Transition Animation */}
        <div className="relative h-32 flex items-center justify-center mb-8">
          {/* Previous Level (fade out) */}
          <div
            className={`
            absolute inset-0 flex flex-col items-center justify-center
            transition-all duration-1500 transform
            ${
              stage === "celebrate" || stage === "fadeOut"
                ? "opacity-0 -translate-y-8 scale-75"
                : "opacity-100 translate-y-0 scale-100"
            }
          `}
          >
            <span className="text-5xl mb-2">{previousLevel.emoji}</span>
            <h2
              className="text-3xl font-bold"
              style={{ color: previousLevel.color }}
            >
              {previousLevel.name}
            </h2>
          </div>

          {/* New Level (fade in) */}
          <div
            className={`
            absolute inset-0 flex flex-col items-center justify-center
            transition-all duration-1500 transform
            ${
              stage === "celebrate" || stage === "fadeOut"
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-125"
            }
          `}
          >
            <div className="relative">
              <span className="text-6xl mb-2 drop-shadow-lg animate-bounce">
                {newLevel.emoji}
              </span>
            </div>
            <h2
              className="text-4xl font-bold drop-shadow-lg animate-pulse"
              style={{
                color: newLevel.color,
                textShadow: `0 0 20px ${newLevel.color}80`,
              }}
            >
              {newLevel.name}
            </h2>
            <p className="text-white/90 text-lg mt-2 italic">
              &quot;{newLevel.description}&quot;
            </p>
          </div>
        </div>

        {/* Celebration Message */}
        {(stage === "celebrate" || stage === "fadeOut") && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-gray-500/20 via-gray-600/20 to-gray-500/20 rounded-3xl p-6 border border-gray-300/30">
              <p className="text-white text-lg font-medium mb-4">
                Congratulations!
              </p>
              <p className="text-white/50 text-sm">
                Your relationship has reached a new milestone.
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
