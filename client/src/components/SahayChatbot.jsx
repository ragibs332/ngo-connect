import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Heart
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'How does Emergency Auto-Routing work?',
  'How can I adopt a child legally under CARA?',
  'How does Anonymous Donation protect my identity?',
  'Find animal rescue shelters near Bandra',
  'How does the volunteer QR check-in work?'
];

export const SahayChatbot = () => {
  const { setActiveTab, setIsReportModalOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! 🙏 I am **Sahay AI**, your 24/7 NGO Connect assistant. How can I assist you with emergency response, CARA adoption inquiry, anonymous donations, or finding verified NGOs today?",
      quickActions: [
        { label: '🚨 Report Live Incident', link: '/report' },
        { label: '👶 Adoption & CARA Rules', faqQuery: 'adoption' },
        { label: '🐕 Find Animal NGOs', query: 'Find animal rescue shelters' },
        { label: '💰 Anonymous 80G Donations', faqQuery: 'donation' }
      ],
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const newMsg = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply,
            quickActions: data.quickActions,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having a brief network issue connecting to the knowledge base. Please try asking again!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.link === '/report') {
      setIsReportModalOpen(true);
      setIsOpen(false);
    } else if (action.link === '/adoption') {
      setActiveTab('adoption');
      setIsOpen(false);
    } else if (action.link === '/campaigns') {
      setActiveTab('campaigns');
      setIsOpen(false);
    } else if (action.link === '/volunteering') {
      setActiveTab('volunteering');
      setIsOpen(false);
    } else if (action.link === '/ngos') {
      setActiveTab('ngos');
      setIsOpen(false);
    } else if (action.query) {
      handleSend(action.query);
    } else if (action.label) {
      handleSend(action.label);
    }
  };

  return (
    <>
      {/* Floating Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 group transition-all transform active:scale-95 border border-emerald-400/40"
        title="Chat with Sahay AI"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <span className="text-xs font-extrabold tracking-wide hidden sm:inline-block pr-1">
          Sahay AI Assistant
        </span>
      </button>

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[600px] h-[75vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold tracking-tight">Sahay AI</h4>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    ONLINE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">NGO Finder • CARA Guide • FAQs</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex gap-2 items-start ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                          : 'bg-emerald-600 text-white font-medium rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>

                    {/* Quick Action Chips */}
                    {isBot && msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.quickActions.map((qa, qidx) => (
                          <button
                            key={qidx}
                            onClick={() => handleActionClick(qa)}
                            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <span>{qa.label}</span>
                            <ArrowRight className="w-3 h-3 text-emerald-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 italic p-2">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Sahay AI is researching verified knowledge...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          {messages.length < 3 && (
            <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px]">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full shrink-0 font-medium transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about NGOs, CARA, SOS..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
