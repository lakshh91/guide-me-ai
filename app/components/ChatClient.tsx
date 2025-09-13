"use client";

import { useState, useEffect } from "react";
import ChatWindow from "./ChatWindow";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatClient({ activeSessionId }: { activeSessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing messages when session changes
  useEffect(() => {
    async function loadSessionMessages() {
      if (!activeSessionId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/sessions/${activeSessionId}`);
        
        if (response.ok) {
          const sessionData = await response.json();
          // Convert database messages to component format
          const loadedMessages: Message[] = sessionData.messages.map((msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));
          setMessages(loadedMessages);
        } else {
          console.error("Failed to load session messages");
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading session messages:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }

    loadSessionMessages();
  }, [activeSessionId]);

  // 🚀 This is the onSend we connect to ChatWindow
  async function onSend(message: string, onStreamUpdate: (chunk: string) => void) {
    // show user message instantly
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    // call API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSessionId,
        message,
      }),
    });

    if (!res.body) {
      console.error("No response body");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantReply = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      assistantReply += chunk;
      onStreamUpdate(chunk); // pass chunk to ChatWindow
    }

    // push final assistant reply into state
    setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <ChatWindow
      messages={messages}
      onSend={onSend}
    />
  );
}
