
import React, { useRef, useEffect } from 'react';
import { Message } from '@/services/chatService';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

const MessageList = ({ messages, isTyping }: MessageListProps) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-none' 
                : 'bg-white border border-gray-200 rounded-tl-none'
            }`}
          >
            <p className={message.role === 'user' ? 'text-white' : 'text-gray-800'}>
              {message.content}
            </p>
            <div className={`text-xs mt-1 text-right ${
              message.role === 'user' ? 'text-brand-100' : 'text-gray-400'
            }`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start mb-4">
          <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3">
            <div className="flex space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
