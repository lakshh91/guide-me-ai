import { v4 as uuid } from "uuid";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const sessions: ChatSession[] = [];

// Create new chat
export function createSession(): ChatSession {
  const session: ChatSession = {
    id: uuid(),
    title: "New Chat",
    messages: [],
    createdAt: new Date(),
  };
  sessions.unshift(session);
  return session;
}

// Get all sessions
export function getSessions(): ChatSession[] {
  return sessions;
}

// Get single session
export function getSession(id: string): ChatSession | undefined {
  return sessions.find((s) => s.id === id);
}

// Add message to session
export function addMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  const session = getSession(sessionId);
  if (session) {
    session.messages.push({ role, content });
    if (session.title === "New Chat" && role === "user") {
      session.title = content.slice(0, 30) + "...";
    }
  }
}
