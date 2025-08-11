"use client";

import { useState, useEffect } from "react";

interface AffectionEffectProps {
  isVisible: boolean;
  affectionChange: number;
  onComplete: () => void;
}

export default function AffectionEffect({
  isVisible,
  affectionChange,
  onComplete,
}: AffectionEffectProps) {
  const [stage, setStage] = useState<"fadeIn" | "animate" | "fadeOut">(
    "fadeIn"
  );
  const [hearts, setHearts] = useState<Array<{ id: number; delay: number }>>(
    []
  );

  // 하트 생성
  useEffect(() => {
    if (!isVisible || affectionChange === 0) return;

    const heartCount = Math.min(Math.abs(affectionChange), 5); // 최대 5개
    const newHearts = Array.from({ length: heartCount }, (_, i) => ({
      id: i,
      delay: i * 100, // 100ms 간격으로 생성
    }));

    setHearts(newHearts);
  }, [isVisible, affectionChange]);

  // 애니메이션 단계 관리
  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setStage("animate"), 300);
    const timer2 = setTimeout(() => setStage("fadeOut"), 2500);
    const timer3 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  if (!isVisible || affectionChange === 0) return null;

  const isPositive = affectionChange > 0;
  const heartColor = isPositive ? "text-red-400" : "text-gray-400";
  const effectText = isPositive ? `+${affectionChange}` : `${affectionChange}`;

  return (
    <div
      className={`
        fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center
        transition-opacity duration-300
        ${stage === "fadeOut" ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* 중앙 텍스트 */}
      <div className="relative z-10 text-center">
        <div
          className={`
            text-4xl font-bold mb-4 transition-all duration-500 transform
            ${isPositive ? "text-red-400" : "text-gray-400"}
            ${
              stage === "animate"
                ? "translate-y-0 scale-100"
                : "translate-y-8 scale-75"
            }
            drop-shadow-lg
          `}
          style={{
            textShadow: isPositive
              ? "0 0 20px rgba(248, 113, 113, 0.6)"
              : "0 0 20px rgba(156, 163, 175, 0.6)",
          }}
        >
          {effectText}
        </div>
      </div>

      {/* 하트 애니메이션들 */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className={`
            absolute ${heartColor} text-6xl transform transition-all duration-2000 ease-out
            ${
              stage === "animate" || stage === "fadeOut"
                ? isPositive
                  ? "translate-y-[-200px] opacity-0"
                  : "translate-y-[200px] opacity-0"
                : "translate-y-0 opacity-100"
            }
          `}
          style={{
            left: `${50 + (Math.random() - 0.5) * 60}%`,
            top: `${50 + (Math.random() - 0.5) * 40}%`,
            animationDelay: `${heart.delay}ms`,
            filter: isPositive
              ? "drop-shadow(0 0 10px rgba(248, 113, 113, 0.8))"
              : "drop-shadow(0 0 10px rgba(156, 163, 175, 0.8))",
          }}
        >
          {isPositive ? "💖" : "💔"}
        </div>
      ))}

      {/* 배경 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-2 h-2 ${
                isPositive ? "bg-red-400" : "bg-gray-400"
              } rounded-full
              transition-all duration-2000 ease-out
              ${
                stage === "animate" || stage === "fadeOut"
                  ? "opacity-0 scale-0"
                  : "opacity-60 scale-100"
              }
            `}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (Math.random() - 0.5) * 40}%`,
              animationDelay: `${i * 200}ms`,
              transform:
                stage === "animate" || stage === "fadeOut"
                  ? `translateY(${isPositive ? "-300px" : "300px"}) rotate(${
                      Math.random() * 360
                    }deg)`
                  : "translateY(0) rotate(0deg)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
