import OpenAI from "openai";
import { storage } from "./storage";
import { Types } from 'mongoose';

// Initialize OpenAI client with fallback functionality
let openai: OpenAI;
let hasValidOpenAIKey = false;

try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.startsWith('sk-')) {
    openai = new OpenAI({ apiKey });
    hasValidOpenAIKey = true;
    console.log('OpenAI initialized successfully');
  } else {
    console.warn('Invalid or missing OpenAI API key');
    openai = new OpenAI({ apiKey: 'dummy-key' }); // Dummy instance that will throw errors when used
  }
} catch (error) {
  console.error('Error initializing OpenAI:', error);
  openai = new OpenAI({ apiKey: 'dummy-key' }); // Dummy instance
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Mock responses for testing when OpenAI is not available
const mockResponses = {
  chat: "I'm a mock AI assistant response because the OpenAI API key is missing or invalid. To use real AI responses, please provide a valid OpenAI API key.",
  propertySearch: "I found 2 mock properties that match your criteria. This is a placeholder response because the OpenAI API key is missing or invalid.",
  leaseAnalysis: "This is a mock lease analysis because the OpenAI API key is missing or invalid. To get real analysis, please provide a valid OpenAI API key."
};

// Function to handle chat conversations
export async function handleChatConversation(userId: string, userMessage: string, conversationId?: string) {
  try {
    // Get or create conversation
    let conversation;
    let messages;
    
    // Check for valid conversation ID - handle both MongoDB and mock storage
    const isValidId = conversationId && (
      Types.ObjectId.isValid(conversationId) || 
      /^\d+$/.test(conversationId) // Also accept string numbers for mock storage
    );
    
    if (isValidId) {
      conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        throw new Error("Conversation not found or unauthorized");
      }
      messages = await storage.getMessages(conversationId);
    } else {
      // Create a new conversation
      conversation = await storage.createConversation({ 
        userId,
        title: userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage
      });
      messages = [];
      
      // Add system message to set the assistant's behavior
      await storage.createMessage({
        conversationId: conversation._id,
        content: "You are FlatMate AI, a helpful assistant specializing in housing search. You can help users find rental properties, understand leases, and schedule viewings. When a user asks for a property search, you should extract their preferences (location, budget, bedrooms, etc.) and respond with suitable matches.",
        role: "system"
      });
    }
    
    // Add user message to database
    await storage.createMessage({
      conversationId: conversation._id,
      content: userMessage,
      role: "user"
    });
    
    // Get complete message history including the new user message
    messages = await storage.getMessages(conversation._id);
    
    // Format messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content
    }));
    
    // Check if the user message appears to be a property search request
    const isPropertySearch = isSearchRequest(userMessage);
    
    // If this seems like a property search, we'll ask the model to extract search parameters
    if (isPropertySearch) {
      const searchParams = await extractSearchParameters(userMessage);
      
      // Use the extracted parameters to search for listings
      const listings = await storage.getListings(searchParams);
      
      let responseContent;
      if (listings.length > 0) {
        // Format listings for response
        const formattedListings = listings.map(listing => 
          `- **${listing.title}** in ${listing.location}
           ${listing.bedrooms} bedroom, ${listing.bathrooms} bathroom, ${listing.size ? listing.size + 'm²' : 'size not specified'}
           €${listing.price}/month
           ${listing.nearestTransport ? `${listing.transportDistance} to ${listing.nearestTransport}` : ''}`
        ).join('\n\n');
        
        responseContent = `I found ${listings.length} properties matching your criteria:\n\n${formattedListings}\n\nWould you like to schedule a viewing for any of these properties? Or should I refine the search?`;
      } else {
        responseContent = "I couldn't find any properties matching your exact criteria. Would you like to try a broader search or different parameters?";
      }
      
      // Save AI response to database
      const assistantMessage = await storage.createMessage({
        conversationId: conversation._id,
        content: responseContent,
        role: "assistant"
      });
      
      return {
        message: assistantMessage,
        conversation,
        listings: listings.length > 0 ? listings : null
      };
    } else {
      // For non-search queries, use the OpenAI API directly
      let responseContent;
      
      if (hasValidOpenAIKey) {
        try {
          const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: formattedMessages,
            max_tokens: 500,
          });
          
          responseContent = completion.choices[0].message.content;
        } catch (error) {
          console.error('OpenAI API error:', error);
          responseContent = mockResponses.chat;
        }
      } else {
        // Use mock response if API key is invalid
        responseContent = mockResponses.chat;
      }
      
      // Save AI response to database
      const assistantMessage = await storage.createMessage({
        conversationId: conversation._id,
        content: responseContent || "I'm not sure how to respond to that.",
        role: "assistant"
      });
      
      return {
        message: assistantMessage,
        conversation
      };
    }
  } catch (error) {
    console.error("Error in chat conversation:", error);
    throw error;
  }
}

// Function to check if a message is likely a property search
function isSearchRequest(message: string): boolean {
  const searchTerms = [
    "find", "search", "looking for", "apartment", "flat", "house", 
    "property", "room", "rent", "bedroom", "location", "area", "budget"
  ];
  
  const lowercaseMessage = message.toLowerCase();
  return searchTerms.some(term => lowercaseMessage.includes(term));
}

// Function to extract search parameters from user message
async function extractSearchParameters(message: string): Promise<any> {
  // If we don't have a valid API key, just use the basic extraction
  if (!hasValidOpenAIKey) {
    return basicParameterExtraction(message);
  }
  
  try {
    const prompt = `
      Extract property search parameters from this user message. Return ONLY a JSON object with these fields:
      - location (string): The city or neighborhood
      - minPrice (number, optional): Minimum price in EUR
      - maxPrice (number, optional): Maximum price in EUR
      - bedrooms (number, optional): Minimum number of bedrooms

      User message: "${message}"
    `;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      return {};
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error("Error extracting search parameters:", error);
    // Fall back to basic parsing if AI extraction fails
    return basicParameterExtraction(message);
  }
}

// Fallback function for basic parameter extraction
function basicParameterExtraction(message: string): any {
  const params: any = {};
  
  // Extremely simple extraction logic as fallback
  const lowercaseMessage = message.toLowerCase();
  
  // Extract location
  const locationMatches = lowercaseMessage.match(/in\s+(\w+)/i);
  if (locationMatches && locationMatches[1]) {
    params.location = locationMatches[1];
  }
  
  // Extract price
  const priceMatches = lowercaseMessage.match(/(\d+)(?:\s*(?:€|EUR|euro|euros))/i);
  if (priceMatches && priceMatches[1]) {
    params.maxPrice = parseInt(priceMatches[1], 10);
  }
  
  // Extract bedrooms
  const bedroomMatches = lowercaseMessage.match(/(\d+)(?:\s*(?:bedroom|bed|br))/i);
  if (bedroomMatches && bedroomMatches[1]) {
    params.bedrooms = parseInt(bedroomMatches[1], 10);
  }
  
  return params;
}

// Function to analyze a lease contract
export async function analyzeLease(text: string) {
  // If OpenAI API is not available, return mock response
  if (!hasValidOpenAIKey) {
    return mockResponses.leaseAnalysis;
  }
  
  try {
    const prompt = `
      You are a lease contract analysis expert. Please analyze the following lease agreement and provide:
      1. A summary of key terms (rent, duration, deposit, etc.)
      2. Any potentially problematic clauses
      3. Important deadlines or dates to be aware of
      4. Overall assessment of fairness
      
      Lease text: ${text}
    `;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing lease:", error);
    return mockResponses.leaseAnalysis;
  }
}

// Function to generate listings based on search criteria
export async function generateListings(criteria: any): Promise<any[]> {
  // If OpenAI API is not available, return mock data
  if (!hasValidOpenAIKey) {
    return [
      {
        title: "Modern Apartment in City Center",
        description: "A beautiful, newly renovated apartment with all amenities",
        location: criteria.location || "Berlin",
        price: criteria.maxPrice || 1200,
        bedrooms: criteria.bedrooms || 2,
        bathrooms: 1,
        size: 75,
        nearestTransport: "Central Station",
        transportDistance: "5 minutes walk",
        contactInfo: "contact@flatmate.ai"
      },
      {
        title: "Cozy Studio with Garden View",
        description: "Perfect for singles or couples, this studio has everything you need",
        location: criteria.location || "Berlin",
        price: criteria.maxPrice ? criteria.maxPrice * 0.8 : 900,
        bedrooms: 1,
        bathrooms: 1,
        size: 45,
        nearestTransport: "Bus Stop",
        transportDistance: "2 minutes walk",
        contactInfo: "listings@flatmate.ai"
      }
    ];
  }
  
  try {
    // This function would typically be used for demo/testing purposes
    // In production, you'd use real listings from a database or web scraping
    
    const prompt = `
      Generate 3 realistic rental property listings based on these criteria:
      ${JSON.stringify(criteria)}
      
      Each listing should include:
      - title
      - description
      - location
      - price (in EUR)
      - bedrooms
      - bathrooms
      - size (in square meters)
      - nearest transport
      - transport distance
      - contact info
      
      Return ONLY a JSON array of objects with these fields, nothing else.
    `;
    
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate listings");
    }
    
    const result = JSON.parse(content);
    return result.listings || [];
  } catch (error) {
    console.error("Error generating listings:", error);
    // Return mock data if OpenAI fails
    return [
      {
        title: "Modern Apartment in City Center",
        description: "A beautiful, newly renovated apartment with all amenities",
        location: criteria.location || "Berlin",
        price: criteria.maxPrice || 1200,
        bedrooms: criteria.bedrooms || 2,
        bathrooms: 1,
        size: 75,
        nearestTransport: "Central Station",
        transportDistance: "5 minutes walk",
        contactInfo: "contact@flatmate.ai"
      },
      {
        title: "Cozy Studio with Garden View",
        description: "Perfect for singles or couples, this studio has everything you need",
        location: criteria.location || "Berlin",
        price: criteria.maxPrice ? criteria.maxPrice * 0.8 : 900,
        bedrooms: 1,
        bathrooms: 1,
        size: 45,
        nearestTransport: "Bus Stop",
        transportDistance: "2 minutes walk",
        contactInfo: "listings@flatmate.ai"
      }
    ];
  }
}
