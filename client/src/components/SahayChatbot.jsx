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
  Heart,
  Volume2,
  VolumeX,
  Trash2
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'How does Emergency Auto-Routing work?',
  'How can I adopt a child legally under CARA?',
  'How does Anonymous Donation protect my identity?',
  'Find animal rescue shelters near Mumbai',
  'How does the volunteer QR check-in work?'
];

export const SahayChatbot = () => {
  const { setActiveTab, setIsReportModalOpen } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Namaste! 🙏 I am **Sahay AI**, your intelligent 24/7 NGO Connect relief assistant.\n\nAsk me about emergency auto-routing, CARA adoption laws, anonymous 80G tax donations, volunteering drives, or finding verified NGOs!",
      quickActions: [
        { label: '🚨 Report Live Incident', link: '/report' },
        { label: '👶 Adoption & CARA Rules', link: '/adoption' },
        { label: '🐕 Find Animal NGOs', query: 'Find animal rescue shelters' },
        { label: '💰 Anonymous 80G Donations', link: '/campaigns' }
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
  }, [messages, isOpen, isLoading]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages.slice(-4)
        })
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply,
            model: data.model,
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
          text: "I am having a brief network issue connecting to the AI knowledge base. Please ask again!",
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
    } else if (action.link) {
      const tabName = action.link.replace('/', '');
      setActiveTab(tabName);
      setIsOpen(false);
    } else if (action.query) {
      handleSend(action.query);
    }
  };

  const clearChat = () => {
    if (isSpeaking) window.speechSynthesis.cancel();
    setMessages([
      {
        sender: 'bot',
        text: "Namaste! 🙏 Chat history cleared. How can I assist you with relief, adoption, or donations today?",
        quickActions: [
          { label: '🚨 Report Live Incident', link: '/report' },
          { label: '💰 Anonymous 80G Donations', link: '/campaigns' }
        ],
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Helper to render markdown-like formatting simply
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-xs text-emerald-950 mt-1 mb-0.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('* ') || line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-3 list-disc text-slate-800 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </li>
        );
      }
      return (
        <p key={idx} className="leading-relaxed mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 ring-4 ring-emerald-500/20 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping"></span>
          </div>
          <span className="text-xs font-black pr-1 tracking-wide">Sahay AI</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-84 sm:w-96 h-[520px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black uppercase tracking-wider">Sahay AI Assistant</h3>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded-sm">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">24/7 Verified Emergency & Relief Guide</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs relative group ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {m.sender === 'bot' ? renderFormattedText(m.text) : m.text}

                    {/* Text-to-speech speaker button on bot responses */}
                    {m.sender === 'bot' && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="mt-2 text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen to audio</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.quickActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-800 text-[11px] font-bold py-1.5 px-2.5 rounded-xl transition-all shadow-2xs flex items-center gap-1"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs pl-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Carousel */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="shrink-0 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
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
              placeholder="Ask anything about relief or NGOs..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
