
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Home, Building, DollarSign, Map, Calendar } from 'lucide-react';
import { chatService, Message, PropertySuggestion } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

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
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showPropertySuggestions) {
      // In a real app, we'd fetch these based on user preferences
      setPropertySuggestions(chatService.getPropertySuggestions());
    }
  }, [showPropertySuggestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
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

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scheduleViewing = async (propertyId: string) => {
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
    <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 flex flex-col bg-white h-[600px]">
      {/* Chat Header */}
      <div className="bg-brand-600 text-white p-4">
        <h3 className="font-semibold">FlatMate AI Assistant</h3>
        <p className="text-xs opacity-80">Helping you find your perfect home</p>
      </div>
      
      {/* Chat Messages */}
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
        
        {/* Property Suggestions */}
        {showPropertySuggestions && propertySuggestions.length > 0 && (
          <div className="mb-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
              <p className="font-medium mb-2">I found these properties matching your criteria:</p>
              <div className="space-y-3">
                {propertySuggestions.map((property) => (
                  <div key={property.id} className="flex border border-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={property.image} 
                      alt={property.title} 
                      className="w-20 h-20 object-cover"
                    />
                    <div className="p-2 flex-1">
                      <h4 className="font-medium text-sm">{property.title}</h4>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="flex items-center text-gray-600">
                          <DollarSign size={12} className="mr-1" />
                          {property.price}
                        </span>
                        <span className="flex items-center text-gray-600">
                          <Map size={12} className="mr-1" />
                          {property.location}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {property.beds} bed • {property.baths} bath
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs border-brand-600 text-brand-600"
                          onClick={() => scheduleViewing(property.id)}
                        >
                          <Calendar size={12} className="mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      <div className="flex overflow-x-auto p-2 border-t border-gray-100 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="whitespace-nowrap text-xs h-8"
          onClick={() => setInputValue("I'm looking for a 2-bedroom apartment")}
        >
          <Home size={12} className="mr-1" /> 2-Bedroom
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="whitespace-nowrap text-xs h-8"
          onClick={() => setInputValue("I need a pet-friendly rental")}
        >
          <Building size={12} className="mr-1" /> Pet-friendly
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="whitespace-nowrap text-xs h-8"
          onClick={() => setInputValue("My budget is $1500/month")}
        >
          <DollarSign size={12} className="mr-1" /> Budget $1500
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="whitespace-nowrap text-xs h-8"
          onClick={() => setInputValue("Schedule apartment viewings this weekend")}
        >
          <Calendar size={12} className="mr-1" /> Weekend viewings
        </Button>
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 flex">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me about your housing needs..."
          className="flex-1 mr-2"
        />
        <Button onClick={handleSendMessage} className="bg-brand-600 hover:bg-brand-700">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
