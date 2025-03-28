
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isAuthenticated: boolean;
}

const ChatInput = ({ 
  inputValue, 
  setInputValue, 
  handleSendMessage, 
  handleKeyDown, 
  isAuthenticated 
}: ChatInputProps) => {
  return (
    <div className="p-3 border-t border-gray-200 flex">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isAuthenticated ? "Ask me about your housing needs..." : "Login to chat with FlatMate AI"}
        className="flex-1 mr-2"
        disabled={!isAuthenticated}
      />
      <Button 
        onClick={handleSendMessage} 
        className="bg-brand-600 hover:bg-brand-700"
        disabled={!isAuthenticated}
      >
        <Send size={18} />
      </Button>
    </div>
  );
};

export default ChatInput;
