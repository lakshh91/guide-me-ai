"use client";

import React from 'react';
import MessageList, { Message } from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
  onSend: (text: string) => void;
}

const ChatWindow = ({ messages, isTyping, onSend }: ChatWindowProps) => {
  return (
    <div className="flex flex-col h-[70vh] border rounded-lg shadow-lg p-4">
      <MessageList messages={messages} />
      {isTyping && (
        <div className="text-sm text-gray-500 mb-2">Counselor is typing…</div>
      )}
      <MessageInput onSend={onSend} />
    </div>
  );
};

export default ChatWindow;
