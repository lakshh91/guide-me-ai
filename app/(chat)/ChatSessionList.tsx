"use client";

import React from 'react';
import { ChatSession, listSessions, createSession, renameSession, deleteSession } from '@/utils/chatStore';

interface ChatSessionListProps {
  selectedId?: string;
  onSelect: (sessionId: string) => void;
}

export default function ChatSessionList({ selectedId, onSelect }: ChatSessionListProps) {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);

  const refresh = React.useCallback(() => {
    setSessions(listSessions());
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleNew = () => {
    const s = createSession('New Chat');
    setSessions((prev) => [s, ...prev]);
    onSelect(s.id);
  };

  const handleRename = (id: string) => {
    const title = prompt('Rename chat to:');
    if (!title) return;
    renameSession(id, title);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this chat?')) return;
    deleteSession(id);
    refresh();
    if (id === selectedId && sessions.length) {
      onSelect(sessions[0].id);
    }
  };

  return (
    <div className="w-full sm:w-72 border-r p-4 overflow-y-auto bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Chats</h2>
        <button onClick={handleNew} className="text-sm bg-blue-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-blue-700 active:bg-blue-800">New</button>
      </div>
      <div className="space-y-1">
        {sessions.map((s) => (
          <div key={s.id} className={`flex items-center justify-between group rounded-lg ${selectedId === s.id ? 'bg-blue-50' : ''}`}>
            <button
              className="flex-1 text-left p-2.5 hover:bg-gray-100 rounded-lg"
              onClick={() => onSelect(s.id)}
            >
              <div className="truncate font-medium text-gray-900">{s.title || 'Untitled'}</div>
              <div className="text-xs text-gray-500">{new Date(s.updatedAt).toLocaleString()}</div>
            </button>
            <div className="opacity-0 group-hover:opacity-100 transition mr-2">
              <button className="text-xs text-gray-600 mr-3 hover:underline" onClick={() => handleRename(s.id)}>Rename</button>
              <button className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(s.id)}>Delete</button>
            </div>
          </div>
        ))}
        {!sessions.length && <div className="text-sm text-gray-500">No chats yet. Create a new one.</div>}
      </div>
    </div>
  );
}
