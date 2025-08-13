"use client";

import Navbar from "@/components/main/Navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Service() {
  const router = useRouter();

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />

      <div className="flex flex-col items-center justify-center h-full text-center py-8 mt-20">
        {/* Hero Content */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="LucidDream Logo"
            width={96}
            height={96}
            priority
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-orbitron mb-6 text-white">
          Meet AI Avatars
          <br />
          That Come Alive
        </h1>

        <p className="text-lg md:text-xl mb-12 max-w-3xl text-gray-200 font-orbitron leading-relaxed">
          Experience real-time conversations with 3D anime characters.
          <br />
          Watch them react, move, and express emotions as you talk.
        </p>

        {/* CTA */}
        <div className="flex flex-col mb-12 sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push("/auth")}
            className="bg-white text-black px-8 py-4 rounded-xl font-orbitron font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            Try Now Free
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="border border-white/30 text-white px-8 py-4 rounded-xl font-orbitron font-semibold hover:bg-white/10 transition-all duration-300"
          >
            View Characters
          </button>
        </div>

        {/* Content Navigation */}
        <div className="mb-12 flex items-center max-w-4xl w-full">
          {/* Main Content Area */}
          <div className="flex-1 rounded-2xl border border-white/20 p-4">
            <div className="aspect-[16/9] rounded-xl flex items-center justify-center max-w-4xl mx-auto">
              <video
                src="/video/demo.mp4"
                autoPlay
                muted
                loop
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          <div className="rounded-xl p-6 border border-white/20 text-center">
            <div className="w-8 h-8 mb-3 text-white mx-auto">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-white font-orbitron font-semibold mb-2">
              Live Animations
            </h3>
            <p className="text-white/70 text-sm">
              Characters move and express emotions based on conversation
            </p>
          </div>

          <div className="rounded-xl p-6 border border-white/20 text-center">
            <div className="w-8 h-8 mb-3 text-white mx-auto">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-white font-orbitron font-semibold mb-2">
              Natural Chat
            </h3>
            <p className="text-white/70 text-sm">
              Talk naturally with AI that understands context
            </p>
          </div>

          <div className="rounded-xl p-6 border border-white/20 text-center">
            <div className="w-8 h-8 mb-3 text-white mx-auto">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="text-white font-orbitron font-semibold mb-2">
              Voice Interaction
            </h3>
            <p className="text-white/70 text-sm">
              Speak and listen to your AI avatar companions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
