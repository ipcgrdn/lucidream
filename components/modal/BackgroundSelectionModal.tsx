"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Character } from "@/lib/characters";
import {
  getUserBackgrounds,
  uploadBackgroundImage,
  deleteBackgroundImage,
  UserBackground,
} from "@/lib/dream_backgrounds";

// 배경 타입 정의
interface BackgroundOption {
  id: string;
  path: string;
  type: "character" | "color" | "custom" | "unsplash";
}

// 캐릭터별 배경 옵션 생성 함수
const getCharacterBackgrounds = (characterId: string): BackgroundOption[] => {
  return [
    {
      id: `${characterId}_1`,
      path: `/background/${characterId}.png`,
      type: "character",
    },
    {
      id: `${characterId}_2`,
      path: `/background/${characterId}2.png`,
      type: "character",
    },
  ];
};

interface BackgroundSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  selectedBackground: string;
  onSelectBackground: (backgroundPath: string) => void;
}

export default function BackgroundSelectionModal({
  isOpen,
  onClose,
  character,
  selectedBackground,
  onSelectBackground,
}: BackgroundSelectionModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userBackgrounds, setUserBackgrounds] = useState<UserBackground[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 사용자 배경 이미지들 로드
  const loadUserBackgrounds = async () => {
    setIsLoading(true);
    try {
      const backgrounds = await getUserBackgrounds();
      setUserBackgrounds(backgrounds);
    } catch (error) {
      console.error("Error loading backgrounds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadBackgroundImage(file);
      if (publicUrl) {
        await loadUserBackgrounds(); // 목록 새로고침
        onSelectBackground(publicUrl); // 바로 배경으로 적용
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
      // input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 배경 삭제 핸들러
  const handleDeleteBackground = async (backgroundId: string) => {
    try {
      const success = await deleteBackgroundImage(backgroundId);
      if (success) {
        await loadUserBackgrounds(); // 목록 새로고침
      } else {
        alert("Delete failed.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed.");
    }
  };

  // 모달이 열릴 때 배경 이미지들 로드
  useEffect(() => {
    if (isOpen) {
      loadUserBackgrounds();
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Select Background
          </h3>
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
          <div className="space-y-4">
            {/* Character Backgrounds Section */}
            <div>
              <h4 className="text-white font-medium mb-3 text-sm">
                Default Scenes
              </h4>
              <div className="space-y-3">
                {getCharacterBackgrounds(character.id).map((background) => (
                  <div
                    key={background.id}
                    className="relative cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden transition-all duration-200 group"
                    onClick={() => onSelectBackground(background.path)}
                  >
                    <div className="aspect-video">
                      <Image
                        src={background.path}
                        alt={background.path}
                        width={400}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedBackground === background.path && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Upload Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium text-sm">
                  Custom Backgrounds
                </h4>
                {isLoading && (
                  <span className="text-white/60 text-xs">Loading...</span>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload New Background
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* User Backgrounds Grid */}
              {userBackgrounds.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {userBackgrounds.map((background) => (
                    <div
                      key={background.id}
                      className="relative aspect-video bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 group"
                      onClick={() => onSelectBackground(background.public_url)}
                    >
                      <Image
                        src={background.public_url}
                        alt="User background"
                        width={200}
                        height={112}
                        className="w-full h-full object-cover"
                      />

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBackground(background.id);
                        }}
                        className="absolute top-1 right-1 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        title="Delete background"
                      >
                        <svg
                          className="w-3 h-3"
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

                      {/* Selected Indicator */}
                      {selectedBackground === background.public_url && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal을 사용하여 body에 모달 렌더링
  return createPortal(modalContent, document.body);
}
