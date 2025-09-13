import React from 'react';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface Message {
  id: string;
  sender: 'user' | 'counselor';
  text: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  isDark?: boolean;
}

const MessageList = ({ messages, isDark = false }: MessageListProps) => (
  <div className="flex-1 overflow-y-auto mb-4 space-y-3 px-1 sm:px-2">
    {messages.map((msg) => (
      <div
        key={msg.id}
        className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl shadow-sm border ${
          msg.sender === 'user'
            ? 'ml-auto bg-blue-600 text-white border-blue-500'
            : 'mr-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600'
        }`}
      >
        {msg.sender === 'user' ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{msg.text}</p>
        ) : (
          <MarkdownRenderer content={msg.text} isDark={isDark} />
        )}
      </div>
    ))}
  </div>
);

export type { Message };
export default MessageList;
