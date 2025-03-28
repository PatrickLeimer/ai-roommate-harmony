
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { chatService, Message, PropertySuggestion } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AuthForms from '@/components/AuthForms';

// Import the new components
import MessageList from '@/components/chat/MessageList';
import PropertySuggestions from '@/components/chat/PropertySuggestions';
import QuickActions from '@/components/chat/QuickActions';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      role: 'assistant',
      content: 'Hi there! I\'m your FlatMate AI assistant. How can I help with your housing search today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [propertySuggestions, setPropertySuggestions] = useState<PropertySuggestion[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (showPropertySuggestions) {
      // In a real app, we'd fetch these based on user preferences
      setPropertySuggestions(chatService.getPropertySuggestions());
    }
  }, [showPropertySuggestions]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!chatService.hasApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in settings",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Send message to service
      const { response, showProperties } = await chatService.sendMessage(inputValue);
      
      // Add AI response
      setMessages(prev => [...prev, response]);
      
      // Show property suggestions if needed
      if (showProperties) {
        setTimeout(() => {
          setShowPropertySuggestions(true);
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const scheduleViewing = async (propertyId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    
    setIsTyping(true);
    setShowPropertySuggestions(false);
    
    try {
      const response = await chatService.scheduleViewing(propertyId);
      setMessages(prev => [...prev, response]);
      
      toast({
        title: "Viewing Scheduled",
        description: "We'll contact you with confirmation details shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule viewing. Please try again.",
        variant: "destructive",
      });
      console.error("Error scheduling viewing:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 flex flex-col bg-white h-[600px]">
        {/* Chat Header */}
        <ChatHeader 
          isAuthenticated={isAuthenticated}
          logout={logout}
          setShowAuthDialog={setShowAuthDialog}
        />
        
        {/* Messages */}
        <MessageList messages={messages} isTyping={isTyping} />
        
        {/* Property Suggestions */}
        {showPropertySuggestions && propertySuggestions.length > 0 && (
          <PropertySuggestions 
            propertySuggestions={propertySuggestions}
            scheduleViewing={scheduleViewing}
          />
        )}
        
        {/* Quick Actions */}
        <QuickActions setInputValue={setInputValue} />
        
        {/* Input Area */}
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          isAuthenticated={isAuthenticated}
        />
      </div>
      
      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Authentication Required</DialogTitle>
            <DialogDescription>
              Please login or create an account to chat with FlatMate AI.
            </DialogDescription>
          </DialogHeader>
          <AuthForms onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatInterface;
