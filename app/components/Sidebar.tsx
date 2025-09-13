"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import AuthButton from "./AuthButton";

interface SidebarProps {
  onSelectSession: (id: string) => void;
  onNewSession: (id: string) => void;
  activeSessionId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  refreshTrigger?: number; // Add this to trigger refresh
}

type Session = { id: string; title: string };

export default function Sidebar({ onSelectSession, onNewSession, activeSessionId, isOpen = true, onClose, refreshTrigger }: SidebarProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  // Refresh sessions when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchSessions();
    }
  }, [refreshTrigger]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data: Session[] = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
      setSessions([]);
    }
  };

  const handleNew = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", text);
        return alert("Failed to create session");
      }

      const created: Session = await res.json();
      setSessions((prev) => [created, ...prev]);
      onNewSession(created.id);
    } catch (err) {
      console.error(err);
      alert("Unexpected error creating session");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string) => {
    setOpenMenuId(null); // Close menu
    const newTitle = prompt("Enter new chat title:");
    if (!newTitle) return;

    try {
      const res = await fetch("/api/sessions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to rename session");

      const updated: Session = await res.json();
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err) {
      console.error(err);
      alert("Failed to rename session");
    }
  };

  const handleDelete = async (id: string) => {
    setOpenMenuId(null); // Close menu
    if (!confirm("Are you sure you want to delete this chat permanently?")) return;

    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) onSelectSession("");
    } catch (err) {
      console.error(err);
      alert("Failed to delete session");
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 bg-[#DCDCDC] dark:bg-[#232931] h-screen overflow-y-auto border-r border-gray-300 dark:border-gray-600 rounded-tr-2xl rounded-br-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-4 mb-3 flex justify-between items-center">
        <button 
          onClick={() => {
            onSelectSession("");
            router.push("/");
          }}
          className="text-sm font-bold tracking-wide uppercase bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] bg-clip-text text-transparent hover:from-[#6B8A95] hover:to-[#4A6A75] transition-all duration-200 cursor-pointer"
        >
          GUIDE-ME-AI
        </button>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton />
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Centered New Chat button */}
      <div className="flex justify-center px-4 mb-3">
        <button
          onClick={handleNew}
          disabled={loading}
          className={`w-1/2 py-1.5 text-sm rounded-lg font-semibold transition-all duration-200 ${
            loading 
              ? "bg-gray-300 dark:bg-[#232931] text-gray-600 dark:text-gray-400" 
              : "bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] hover:from-[#6B8A95] hover:to-[#4A6A75] text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          }`}
        >
          {loading ? "Creating..." : " New Chat"}
        </button>
      </div>

      <ul>
        {sessions.map((s) => (
          <li
            key={s.id}
            className={`w-full py-1.5 flex justify-between items-center cursor-pointer transition-colors relative ${
              activeSessionId === s.id
                ? "bg-[#DCDCDC] dark:bg-[#232931] border border-black dark:border-gray-400 rounded-lg text-gray-900 dark:text-gray-100"
                : "text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            onClick={() => onSelectSession(s.id)}
          >
            <span className="truncate mr-2 flex-1 pl-4">{s.title}</span>
            
            {/* Horizontal 3-dot menu button */}
            <button
              className="flex-shrink-0 p-1 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors mr-4"
              onClick={(e) => toggleMenu(e, s.id)}
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM14 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {openMenuId === s.id && (
              <div className="absolute right-2 top-8 bg-white dark:bg-[#232931] border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRename(s.id);
                  }}
                >
                  Rename
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s.id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      </div>
    </>
  );
}