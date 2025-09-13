"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatClient({ activeSessionId }: { activeSessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);

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

  return (
    <ChatWindow
      activeSessionId={activeSessionId}
      messages={messages}
      onSend={onSend}
    />
  );
}
