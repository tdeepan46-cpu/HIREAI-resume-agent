
import React, { useState, useRef, useEffect } from 'react';
import { Message, Student } from '../types';
import { queryStudentAssistant } from '../geminiService';

interface ChatAgentProps {
  students: Student[];
  onShortlist: (id: string) => void;
}

export const ChatAgent: React.FC<ChatAgentProps> = ({ students, onShortlist }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "System online. I am HireAI. Command me to search, compare, or analyze your current Resume." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await queryStudentAssistant(userMsg, students);
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'No tactical data available.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural link interrupted. Please retry.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-6 border-b border-white/5 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-600/20">
            HI
          </div>
          <div className="space-y-0.5">
            <span className="font-black text-xs uppercase tracking-[0.2em] text-white">HireAI Agent</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-slate-500 uppercase">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed font-medium ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                : 'bg-slate-800/50 text-slate-200 border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 px-5 py-4 rounded-2xl flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/60 border-t border-white/5">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query the database..."
            className="w-full bg-slate-800 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
