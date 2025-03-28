
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Home, Building, DollarSign, Map, Calendar } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PropertySuggestion {
  id: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  image: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I\'m your FlatMate AI assistant. How can I help with your housing search today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Mock property suggestions
  const propertySuggestions: PropertySuggestion[] = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      price: '$1,750/mo',
      location: 'Downtown',
      beds: 2,
      baths: 1,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: '2',
      title: 'Cozy Midtown Studio',
      price: '$1,200/mo',
      location: 'Midtown',
      beds: 1,
      baths: 1,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    {
      id: '3',
      title: 'Spacious 2BR near University',
      price: '$1,850/mo',
      location: 'University District',
      beds: 2,
      baths: 2,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    }
  ];

  // Scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      
      // Show property suggestions if user asks about properties
      if (inputValue.toLowerCase().includes('apartment') || 
          inputValue.toLowerCase().includes('house') || 
          inputValue.toLowerCase().includes('property')) {
        setTimeout(() => {
          setShowPropertySuggestions(true);
        }, 1000);
      }
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    // Simple response generation logic
    if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
      return "Hello! How can I help with your housing search today?";
    } else if (userInput.toLowerCase().includes('apartment') || userInput.toLowerCase().includes('house')) {
      return "I'd be happy to help you find a suitable place! Could you tell me your preferred location, budget, and how many bedrooms you need?";
    } else if (userInput.toLowerCase().includes('budget') || userInput.toLowerCase().includes('price')) {
      return "Thanks for sharing your budget. I'm searching for properties within your price range. What amenities are most important to you?";
    } else if (userInput.toLowerCase().includes('location') || userInput.toLowerCase().includes('area')) {
      return "That's a great area! I'm finding several options there. Do you need parking or have any specific requirements for the property?";
    } else if (userInput.toLowerCase().includes('schedule') || userInput.toLowerCase().includes('appointment') || userInput.toLowerCase().includes('viewing')) {
      return "I can help schedule a viewing. Would you prefer weekday or weekend appointments? I'll coordinate with the property manager.";
    } else {
      return "I understand. Based on what you've told me, I'm searching for properties that match your criteria. Give me just a moment to find the best options for you.";
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

  const scheduleViewing = (propertyId: string) => {
    setShowPropertySuggestions(false);
    
    const aiResponse: Message = {
      role: 'assistant',
      content: `I've scheduled a viewing for you! The property manager will contact you shortly to confirm the details. Would you like me to find more properties similar to this one?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiResponse]);
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
        {messages.map((message, index) => (
          <div 
            key={index} 
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
        {showPropertySuggestions && (
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
