"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import AffectionBar from "@/components/ui/affection-bar";

interface AffectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  affectionPoints?: number;
  characterName?: string;
}

export default function AffectionModal({
  isOpen,
  onClose,
  affectionPoints,
  characterName = "Character",
}: AffectionModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex items-center justify-center
        transition-all duration-300 ease-out
        ${isOpen ? "opacity-100" : "opacity-0"}
      `}
      onClick={onClose}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* 모달 컨텐츠 */}
      <div
        className={`
          relative bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 
          backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl
          w-[90vw] max-w-md mx-4 overflow-hidden
          transition-all duration-300 ease-out transform
          ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {characterName}의 호감도
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* 호감도 바 */}
        <div className="p-6">
          <AffectionBar points={affectionPoints} animate={true} />
        </div>

        {/* 푸터 */}
        <div className="px-6 pb-6">
          <div className="text-center text-sm text-white/50">
            대화를 통해 호감도를 높여보세요!
          </div>
        </div>
      </div>
    </div>
  );
}
