"use client";

import { useState } from "react";
import { Character } from "@/lib/characters";

interface TransformationSectionProps {
  character?: Character;
  onTransformationChange?: (modelPath: string) => void;
}

export default function TransformationSection({
  character,
  onTransformationChange,
}: TransformationSectionProps) {
  const [selectedTransformation, setSelectedTransformation] =
    useState<string>("default");

  if (
    !character ||
    !character.hasTransformation ||
    !character.transformationOptions
  ) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/50">No transformation options available</p>
      </div>
    );
  }

  const handleTransformationChange = (transformation: string) => {
    setSelectedTransformation(transformation);

    // 모델 경로 생성
    let modelPath = character.vrmModel;

    if (transformation !== "default") {
      // 기본 모델 경로에서 확장자를 제거하고 transformation을 추가
      const baseModelPath = character.vrmModel.replace(".vrm", "");
      modelPath = `${baseModelPath}-${transformation}.vrm`;
    }

    onTransformationChange?.(modelPath);
  };

  return (
    <div className="h-full overflow-y-auto mb-4">
      {/* Transformation 옵션들 */}
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
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v7zM9 5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V5z"
            />
          </svg>
          Outfits
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {character.transformationOptions.map((transformation, index) => (
            <button
              key={transformation}
              onClick={() => handleTransformationChange(transformation)}
              className={`
                relative p-3 rounded-xl transition-all duration-300 border
                ${
                  selectedTransformation === transformation
                    ? "bg-white/20 border-white/30 text-white shadow-lg"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Transformation 아이콘 */}
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v7z"
                    />
                  </svg>
                </div>

                {/* Transformation 이름 */}
                <span className="text-sm font-medium capitalize">
                  {transformation}
                </span>
              </div>

              {/* 선택 표시 */}
              {selectedTransformation === transformation && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
