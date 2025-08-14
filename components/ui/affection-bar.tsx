"use client";

import { useState, useEffect } from "react";
import { AffectionSystem, AFFECTION_LEVELS } from "@/lib/affection";

interface AffectionBarProps {
  points?: number;
  animate?: boolean;
  onPointsChange?: (newPoints: number) => void;
}

export default function AffectionBar({
  points = 0,
  animate = true,
  onPointsChange,
}: AffectionBarProps) {
  const [displayPoints, setDisplayPoints] = useState(points);

  // Update display points when props change
  useEffect(() => {
    if (!animate) {
      setDisplayPoints(points);
      return;
    }

    const difference = points - displayPoints;
    const steps = Math.abs(difference);
    const stepSize = difference / Math.max(steps, 1);

    if (steps === 0) return;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayPoints(points);
        clearInterval(interval);
      } else {
        setDisplayPoints((prev) => prev + stepSize);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [points, animate, displayPoints]);

  // Notify parent component when points change (for future use)
  useEffect(() => {
    if (onPointsChange && Math.round(displayPoints) !== points) {
      onPointsChange(Math.round(displayPoints));
    }
  }, [displayPoints, onPointsChange, points]);

  const currentLevel = AffectionSystem.calculateLevel(displayPoints);
  const progress = AffectionSystem.getProgressToNextLevel(displayPoints);

  return (
    <div className="bg-white/10 rounded-3xl p-5 border border-white/20 shadow-lg backdrop-blur-sm mx-4 md:mx-0">
      {/* Header with sparkles */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
          <h3 className="text-white font-bold text-sm tracking-wide">STATUS</h3>
        </div>
      </div>

      {/* Level Display with Character Card Style */}
      <div className="relative mb-5">
        <div className="bg-gradient-to-r from-white/20 to-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span
                  className="text-3xl drop-shadow-lg"
                  role="img"
                  aria-label={currentLevel.name}
                >
                  {currentLevel.emoji}
                </span>
                {/* Pulse effect for higher levels */}
                {currentLevel.level >= 4 && (
                  <div className="absolute inset-0 animate-pulse">
                    <span className="text-3xl opacity-50">
                      {currentLevel.emoji}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="font-bold text-lg tracking-wider drop-shadow-sm">
                  {currentLevel.name}
                </div>
                <p className="text-xs text-white/70 italic">
                  {currentLevel.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white/90">
                {Math.round(displayPoints)}
              </div>
              <div className="text-xs text-white/50 uppercase tracking-wider">
                Points
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section with Gaming Style */}
      {currentLevel.level < 6 ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-white/70">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Next Level: {AFFECTION_LEVELS[currentLevel.level + 1]?.name}
            </span>
            <span className="text-xs">{Math.round(progress.current)}%</span>
          </div>

          {/* Progress Bar with Gaming Style */}
          <div className="relative">
            <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden border border-white/20">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                style={{
                  width: `${progress.percentage}%`,
                  background: `linear-gradient(90deg, ${currentLevel.color}80, ${currentLevel.color})`,
                  boxShadow: `0 0 15px ${currentLevel.color}60, inset 0 1px 0 rgba(255,255,255,0.3)`,
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Hearts showing current level (0-6 levels = 7 hearts) */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i <= currentLevel.level ? "text-pink-400" : "text-white/20"
                } drop-shadow-sm transition-colors duration-300`}
              >
                ♥
              </span>
            ))}
          </div>
        </div>
      ) : (
        /* Max Level Achievement */
        <div className="text-center space-y-2">
          <div className="animate-pulse">
            <span className="text-2xl">💖✨💖</span>
          </div>
          <div
            className="text-lg font-bold tracking-wider drop-shadow-lg"
            style={{
              color: currentLevel.color,
              textShadow: `0 0 20px ${currentLevel.color}80`,
            }}
          >
            MAXIMUM LOVE ACHIEVED!
          </div>
          {/* Max level hearts */}
          <div className="flex justify-center gap-1 mt-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                className="text-xl text-pink-400 animate-pulse drop-shadow-sm"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                ♥
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
