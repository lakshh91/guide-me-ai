"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

type Message = {
  role: "user" | "assistant";
  content: string;
};


export default function ChatPage() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fetch messages when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/sessions/${activeSessionId}/messages`);
        const data = await res.json();
        setMessages(data);
      } catch {
        setMessages([]);
      }
    })();
  }, [activeSessionId]);

  const handleSend = async (
    userMsg: string,
    onStreamUpdate: (chunk: string) => void
  ) => {
    // Add user's message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Call backend
    const res = await fetch(`/api/sessions/${activeSessionId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });

    // Assume backend returns full assistant text
    const data = await res.json();

    // If streaming, update chunks
    if (data.stream) {
      for (const chunk of data.stream) {
        onStreamUpdate(chunk);
      }
    }

    // Append final assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        activeSessionId={activeSessionId ?? undefined}
        onSelectSession={setActiveSessionId}
        onNewSession={setActiveSessionId}
      />

      <div className="flex-1">
        {activeSessionId ? (
          <ChatWindow
            messages={messages}
            onSend={handleSend}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            Select or create a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
