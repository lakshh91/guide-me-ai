export type Sender = 'user' | 'counselor';

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const STORAGE_KEY = 'gm.chat.sessions.v1';

function readAll(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function createSession(title = 'New Chat'): ChatSession {
  const sessions = readAll();
  const id = Math.random().toString(36).slice(2);
  const session: ChatSession = { id, title, messages: [], updatedAt: Date.now() };
  const next = [session, ...sessions];
  writeAll(next);
  return session;
}

export function listSessions(): ChatSession[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSession(id: string): ChatSession | undefined {
  return readAll().find((s) => s.id === id);
}

export function appendMessage(sessionId: string, message: ChatMessage): ChatSession | undefined {
  const sessions = readAll();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return undefined;
  const updated: ChatSession = {
    ...sessions[idx],
    messages: [...sessions[idx].messages, message],
    updatedAt: Date.now(),
  };
  sessions[idx] = updated;
  writeAll(sessions);
  return updated;
}

export function renameSession(sessionId: string, title: string): ChatSession | undefined {
  const sessions = readAll();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return undefined;
  sessions[idx] = { ...sessions[idx], title, updatedAt: Date.now() };
  writeAll(sessions);
  return sessions[idx];
}

export function deleteSession(sessionId: string) {
  const sessions = readAll().filter((s) => s.id !== sessionId);
  writeAll(sessions);
}
