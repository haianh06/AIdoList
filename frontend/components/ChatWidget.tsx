"use client";
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Calendar, Loader2 } from 'lucide-react';
import { chatWithAI } from '../utils/api';

// Định nghĩa kiểu dữ liệu cho Message
interface Message {
  role: 'user' | 'ai';
  content: string;
  events?: any[]; 
  isError?: boolean;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Chào bạn! Tôi có thể giúp gì cho lịch trình của bạn?' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await chatWithAI(userMsg.content);
      
      let aiContent = "Tôi không hiểu yêu cầu.";
      let createdEvents = [];

      if (data.success) {
        aiContent = data.msg || "Đã xử lý xong.";
        createdEvents = data.events || [];
      } else {
         aiContent = data.message || "Có lỗi logic xảy ra.";
      }

      const aiMsg: Message = { 
        role: 'ai', 
        content: aiContent,
        events: createdEvents
      };
      
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Server Timeout.', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[30px] right-[30px] z-100 flex flex-col items-end gap-[10px] font-sans">
      
      {/*CHAT WINDOW*/}
      {isOpen && (
        <div className="w-[380px] h-[500px] bg-[#ffffff] rounded-[20px] shadow-[0_0_10px_rgba(0,0,0,0.1)] flex flex-col border border-[#e0e0e0] animate-[fade-in_0.3s_ease-out] fade-[fade-in] slide-in-from-right duration-[300ms]">
          
          {/* Header */}
          <div className="p-[15px] bg-[#3b82f6] rounded-[20px] flex items-center justify-between text-[#ffffff] shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-[10px]">
              <div className="bg-[#ffffff]/20 p-[10px] rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">AIdoList</h3>
                <p className="text-xs flex items-center gap-[5px]">
                  <span className="w-[10px] h-[10px] bg-[#7DDA58] rounded-full animate-[fade-in_0.3s_ease-out]"/> 
                  Online
                </p>
              </div>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-[scroll] p-[15px] space-y-[10px] bg-[#ffffff]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Text Bubble */}
                <div className={`max-w-[85%] p-[10px] rounded-[15px] text-[15px] shadow-[0_0_10px_rgba(0,0,0,0.1)] ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-[#CC6CE7] to-[#E80FC3] text-white rounded-tr-sm' 
                    : msg.isError 
                      ? 'bg-[#fff2f2] text-[#b91c1c] border border-red-200'
                      : 'bg-[#ffffff] text-[#3b82f6] border border-gray-100 rounded-[15px]'
                }`}>
                  {msg.content}
                </div>

                {/* Event Cards (Nếu có) */}
                {msg.events && msg.events.length > 0 && (
                  <div className="mt-[10px] space-y-[10px] w-[85%]">
                    {msg.events.map((ev: any) => (
                      <div key={ev.id} className="bg-[#fff2f2] p-[10px] rounded-[15px] border border-[#58DC82] shadow-[0_0_10px_rgba(0,0,0,0.1)] flex items-start gap-[10px]">
                        <div className="bg-[#58DC82] p-[10px] rounded-[5px] shrink-[0]">
                          <Calendar size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">{ev.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(ev.start_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                            {' - '}
                            {new Date(ev.end_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div className="text-[10px] text-green-600 font-medium mt-1 bg-green-50 px-1.5 py-0.5 rounded inline-block">
                            {new Date(ev.start_time).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-[5px] text-[#3b82f6] text-[15px] ml-[10px]">
                <Loader2 size={12} className="animate-spin"/>
                AI đang suy nghĩ...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-[15px] bg-[#ffffff] border-[#e0e0e0] border-[1px] rounded-[20px]">
            <div className="flex items-center gap-[10px] px-[10px] py-[5px] focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input 
                className="flex-1 bg-transparent text-[15px] text-gray-800 outline-none border-none placeholder:text-gray-400"
                placeholder="Create an event..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-[10px] bg-[#3b82f6] text-[#ffffff] rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TOGGLE BUTTON (Icon tròn góc màn hình) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-200 text-gray-600 rotate-90' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

    </div>
  );
}