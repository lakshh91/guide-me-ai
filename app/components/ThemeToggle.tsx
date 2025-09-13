"use client";

import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  console.log("Current theme:", theme); // Debug log

  return (
    <button
      onClick={() => {
        console.log("Toggle clicked, current theme:", theme); // Debug log
        toggleTheme();
        console.log("Theme toggled, new theme should be:", theme === "light" ? "dark" : "light");
      }}
      className="p-1.5 rounded-md bg-gradient-to-r from-[#7E99A3]/60 to-[#5A7A85]/60 hover:from-[#6B8A95]/70 hover:to-[#4A6A75]/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        // Moon icon for dark mode
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}