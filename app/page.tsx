'use client';

import { useState, useRef, useEffect } from 'react';
import { Poppins } from 'next/font/google';
import ReactMarkdown from 'react-markdown'; // Added import

// Importing the Poppins font
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function Chat() {
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<Array<{id: string, role: string, content: string}>>([
    {
      id: 'intro',
      role: 'assistant',
      content: "Welcome to the PUPSHS Chatbot! 🏫\n\nI am here to assist you with inquiries specifically related to the PUP Senior High School in Sta. Mesa. Feel free to ask me about admission requirements, enrollment procedures, available strands, or commuting directions!"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Auto-scroll logic to keep the newest message in view
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!input.trim()) return; 

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput(''); 
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Backend Error: API quota might be exceeded. Try again later.");
      
      const data = await response.json();
      setMessages([...updatedMessages, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text }]);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col w-full h-[100dvh] bg-pup-cream ${poppins.className} overflow-hidden`}>
      
      {/* Sleek, frosted-maroon header */}
      <header className="w-full bg-pup-maroon/95 backdrop-blur-md border-b border-[#5e0000] shadow-[0_1px_0_rgba(255,255,255,0.4),0_6px_15px_rgba(0,0,0,0.15)] py-4 px-6 z-10 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">PUP SHS Chatbot</h1>
            <p className="text-sm text-pup-cream/80 font-medium">Assistant for PUP Senior High School Department Inquiries</p>
          </div>
        </div>
      </header>

      {/* Main chat display area */}
      <main className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
        {error && (
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500/50 text-red-700 p-4 rounded-xl shadow-sm text-sm">
            <p className="font-bold">Notice:</p>
            <p>{error.message}</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`whitespace-pre-wrap flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <span className={`inline-block p-4 md:p-5 text-[15px] md:text-[16px] leading-relaxed shadow-sm transition-all duration-300 ${
              m.role === 'user' 
                ? 'bg-pup-maroon/50 backdrop-blur-md text-gray-900 font-medium rounded-3xl rounded-tr-sm max-w-[85%] md:max-w-[75%]' 
                : 'bg-white/50 backdrop-blur-md border border-pup-detail/20 text-gray-800 rounded-3xl rounded-tl-sm max-w-[90%] md:max-w-[80%]' 
            }`}>
              {/* ReactMarkdown handles the clean formatting */}
              <ReactMarkdown 
                components={{
                  strong: ({node, ...props}) => <span className="font-bold text-gray-900" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-1 space-y-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                }}
              >
                {m.content}
              </ReactMarkdown>
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <span className="inline-block p-4 bg-white/50 backdrop-blur-md border border-pup-detail/20 text-pup-maroon font-medium rounded-3xl rounded-tl-sm animate-pulse shadow-sm">
              Typing...
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area pinned to the bottom */}
      <div className="w-full bg-gradient-to-t from-pup-cream via-pup-cream/95 to-transparent pt-4 pb-6 px-4 md:px-6 flex-shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto flex gap-3 relative items-end">
          <input
            className="flex-1 px-6 py-4 rounded-full bg-white/70 backdrop-blur-md border border-pup-detail/20 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-pup-maroon/50 text-[15px] md:text-[16px] transition-all"
            value={input}
            placeholder="Type your message here..."
            onChange={(e) => setInput(e.target.value)} 
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-pup-maroon/50 backdrop-blur-md text-white hover:bg-pup-maroon/70 transition-all shadow-md disabled:opacity-50 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-pup-maroon/50"
            aria-label="Send message"
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