"use client";

interface LeftCardProps {
  isOpen: boolean;
}

export default function LeftCard({ isOpen }: LeftCardProps) {
  return (
    <div
      className={`
      fixed left-6 top-1/2 -translate-y-1/2 h-[70%] w-120 
      bg-white/5 backdrop-blur-xl border border-white/10 rounded-4xl shadow-2xl
      transform transition-all duration-500 ease-out z-40
      ${isOpen ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"}
      before:absolute before:inset-0 before:rounded-2xl 
      before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent
      before:backdrop-blur-xl
    `}
    >
      <div className="relative h-full p-6 flex flex-col">
        {/* Content will be added later */}
      </div>
    </div>
  );
}
