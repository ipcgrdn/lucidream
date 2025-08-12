"use client";

import { useState, useEffect, useRef } from "react";
import { DockIcon, Dock } from "@/components/ui/dock";
import Image from "next/image";
import { PanelLeftDashed, PanelRightDashed, Heart } from "lucide-react";
import AffectionBar from "@/components/ui/affection-bar";
import { AffectionSystem } from "@/lib/affection";

interface ChatNavbarProps {
  onBackClick: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  onProfileClick: () => void;
  userAvatarUrl?: string;
  affectionPoints?: number;
  isProfileDropdownOpen?: boolean;
  onSignOut?: () => void;
}

export default function ChatNavbar({
  onBackClick,
  onLeftMenuClick,
  onRightMenuClick,
  onProfileClick,
  userAvatarUrl,
  affectionPoints,
  isProfileDropdownOpen,
  onSignOut,
}: ChatNavbarProps) {
  const [isAffectionDropdownOpen, setIsAffectionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 현재 호감도 레벨 계산
  const currentLevel = AffectionSystem.calculateLevel(affectionPoints || 0);

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAffectionDropdownOpen(false);
      }
    };

    if (isAffectionDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAffectionDropdownOpen]);

  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-50" ref={dropdownRef}>
      <nav>
        <Dock iconSize={44} iconMagnification={60}>
          {/* 이전 버튼 */}
          <DockIcon onClick={onBackClick}>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </DockIcon>

          {/* 왼쪽 메뉴 */}
          <DockIcon onClick={onLeftMenuClick}>
            <PanelLeftDashed />
          </DockIcon>

          {/* 호감도 하트 아이콘 (중앙) */}
          <DockIcon
            onClick={() => setIsAffectionDropdownOpen(!isAffectionDropdownOpen)}
          >
            <div className="relative">
              <Heart
                className={`w-6 h-6 ${
                  affectionPoints && affectionPoints >= 500
                    ? "text-red-400 fill-red-400"
                    : "text-pink-400"
                } transition-colors duration-300 ${
                  isAffectionDropdownOpen ? "animate-pulse" : ""
                }`}
              />
            </div>
          </DockIcon>

          {/* 오른쪽 메뉴 (채팅) */}
          <DockIcon onClick={onRightMenuClick}>
            <PanelRightDashed />
          </DockIcon>

          {/* 사용자 프로필 */}
          <DockIcon onClick={onProfileClick}>
            {userAvatarUrl ? (
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={userAvatarUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </DockIcon>
        </Dock>
      </nav>

      {/* 호감도 드롭다운 */}
      {isAffectionDropdownOpen && (
        <div
          className={`
            mt-4 min-w-sm transform transition-all duration-300 ease-in-out
            ${
              isAffectionDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-[-10px]"
            }
          `}
        >
          <AffectionBar points={affectionPoints} animate={true} />
        </div>
      )}

      {/* 프로필 드롭다운 */}
      {isProfileDropdownOpen && (
        <div
          className={`
            mt-4 w-40 bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden ml-auto
            ${
              isProfileDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-[-10px]"
            }
          `}
        >
          <div className="py-1 font-orbitron">
            <button
              onClick={() => {
                // TODO: 구독 관리 페이지로 이동 또는 모달 열기
                console.log("구독 관리 클릭");
              }}
              className="w-full px-4 py-2 text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm"
            >
              Manage Subscription
            </button>
            <button
              onClick={() => {
                onSignOut?.();
              }}
              className="w-full px-4 py-2 text-left text-white/90 hover:text-white hover:bg-white/10 transition-colors duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
