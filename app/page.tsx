"use client";

import Navbar from "@/components/main/Navbar";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSlideStart = () => {
    setIsDragging(true);
  };

  const handleSlideMove = (clientX: number) => {
    if (!isDragging || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const maxSlide = rect.width - 52;
    const newPosition = Math.max(
      0,
      Math.min(clientX - rect.left - 26, maxSlide)
    );
    setSlidePosition(newPosition);
  };

  const handleSlideEnd = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const maxSlide = rect.width - 52;

    if (slidePosition > maxSlide * 0.8) {
      setSlidePosition(maxSlide);
      setTimeout(() => {
        router.push("/auth");
      }, 300);
    } else {
      setSlidePosition(0);
    }

    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        playsInline
        preload="metadata"
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
      >
        <source src="/video/girl2.mp4" type="video/mp4" />
      </video>

      <Navbar />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-8 overflow-auto">
        <div className="mb-2">
          <Image
            src="/logo.png"
            alt="LucidDream Logo"
            width={128}
            height={128}
            priority
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-orbitron mb-4 text-white">
          Dive into dreams
        </h1>

        <p className="text-md md:text-xl mb-8 max-w-2xl text-gray-200 font-orbitron leading-relaxed">
          Experience your first meeting with an AI avatar
        </p>

        <div
          ref={buttonRef}
          className="relative w-64 h-14 bg-gradient-to-r from-slate-200/20 via-white/10 to-slate-300/20 backdrop-blur-xl rounded-full border border-white/30 shadow-2xl overflow-hidden cursor-pointer select-none"
          onMouseDown={handleSlideStart}
          onMouseMove={(e) => handleSlideMove(e.clientX)}
          onMouseUp={handleSlideEnd}
          onMouseLeave={handleSlideEnd}
          onTouchStart={handleSlideStart}
          onTouchMove={(e) => handleSlideMove(e.touches[0].clientX)}
          onTouchEnd={handleSlideEnd}
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-orbitron pl-6">
            <span
              className={`transition-opacity duration-300 ${
                slidePosition > 50 ? "opacity-50" : "opacity-100"
              }`}
            >
              Swipe to Enter
            </span>
          </div>

          <div
            className="absolute top-1 left-1 w-12 h-12 bg-gradient-to-r from-white/90 to-slate-100/90 rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${slidePosition}px)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
          >
            <svg
              className="w-6 h-6 text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full transition-opacity duration-300"
            style={{
              opacity:
                slidePosition > 0 ? Math.min(slidePosition / 200, 0.6) : 0,
            }}
          />
        </div>

        {/* Footer Section */}
        <div className="absolute bottom-[-40px] left-0 right-0 text-center">
          <div className="flex justify-center space-x-4 text-sm text-white/50 mb-6">
            <button
              className="hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => router.push("/privacy")}
            >
              Privacy Policy
            </button>
            <button
              className="hover:text-white transition-colors duration-200 cursor-pointer"
              onClick={() => router.push("/terms")}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
