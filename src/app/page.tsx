'use client'
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { ChatBubble, ChatBubbleMessage } from "../components/ui/chat-bubble";
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageLoading } from "@/components/ui/message-loading";
import { Typewriter } from "@/components/ui/typewriter-text";
import { SparklesCore } from "@/components/ui/Sparkles";
import { SunIcon, DocumentIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

const ResumeLink = ({ isVisible, isDarkTheme, onResumeClick }: { isVisible: boolean, isDarkTheme: boolean, onResumeClick: () => void }) => {
  if (!isVisible) return null; // Don't render if not visible

  return (
    <div onClick={onResumeClick} className={`fade-in cursor-pointer absolute top-4 ${isDarkTheme ? 'dark:bg-background' : 'bg-muted'} left-4 p-2 rounded-md`}>
      <div className="relative">
        <img src="/resume_thumbnail.png" alt="Resume" className="w-[200px] h-[250px]" />
        <DocumentIcon className="absolute inset-0 m-auto w-16 h-16 opacity-75" />
      </div>
    </div>
  );
};

export default function Home() {
  const [storedMessages, setStoredMessages] = useState(() => {
    // Check if localStorage is available
    if (typeof window !== 'undefined') {
      // Initialize state with messages from local storage
      return JSON.parse(localStorage.getItem('chatMessages') || '[]');
    }
    return []; // Return an empty array if localStorage is not available
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [showResume, setShowResume] = useState(false);

  const placeholders = [
    "How can I contact Craig?",
    "What is Craig's availability next week?",
    "What can I do on this website?",
    "Leave a message for Craig",
    "Schedule a meeting with Craig",
    "Show me Craig's resume",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    const message = input.value;

    // Store the sent message in local storage
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    messages.push({ type: 'sent', text: message });
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    
    // Update state to trigger re-render
    setStoredMessages([...messages]);
    const threadId = localStorage.getItem('threadId');

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, threadId }),
      });

      const data = await response.json();

      if (data.action === "showResume") {
        console.log("Showing resume");
        setShowResume(true);
      }

      // Store the received message in local storage
      messages.push({ type: 'received', text: data.response });
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      localStorage.setItem('threadId', data.threadId);

      // Update state to trigger re-render with the new message
      setStoredMessages([...messages]);
    } catch (error) {
      console.error('Error calling chat API:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to update messages when the component mounts
  useEffect(() => {
    const handleStorageChange = () => {
      const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      setStoredMessages(messages);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkTheme);
  }, [isDarkTheme]);

  useEffect(() => {
    // Set visibility to true after the component mounts
    const timer = setTimeout(() => setIsVisible(true), 100); // Delay for fade-in effect
    return () => clearTimeout(timer);
  }, []);

  const handleResumeClick = () => {
    setShowResume(false);
    window.open('/resume.pdf', '_blank');
  };

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [storedMessages]);

  const clearChat = () => {
    localStorage.removeItem('threadId');
    localStorage.removeItem('chatMessages');
    setStoredMessages([]);
    setShowResume(false);
  };

  return (
    <div>
      <div className="absolute top-4 right-4 z-10">
        <button onClick={toggleTheme} className="cursor-pointer">
          <SunIcon className={`w-6 h-6 ${isDarkTheme ? 'text-white' : 'text-black'}`} />
        </button>
      </div>
      <div className="absolute top-4 left-4 z-10">
        <button onClick={clearChat} className="cursor-pointer" title="Start new chat">
          <PencilSquareIcon className={`w-6 h-6 ${isDarkTheme ? 'text-white' : 'text-black'}`} />
        </button>
      </div>
      <SparklesCore
          background={isDarkTheme ? "#171717" : "#FFFFFF"}
          minSize={0.4}
          maxSize={1}
          particleDensity={80}
          className="absolute inset-0 w-full h-full z-[-1]"
          particleColor={isDarkTheme ? "#FFFFFF" : "#000000"}
        />
    <div className={`flex flex-col justify-center items-center px-4 h-screen ${isVisible ? 'fade-in' : 'opacity-0'}`}>
      {storedMessages.length === 0 && <Typewriter
          text={["Welcome.", "I am Craig's AI assistant.", "How can I help you?"]}
          speed={70}
          deleteSpeed={35}
          delay={4000}
          loop={false}
          className={`text-4xl text-center font-medium ${isDarkTheme ? 'white-text' : ''} mb-4`}
      />}
      {storedMessages.length > 0 && (
        <div ref={messageContainerRef} className={`max-w-xl w-full min-w-[400px] h-[calc(100vh-200px)] message-container space-y-4 p-4`}>
            {storedMessages.map((msg: { type: string; text: string }, index: number) => (
              <ChatBubble key={index} variant={msg.type as "sent" | "received"}>
                <ChatBubbleMessage variant={msg.type as "sent" | "received"} isDarkTheme={isDarkTheme}>
                  <ReactMarkdown components={{
                    p: ({node, ...props}) => <p className="whitespace-pre-line" {...props} />
                  }}>
                    {msg.text}
                  </ReactMarkdown>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}
            {isLoading && <MessageLoading isDarkTheme={isDarkTheme} />}
        </div>
      )}
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
      <ResumeLink isVisible={showResume} isDarkTheme={isDarkTheme} onResumeClick={handleResumeClick} />
    </div>
    </div>
  );
}
