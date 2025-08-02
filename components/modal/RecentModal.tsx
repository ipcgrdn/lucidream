"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dream, getDreamsByUserId } from "@/lib/dreams";
import { getCharacterById } from "@/lib/characters";
import { useRouter } from "next/navigation";
import { LoaderTwo } from "../ui/loader";
import Image from "next/image";

interface RecentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function RecentModal({
  isOpen,
  onClose,
  userId,
}: RecentModalProps) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const loadRecentDreams = async () => {
      setLoading(true);
      try {
        const recentDreams = await getDreamsByUserId(userId);
        setDreams(recentDreams || []);
      } catch (error) {
        console.error("Recent dreams 로딩 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentDreams();
  }, [isOpen, userId]);

  const handleDreamClick = (dreamId: string) => {
    router.push(`/dream/${dreamId}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Recent</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoaderTwo />
            </div>
          ) : dreams.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white/60">No recent dreams</div>
            </div>
          ) : (
            <div className="space-y-3">
              {dreams.map((dream) => {
                const character = getCharacterById(dream.character_id);
                if (!character) return null;

                return (
                  <button
                    key={dream.id}
                    onClick={() => handleDreamClick(dream.id)}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        <Image
                          src={character.previewImage}
                          alt={character.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium group-hover:text-white/90 transition-colors">
                          {character.name}
                        </h3>
                        <p className="text-white/60 text-sm truncate">
                          {character.description}
                        </p>
                        {dream.updated_at && (
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(dream.updated_at).toLocaleDateString(
                              "ko-KR"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Portal을 사용하여 body에 모달 렌더링
  return createPortal(modalContent, document.body);
}
