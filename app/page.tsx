"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import MobileHeader from "./components/MobileHeader";
import ProtectedRoute from "./components/ProtectedRoute";

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; id?: string; createdAt?: Date }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  async function loadSession(id: string) {
    // If id is empty (e.g., after deletion), clear UI immediately
    if (!id) {
      setSessionId(null);
      setMessages([]);
      return;
    }
    setSessionId(id);
    // Close sidebar on mobile when selecting a session
    setIsSidebarOpen(false);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const session = await res.json();
      setMessages(session?.messages || []);
    } catch {
      setMessages([]);
    }
  }

  async function handleSend(msg: string, onStreamUpdate: (chunk: string) => void) {
    if (!sessionId) return;

    // Show user's message immediately
    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: msg }),
    });

    if (!res.body) {
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
      onStreamUpdate(chunk);
    }

    // Append assistant message at the end
    setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
  }

  return (
    <ProtectedRoute>
      <div className="flex bg-[#F3F2EC] dark:bg-[#393E46] text-gray-900 dark:text-gray-100 min-h-screen">
        {/* Mobile Header */}
        <MobileHeader 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isMenuOpen={isSidebarOpen}
          onSelectSession={(id) => loadSession(id)}
        />
        
        {/* Sidebar */}
        <Sidebar
          activeSessionId={sessionId ?? undefined}
          onSelectSession={(id) => loadSession(id)}
          onNewSession={(id) => loadSession(id)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          refreshTrigger={refreshTrigger}
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-0 ml-0 pt-16 lg:pt-0">
          {sessionId ? (
            <ChatWindow
              messages={messages as { role: "user" | "assistant"; content: string; id?: string; createdAt?: Date }[]}
              onSend={handleSend}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-start min-h-screen lg:min-h-screen pt-20">
              <div className="text-center px-6">
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] bg-clip-text text-transparent font-dosis-bold">make your</div>
                  <div className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-[#4C585B] to-[#5C7285] bg-clip-text text-transparent font-dosis-bold">Career Bright</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] bg-clip-text text-transparent">with</div>
                  <div className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-[#4C585B] to-[#5C7285] bg-clip-text text-transparent font-dosis-bold">Guide-Me-AI</div>
                </div>
                <div className="mt-8">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/sessions", { method: "POST" });
                        if (!res.ok) {
                          const text = await res.text();
                          console.error("API error:", text);
                          return alert("Failed to create session");
                        }

                        const created = await res.json();
                        loadSession(created.id);
                        // Trigger sidebar refresh
                        setRefreshTrigger(prev => prev + 1);
                      } catch (err) {
                        console.error(err);
                        alert("Unexpected error creating session");
                      }
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] text-white font-semibold rounded-lg hover:from-[#6B8A95] hover:to-[#4A6A75] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    New Chat
                  </button>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Start a new chat to begin your career journey</p>
                
                {/* Features Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
                  <div className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Personalized Career Path</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get tailored career guidance based on your unique goals and aspirations</p>
                    </div>
                  </div>

                  <div className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Skill Development</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Identify and develop the skills needed for your dream career</p>
                    </div>
                  </div>

                  <div className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Personal Growth</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enhance your confidence and professional development journey</p>
                    </div>
                  </div>

                  <div className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Job & Resume Assistant</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get help with job applications, resume building, and interview prep</p>
                    </div>
                  </div>

                  <div className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">24/7 Available</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Access career guidance anytime, anywhere with round-the-clock support</p>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] bg-clip-text text-transparent mb-12">Why Choose Guide-Me-AI?</h2>
                  <div className="space-y-0">
                    {[
                      {
                        question: "How does AI-powered career guidance work?",
                        answer: "Our advanced AI technology analyzes your unique goals, skills, and interests to provide personalized career advice. It understands your specific situation and offers tailored recommendations for career paths, skill development, and professional growth opportunities.",
                        icon: "M13 10V3L4 14h7v7l9-11h-7z"
                      },
                      {
                        question: "Is the service available 24/7?",
                        answer: "Yes! Guide-Me-AI is available around the clock, 24/7. No appointments needed - you can access career guidance anytime, anywhere. Whether it's late at night or early morning, our AI is always ready to help with your career questions.",
                        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      },
                      {
                        question: "What kind of results can I expect?",
                        answer: "Join thousands of users who have successfully advanced their careers with our comprehensive guidance system. Our users report improved job prospects, better interview performance, enhanced resumes, and clearer career direction within weeks of using our platform.",
                        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      },
                      {
                        question: "What areas of career support do you cover?",
                        answer: "We provide comprehensive support across all aspects of your professional journey. This includes resume building, interview preparation, skill development, career planning, job search strategies, networking advice, and personal branding guidance.",
                        icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      },
                      {
                        question: "How secure is my personal information?",
                        answer: "Your privacy and security are our top priorities. We use enterprise-grade security measures to protect your personal information and career data. All data is encrypted and stored securely, and we never share your information with third parties without your explicit consent.",
                        icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      },
                      {
                        question: "How easy is it to get started?",
                        answer: "Getting started is incredibly simple! Our intuitive interface requires no complex setup or technical knowledge. Just sign up, start chatting with our AI, and immediately begin receiving personalized career guidance. No tutorials or learning curve required.",
                        icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      }
                    ].map((faq, index) => (
                      <div key={index} className="bg-[#DCDCDC] dark:bg-[#232931] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                          onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-[#7E99A3] to-[#5A7A85] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.icon} />
                              </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 pr-4">
                              {faq.question}
                            </h3>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                              openFAQ === index ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-6 pb-4 pl-14">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-16 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Made with ❤️ by Guide-Me-AI Team
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}