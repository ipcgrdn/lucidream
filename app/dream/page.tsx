"use client";

import { Carousel } from "@/components/ui/carousel";
import { useAuth } from "@/contexts/Authcontext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllCharacters } from "@/lib/characters";
import {
  getUserCustomCharacters,
  CustomCharacter,
} from "@/lib/custom_character";
import RecentModal from "@/components/modal/RecentModal";
import PricingModal from "@/components/modal/PricingModal";
import Link from "next/link";
import Image from "next/image";

const characters = getAllCharacters();

const characterData = [
  ...characters.map((char) => ({
    id: char.id,
    title: char.name,
    description: char.description,
    button: `Meet ${char.name}`,
    src: char.previewImage,
  })),
];

// Custom models data with create button as first item
const baseCustomCharacterData = [
  {
    id: "create-new",
    title: "Custom Character",
    description:
      "Design your own unique character with custom personality and appearance",
    button: "Create New",
    src: "create",
  },
];

export default function Dream() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [customCharacters, setCustomCharacters] = useState<CustomCharacter[]>(
    []
  );
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Load custom characters when user is authenticated
  useEffect(() => {
    const loadCustomCharacters = async () => {
      if (user?.id) {
        const characters = await getUserCustomCharacters(user.id);
        setCustomCharacters(characters);
      }
    };

    if (!loading && !user) {
      router.push("/auth");
    } else if (user?.id) {
      loadCustomCharacters();
    }
  }, [user, loading, router]);

  // 프로필 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Combine base custom character data with user's custom characters
  const customCharacterData = [
    ...baseCustomCharacterData,
    ...customCharacters.map((char) => ({
      id: char.id,
      title: char.name,
      description: char.description,
      button: `Meet ${char.name}`,
      src: char.preview_image_url,
    })),
  ];

  return (
    <div className="min-h-screen">
      {/* Dream Navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center justify-between min-w-xs md:min-w-xl px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow shadow-black/10">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Lucidream Logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-white text-xl font-orbitron font-medium tracking-tight hidden md:block">
              lucidream
            </span>
          </Link>

          <div className="flex items-center font-orbitron space-x-6">
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Upgrade
            </button>
            <button
              onClick={() => setIsRecentModalOpen(true)}
              className="text-white/80 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Recent
            </button>
            <Link
              href="https://discord.gg/lucidream"
              target="_blank"
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.438a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
              </svg>
            </Link>
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
              >
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white text-xs font-medium">
                    {user?.user_metadata?.name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </span>
                )}
              </button>

              {/* 프로필 드롭다운 */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-4 w-40 bg-black/50 backdrop-blur-lg border border-white/20 rounded-lg overflow-hidden">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        // TODO: 구독 관리 페이지로 이동 또는 모달 열기
                        console.log("구독 관리 클릭");
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 text-sm"
                    >
                      Manage Subscription
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen pt-28 md:pt-32 pb-20 px-4">
        {/* Default Models Section */}
        <section className="mb-20">
          <Carousel slides={characterData} userId={user?.id || ""} />
        </section>

        {/* Section Divider */}
        <div className="flex items-center justify-center mb-20">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Custom Models Section */}
        <section>
          <Carousel slides={customCharacterData} userId={user?.id || ""} />
        </section>
      </main>

      {/* Recent Modal */}
      <RecentModal
        isOpen={isRecentModalOpen}
        onClose={() => setIsRecentModalOpen(false)}
        userId={user?.id || ""}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}
