"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (status === "loading") {
    return (
      <div className="p-1.5 rounded-md bg-gradient-to-r from-[#7E99A3]/60 to-[#5A7A85]/60 shadow-lg">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 p-1.5 rounded-md bg-gradient-to-r from-[#7E99A3]/60 to-[#5A7A85]/60 hover:from-[#6B8A95]/70 hover:to-[#4A6A75]/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          aria-label="User menu"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={20}
              height={20}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
            </div>
          )}
          <svg 
            className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 bg-white dark:bg-[#232931] border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-[200px]">
            <div className="p-3 border-b border-gray-200 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session.user?.email}
              </p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="p-1.5 rounded-md bg-gradient-to-r from-[#7E99A3]/60 to-[#5A7A85]/60 hover:from-[#6B8A95]/70 hover:to-[#4A6A75]/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      aria-label="Sign in"
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    </button>
  );
}
