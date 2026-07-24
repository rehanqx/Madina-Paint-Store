'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'user';
  time: string;
}

export function Chatbot() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Assalamu Alaikum! Welcome to Madina Paint Store. I am your customer assistant. How can I help you today?',
      sender: 'agent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    { label: '🎨 Color Spectrometer', query: 'Tell me about color matching spectrometer' },
    { label: '📅 Book Appointment', query: 'How to book an appointment' },
    { label: '📍 Shop Location', query: 'What is your address' },
    { label: '⏰ Shop Timings', query: 'What are your shop timings' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  if (isAdminRoute) return null;

  const getAgentResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    if (query.includes('color') || query.includes('spectrometer') || query.includes('match')) {
      return 'We utilize advanced computer-aided spectrometer technology to replicate any physical paint sample with 100% precision. Bring your sample card to our showroom in Madina Town!';
    }
    if (query.includes('book') || query.includes('appointment') || query.includes('consultation') || query.includes('schedule')) {
      return 'You can book a site consultation or painting estimate online in just a few clicks! Head over to the Book Appointment tab or click the Book Now button on the homepage.';
    }
    if (query.includes('location') || query.includes('address') || query.includes('where') || query.includes('shop')) {
      return 'We are located at Madina Town, near Nirala Sweets, College Road, Khanewal, Punjab. You can check our exact location on the interactive Google Map in the Contact page!';
    }
    if (query.includes('timing') || query.includes('open') || query.includes('hour') || query.includes('close')) {
      return 'Madina Paint Store is open Monday to Saturday from 8:00 AM to 9:00 PM. We are closed on Sundays.';
    }
    if (query.includes('price') || query.includes('pricing') || query.includes('rate') || query.includes('cost')) {
      return 'Our painting packages start from competitive rates! You can check our Services section for indicative pricing, or book an on-site estimation check-up for a detailed, customized quote.';
    }
    return 'Thank you for your message! Our staff will get back to you shortly. For immediate assistance or direct chats, please feel free to call or WhatsApp us at +92 300 6893082.';
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate agent typing delay
    setTimeout(() => {
      const responseText = getAgentResponse(textToSend);
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] no-print font-sans">
      {/* 1. Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#2D5016] text-white rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(45,80,22,0.4)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none relative"
        aria-label="Open support chat"
      >
        {isOpen ? (
          <span className="text-xl font-bold">✕</span>
        ) : (
          <span className="text-2xl">💬</span>
        )}
        {/* Pulsing indicator */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B44D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#E8B44D]"></span>
          </span>
        )}
      </button>

      {/* 2. Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-gray-100 flex flex-col overflow-hidden animate-fade-in transition-all duration-300">
          {/* Header */}
          <div className="bg-[#2D5016] text-white px-5 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#E8B44D] text-gray-900 rounded-full flex items-center justify-center font-extrabold text-sm border-2 border-white/20">
                  MP
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">Madina Support Agent</h4>
                <p className="text-xs text-gray-200 mt-0.5 font-medium">Online • Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50 space-y-3.5 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#2D5016] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">{msg.time}</span>
              </div>
            ))}

            {/* Simulating typing indicator */}
            {isTyping && (
              <div className="self-start max-w-[80%] flex flex-col items-start animate-pulse">
                <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-none flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 bg-white border-t border-gray-50 flex items-center space-x-2 overflow-x-auto py-2.5">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(reply.query)}
                className="whitespace-nowrap bg-gray-100 hover:bg-[#2D5016]/10 text-gray-700 hover:text-[#2D5016] border border-gray-200 hover:border-[#2D5016]/30 px-3 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-gray-100 bg-white flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 focus:border-[#2D5016] px-4 py-2.5 rounded-xl text-sm outline-none transition-all text-gray-800"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-[#2D5016] hover:bg-[#203a10] text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0"
              aria-label="Send message"
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
