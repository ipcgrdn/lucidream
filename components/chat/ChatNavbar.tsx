"use client";

interface ChatNavbarProps {
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
}

export default function ChatNavbar({
  onLeftMenuClick,
  onRightMenuClick,
}: ChatNavbarProps) {
  return (
    <nav className="absolute top-0 left-0 w-full z-50 p-4">
      <div className="flex justify-between items-center">
        <button
          onClick={onLeftMenuClick}
          className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
          aria-label="Left menu"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <button
          onClick={onRightMenuClick}
          className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
          aria-label="Right menu"
        >
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
