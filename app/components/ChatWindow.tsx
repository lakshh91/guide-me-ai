"use client";

import { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  messages: Message[];
  onSend: (message: string, onStreamUpdate: (chunk: string) => void) => Promise<void> | void;
};

export default function ChatWindow({ messages, onSend }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [streamingReply, setStreamingReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or streaming reply updates
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streamingReply]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setStreamingReply("");
    setIsTyping(true);

    // ✅ Call onSend with a streaming callback
    try {
      await onSend(userMsg, (chunk: string) => {
        setStreamingReply((prev) => prev + chunk);
      });
    } finally {
      setIsTyping(false);
    }

    // ✅ Parent is responsible for appending final assistant message
    setStreamingReply("");
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F2EC] dark:bg-[#393E46] text-gray-900 dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-2 sm:px-4 lg:px-6">
        {/* Conversation area */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 scrollbar-thin scrollbar-track-[#F3F2EC] dark:scrollbar-track-[#393E46] scrollbar-thumb-[#DCDCDC] dark:scrollbar-thumb-[#232931] scrollbar-thumb-rounded-full"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#DCDCDC #F3F2EC'
          }}
        >
          <div className="mx-auto w-full py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : ""}`}>
                <div className={`flex gap-2 sm:gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                    <div
                      className={`h-full w-full flex items-center justify-center text-[10px] sm:text-xs ${
                        m.role === "user" 
                          ? "bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] text-white" 
                          : "bg-[#DCDCDC] dark:bg-[#232931] text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {m.role === "user" ? "U" : "AI"}
                    </div>
                  </div>
                  {/* Message bubble */}
                  <div
                    className={`flex-1 rounded-xl px-3 py-2 text-sm sm:text-base leading-relaxed shadow-sm border ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-[#7E99A3]/20 to-[#5A7A85]/20 border-[#7E99A3]/30 dark:border-[#5A7A85]/30 text-gray-900 dark:text-gray-100 whitespace-pre-wrap"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <MarkdownRenderer content={m.content} isDark={true} />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator before first chunk */}
            {isTyping && !streamingReply && (
              <div className="flex w-full gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                  <div className="h-full w-full flex items-center justify-center text-[10px] sm:text-xs bg-[#DCDCDC] dark:bg-[#232931] text-gray-800 dark:text-gray-200">
                    AI
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-xl px-3 py-2 shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400 opacity-80 animate-bounce [animation-delay:0ms]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400 opacity-80 animate-bounce [animation-delay:120ms]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500 dark:bg-gray-400 opacity-80 animate-bounce [animation-delay:240ms]"></span>
                </div>
              </div>
            )}

            {/* User typing preview */}
            {input.trim() && (
              <div className="flex w-full justify-end">
                <div className="flex gap-2 sm:gap-3 max-w-[80%]">
                  <div className="flex-1 rounded-xl px-3 py-2 text-sm sm:text-base leading-relaxed whitespace-pre-wrap shadow-sm border bg-gradient-to-r from-[#7E99A3]/20 to-[#5A7A85]/20 border-[#7E99A3]/30 dark:border-[#5A7A85]/30 text-gray-900 dark:text-gray-100 opacity-70">
                    {input}
                    <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500 dark:bg-blue-400 align-middle"></span>
                  </div>
                  <div className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                    <div className="h-full w-full flex items-center justify-center text-[10px] sm:text-xs bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] text-white">
                      U
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Streaming assistant reply */}
            {streamingReply && (
              <div className="flex w-full gap-2 sm:gap-3">
                <div className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500">
                  <div className="h-full w-full flex items-center justify-center text-[10px] sm:text-xs bg-[#DCDCDC] dark:bg-[#232931] text-gray-800 dark:text-gray-200">
                    AI
                  </div>
                </div>
                <div className="flex-1 rounded-xl px-3 py-2 text-sm sm:text-base leading-relaxed shadow-sm border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                  <MarkdownRenderer content={streamingReply} isDark={true} />
                  <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gray-500 dark:bg-gray-400 align-middle"></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky input */}
        <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-[#F3F2EC] via-[#F3F2EC]/80 to-transparent dark:from-[#393E46] dark:via-[#393E46]/80 px-2 sm:px-4 lg:px-6 pb-4 pt-3">
          <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-3xl">
            <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
              <textarea
                className="w-full resize-none bg-transparent p-3 text-sm sm:text-base outline-none placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                value={input}
                placeholder="Send a message..."
                rows={1}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.dispatchEvent(
                      new Event("submit", { cancelable: true, bubbles: true })
                    );
                  }
                }}
              />
              <div className="flex items-center justify-between px-3 pb-2">
                <div className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                  Press Enter to send • Shift+Enter for new line
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 sm:hidden">
                  Enter to send
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] hover:from-[#6B8A95] hover:to-[#4A6A75] px-3 py-1.5 text-sm text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}