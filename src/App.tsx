import React, { useState, useRef, useEffect } from 'react';
import { Send, HeartPulse, ShieldAlert, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getGeminiResponse } from './lib/gemini';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm UDoc, your AI health assistant. How can I help you today? Please describe your symptoms.",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400">
              UDoc
            </h1>
            <p className="text-xs text-blue-400/80 font-medium tracking-wider uppercase">AI Health Assistant</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          SECURE & PRIVATE
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 glass rounded-3xl overflow-hidden flex flex-col mb-6 shadow-2xl relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                  msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none max-w-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    <div className="prose-medical transition-all">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-white/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-slate-400 text-sm">UDoc is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Overlay (Optional/Static) */}
        {!messages.length && (
          <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
             <div className="max-w-md">
                <HeartPulse className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2 text-white">How can I help you?</h2>
                <p className="text-slate-400">Tell me about your symptoms, and I'll provide possible causes and treatments.</p>
             </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="relative animate-fade-in">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <HeartPulse className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your symptoms (e.g. 'I have a headache and fatigue')..."
          className="w-full bg-white/5 border border-white/10 text-white pl-12 pr-16 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500 shadow-xl"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all ${
            input.trim() && !isLoading 
            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20' 
            : 'bg-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Disclaimer */}
      <footer className="mt-6 text-center text-[10px] text-slate-500 font-medium tracking-wide uppercase px-8">
        Important: UDoc is an AI tool and not a replacement for professional medical consultation. 
        Always seek advice from a qualified healthcare provider.
      </footer>
    </div>
  );
};

export default App;
