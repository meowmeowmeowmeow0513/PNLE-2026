
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { 
  MessageCircleQuestion, 
  X, 
  Send, 
  Stethoscope, 
  Loader2, 
  Minimize2, 
  GraduationCap 
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ClinicalChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Welcome, future RN! I'm your Clinical Instructor. I won't give you the answers, but I'll help you find them. What concept are we reviewing today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to persist the chat session across renders
  const chatSessionRef = useRef<Chat | null>(null);

  // Initialize Gemini Chat Session
  useEffect(() => {
    if (!chatSessionRef.current) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: `You are a strict but encouraging Clinical Nursing Instructor for PNLE candidates.
            1. If the student asks a test question or for a direct answer, DO NOT give it. Instead, ask guiding questions like "What is the priority assessment here?" or "Apply the ABCs (Airway, Breathing, Circulation)."
            2. Use high-yield Mnemonics (e.g., MONA, BUBBLE-HE, ADPIE) to explain concepts whenever relevant.
            3. Keep responses concise (under 4 sentences) unless explicitly asked to elaborate.
            4. Be professional, academic, but supportive. Use phrases like "Batch Spirit" or "Future RN".
            5. If the student is stressed, offer brief encouragement.`,
            temperature: 0.7, // Balance between creative teaching and factual accuracy
          },
        });
      } catch (error) {
        console.error("Failed to initialize Gemini:", error);
      }
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (chatSessionRef.current) {
        const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
        const responseText = result.text;
        
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText || "I'm having trouble connecting to the nurses' station. Please try again."
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Clinical Error: Unable to process request. Please check your connection."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Collapsed State (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50 w-14 h-14 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
          aria-label="Open Clinical Instructor"
        >
          <div className="absolute inset-0 rounded-full bg-pink-500 animate-ping opacity-20"></div>
          <MessageCircleQuestion size={28} className="relative z-10" />
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask Instructor
          </span>
        </button>
      )}

      {/* Expanded State (Chat Window) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 md:bottom-6 md:right-6 z-50 w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-slate-900/50 backdrop-blur-md p-4 border-b border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-600/20 rounded-lg">
                <Stethoscope size={20} className="text-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  Clinical Instructor
                  <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full uppercase tracking-wider">Online</span>
                </h3>
                <p className="text-xs text-slate-400">PNLE Review Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f172a]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                    msg.role === 'user' 
                      ? 'bg-slate-700 text-slate-300' 
                      : 'bg-pink-600 text-white'
                  }`}>
                    {msg.role === 'user' ? <div className="text-xs font-bold">YOU</div> : <GraduationCap size={16} />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-pink-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex w-full justify-start">
                 <div className="flex max-w-[85%] gap-2">
                    <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center shrink-0 mt-1">
                        <GraduationCap size={16} />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-none text-slate-400 text-xs flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Instructor is typing...
                    </div>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-700 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                className="w-full bg-slate-800 text-white border-0 rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-pink-500/50 placeholder:text-slate-500 text-sm"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              AI can make mistakes. Always verify with your textbooks.
            </p>
          </form>

        </div>
      )}
    </>
  );
};

export default ClinicalChatBot;
