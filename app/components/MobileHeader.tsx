"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";

interface MobileHeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
  onSelectSession: (id: string) => void;
}

export default function MobileHeader({ onMenuToggle, isMenuOpen, onSelectSession }: MobileHeaderProps) {
  const router = useRouter();
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#F3F2EC] dark:bg-[#393E46] border-b border-gray-300 dark:border-gray-600 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Menu button */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <button 
          onClick={() => {
            onSelectSession("");
            router.push("/");
          }}
          className="text-lg font-bold tracking-wide uppercase bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] bg-clip-text text-transparent hover:from-[#6B8A95] hover:to-[#4A6A75] transition-all duration-200 cursor-pointer"
        >
          GUIDE-ME-AI
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </div>
  );
}
