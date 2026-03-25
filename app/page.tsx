'use client';

import { useState, useRef, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Chat() {
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([
    {
      id: 'intro',
      role: 'assistant',
      content: "Welcome to the PUPSHS Chatbot! 🏫\n\nI am here to assist you with inquiries specifically related to the **PUP Senior High School in Sta. Mesa**. Feel free to ask me about admission requirements, enrollment procedures, available strands, or commuting directions!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput(''); 
    setIsLoading(true);
    setError(null);
    setIsMenuOpen(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Backend Error: API quota might be exceeded.");
      
      const data = await response.json();
      setMessages([...updatedMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text }]);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className={`flex flex-col w-full h-[100dvh] bg-pup-cream ${poppins.className} overflow-hidden`}>
      
      {/* Modern Heritage Header */}
      <header className="relative w-full bg-pup-maroon/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)] py-3 px-4 md:px-6 z-30 flex-shrink-0">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
            <div className="bg-white p-1 rounded-full shadow-lg flex-shrink-0 transition-transform hover:scale-105 duration-300">
              <Image 
                src="/pup-logo.png" 
                alt="PUP Logo" 
                width={32} 
                height={32} 
                className="md:w-9 md:h-9 object-contain" 
                priority 
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-white truncate tracking-tight">
                PUP SHS <span className="font-light text-pup-cream/90">Chatbot</span>
              </h1>
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* FIXED: Added flex-shrink-0 to prevent the dot from turning into an oval */}
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                {/* FIXED: Smart text truncation. Hides the long part on small phones, shows on tablets/desktops */}
                <p className="text-[9px] md:text-[10px] text-pup-cream/60 font-semibold uppercase tracking-widest truncate">
                  Online Assistant <span className="hidden sm:inline">for the PUP Senior High School Department</span>
                </p>
              </div>
            </div>
          </div>

          {/* FIXED: Added flex-shrink-0 to the button so it never gets crushed by the title */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="flex-shrink-0 p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-90 border border-white/5 bg-white/5 ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full right-4 mt-2 w-56 md:w-64 bg-white rounded-2xl shadow-2xl border border-pup-detail/20 py-3 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
            <p className="px-4 py-2 text-[10px] md:text-xs font-bold text-pup-maroon uppercase tracking-wider">Quick Inquiries</p>
            <div className="flex flex-col">
              {[
                "Strands offered",
                "How to enroll?",
                "Admission requirements", 
                "Enrollment eligibility",
                "Enrollment process"
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => sendMessage(query)}
                  className="px-4 py-3 text-left text-[13px] md:text-sm text-gray-700 hover:bg-pup-cream/50 transition-colors border-b last:border-0 border-gray-100"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-700 p-4 rounded-xl text-sm">
            <p>{error.message}</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start gap-2 md:gap-3'}`}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1 hidden md:block">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 p-1 flex items-center justify-center shadow-sm border border-pup-detail/20">
                  <Image src="/pup-logo.png" alt="Bot Avatar" width={22} height={22} />
                </div>
              </div>
            )}
            <span className={`inline-block p-3.5 md:p-4 text-[14px] md:text-[15px] leading-relaxed shadow-sm rounded-3xl transition-all ${
              m.role === 'user' 
                ? 'bg-pup-maroon/50 backdrop-blur-md text-gray-900 font-medium rounded-tr-sm max-w-[90%] md:max-w-[80%]' 
                : 'bg-white/50 backdrop-blur-md border border-pup-detail/20 text-gray-800 rounded-tl-sm max-w-[95%] md:max-w-[90%]' 
            }`}>
              <ReactMarkdown 
                components={{
                  strong: ({node, ...props}) => <span className="font-bold text-gray-900" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-2 space-y-2" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-2 text-gray-800">
                      <span className="flex-shrink-0 mt-[6px] text-[10px]">●</span>
                      <div className="flex-1 leading-relaxed [&>p]:inline [&>p]:m-0">
                        {props.children}
                      </div>
                    </li>
                  ),
                  p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />
                }}
              >
                {m.content}
              </ReactMarkdown>
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-2 md:gap-3 w-full">
            <div className="flex-shrink-0 mt-1 hidden md:block">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/80 p-1 flex items-center justify-center shadow-sm border border-pup-detail/20">
                <Image src="/pup-logo.png" alt="Bot Avatar" width={22} height={22} />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 p-3.5 md:p-4 bg-white/50 backdrop-blur-md border border-pup-detail/20 rounded-3xl rounded-tl-sm shadow-sm h-[44px] md:h-[48px]">
              <span className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-pup-maroon rounded-full animate-bounce"></span>
              <span className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-pup-maroon rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-pup-maroon rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="w-full bg-gradient-to-t from-pup-cream via-pup-cream/95 to-transparent pt-2 pb-4 md:pb-6 px-4 md:px-6 flex-shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto flex gap-2 md:gap-3 relative items-end">
          <input
            className="flex-1 px-4 py-3 md:px-5 md:py-3.5 rounded-full bg-white/70 backdrop-blur-md border border-pup-detail/20 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-pup-maroon/50 text-[14px] md:text-[15px]"
            value={input}
            placeholder="Type your message here..."
            onChange={(e) => setInput(e.target.value)} 
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-pup-maroon/50 backdrop-blur-md text-white hover:bg-pup-maroon/70 transition-all shadow-md disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-1">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}