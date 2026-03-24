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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // New state for the menu
  
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

  // Unified function to handle both manual typing and "Quick Inquiry" clicks
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput(''); 
    setIsLoading(true);
    setError(null);
    setIsMenuOpen(false); // Close menu after selection

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
      
      {/* Header with Hamburger Menu */}
      <header className="relative w-full bg-pup-maroon/95 backdrop-blur-md border-b border-[#5e0000] shadow-lg py-3 px-6 z-30 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 p-1 rounded-full shadow-sm flex-shrink-0">
              <Image src="/pup-logo.png" alt="PUP Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-none">PUP SHS Chatbot</h1>
              <p className="text-[10px] md:text-sm text-pup-cream/80 font-medium">Assistant for the PUP Senior High School Department</p>
            </div>
          </div>

          {/* Hamburger Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
            aria-label="Quick Inquiries"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>

        {/* Dropdown Menu (Quick Inquiries) */}
        {isMenuOpen && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-pup-detail/20 py-3 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
            <p className="px-4 py-2 text-xs font-bold text-pup-maroon uppercase tracking-wider">Quick Inquiries</p>
            <div className="flex flex-col">
              {[
                "How to enroll?", 
                "Enrollment process", 
                "Enrollment eligibility",
                "Admission requirements",
                "Commuting directions"
              ].map((query) => (
                <button
                  key={query}
                  onClick={() => sendMessage(query)}
                  className="px-4 py-3 text-left text-sm text-gray-700 hover:bg-pup-cream/50 transition-colors border-b last:border-0 border-gray-100"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main chat display area */}
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto p-4 md:p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-700 p-4 rounded-xl text-sm">
            <p>{error.message}</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1 hidden md:block">
                <div className="w-9 h-9 rounded-full bg-white/80 p-1 flex items-center justify-center shadow-sm border border-pup-detail/20">
                  <Image src="/pup-logo.png" alt="Bot Avatar" width={28} height={28} />
                </div>
              </div>
            )}
            <span className={`inline-block p-4 md:p-5 text-[15px] md:text-[16px] leading-relaxed shadow-sm rounded-3xl transition-all ${
              m.role === 'user' 
                ? 'bg-pup-maroon/50 backdrop-blur-md text-gray-900 font-medium rounded-tr-sm max-w-[85%] md:max-w-[75%]' 
                : 'bg-white/50 backdrop-blur-md border border-pup-detail/20 text-gray-800 rounded-tl-sm max-w-[90%] md:max-w-[80%]' 
            }`}>
              <ReactMarkdown 
                components={{
                  strong: ({node, ...props}) => <span className="font-bold text-gray-900" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-2 space-y-2" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-2 text-gray-800">
                      <span className="flex-shrink-0 mt-[6px] text-[10px]">●</span>
                      <div className="flex-1 leading-relaxed">{props.children}</div>
                    </li>
                  ),
                  p: ({node, ...props}) => {
                    const isInsideLi = node?.parent?.tagName === 'li';
                    return <p className={`${isInsideLi ? 'inline m-0' : 'mb-4 last:mb-0 block'}`} {...props} />;
                  }
                }}
              >
                {m.content}
              </ReactMarkdown>
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-3 w-full">
            <div className="flex-shrink-0 mt-1 hidden md:block">
              <div className="w-9 h-9 rounded-full bg-white/80 p-1 flex items-center justify-center shadow-sm border border-pup-detail/20">
                <Image src="/pup-logo.png" alt="Bot Avatar" width={28} height={28} />
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 p-4 md:p-5 bg-white/50 backdrop-blur-md border border-pup-detail/20 rounded-3xl rounded-tl-sm shadow-sm h-[56px]">
              <span className="w-2 h-2 bg-pup-maroon rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-pup-maroon rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-pup-maroon rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <div className="w-full bg-gradient-to-t from-pup-cream via-pup-cream/95 to-transparent pt-4 pb-6 px-4 md:px-6 flex-shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto flex gap-3 relative items-end">
          <input
            className="flex-1 px-6 py-4 rounded-full bg-white/70 backdrop-blur-md border border-pup-detail/20 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-pup-maroon/50 text-[15px] md:text-[16px]"
            value={input}
            placeholder="Type your message here..."
            onChange={(e) => setInput(e.target.value)} 
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-pup-maroon/50 backdrop-blur-md text-white hover:bg-pup-maroon/70 transition-all shadow-md disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}