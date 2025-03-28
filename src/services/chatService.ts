
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PropertySuggestion {
  id: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  image: string;
}

// Mock property suggestions that would normally come from a database
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

class ChatService {
  private openai: OpenAI | null = null;
  
  constructor() {
    // Initialize OpenAI client if API key is available
    const apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend
      });
    }
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('openai_api_key', apiKey);
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    return this.openai !== null;
  }

  hasApiKey() {
    return localStorage.getItem('openai_api_key') !== null;
  }

  async sendMessage(message: string): Promise<{ response: Message, showProperties: boolean }> {
    // Determine if we should show property suggestions
    const showProperties = message.toLowerCase().includes('apartment') || 
                          message.toLowerCase().includes('house') || 
                          message.toLowerCase().includes('property');
    
    let content = '';
    
    try {
      if (this.openai) {
        // Use OpenAI to generate a response
        const chatCompletion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system", 
              content: "You are FlatMate AI, a helpful AI assistant for finding housing and answering questions related to rentals, apartments, and real estate. Be concise and friendly."
            },
            { role: "user", content: message }
          ],
          max_tokens: 150,
        });
        
        content = chatCompletion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
      } else {
        // Fallback to hardcoded responses if OpenAI is not available
        content = this.generateResponse(message);
      }
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      content = "I apologize, but I encountered an error processing your request. Please try again later.";
    }
    
    const response: Message = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    
    return { response, showProperties };
  }
  
  getPropertySuggestions(): PropertySuggestion[] {
    return propertySuggestions;
  }
  
  scheduleViewing(propertyId: string): Promise<Message> {
    // This would actually connect to a calendar API, send emails, etc.
    return Promise.resolve({
      id: uuidv4(),
      role: 'assistant',
      content: `I've scheduled a viewing for you! The property manager will contact you shortly to confirm the details. Would you like me to find more properties similar to this one?`,
      timestamp: new Date()
    });
  }
  
  private generateResponse(userInput: string): string {
    // Simple response generation logic - in a real app, this would call an AI API
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
  }
}

export const chatService = new ChatService();
