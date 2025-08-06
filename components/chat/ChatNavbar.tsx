"use client";

import { DockIcon, Dock } from "@/components/ui/dock";
import Image from "next/image";
import { PanelLeftDashed, PanelRightDashed } from "lucide-react";

interface ChatNavbarProps {
  onBackClick: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  onProfileClick: () => void;
  userAvatarUrl?: string;
}

export default function ChatNavbar({
  onBackClick,
  onLeftMenuClick,
  onRightMenuClick,
  onProfileClick,
  userAvatarUrl,
}: ChatNavbarProps) {
  return (
    <nav className="absolute left-1/2 -translate-x-1/2 z-50">
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
  );
}
