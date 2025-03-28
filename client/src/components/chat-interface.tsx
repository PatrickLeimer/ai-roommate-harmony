import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Mic, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Listing } from "@shared/schema";

// Message types
type MessageRole = "user" | "assistant" | "system";

interface Message {
  id: number;
  content: string;
  role: MessageRole;
  createdAt: string;
}

interface Conversation {
  id: number;
  userId: number;
  createdAt: string;
}

interface ChatResponse {
  message: Message;
  conversation: Conversation;
  listings?: Listing[] | null;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get conversation messages
  const { 
    data: messages, 
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    refetch: refetchMessages
  } = useQuery<Message[]>({
    queryKey: conversationId ? ["/api/conversations", conversationId, "messages"] : [],
    enabled: !!conversationId,
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string, conversationId?: number }) => {
      const res = await apiRequest("POST", "/api/chat", { message, conversationId });
      return await res.json() as ChatResponse;
    },
    onSuccess: (data) => {
      // Set conversation ID for future messages
      setConversationId(data.conversation.id);
      
      // Refetch messages or update local cache
      if (messages) {
        queryClient.setQueryData(["/api/conversations", data.conversation.id, "messages"], 
          [...messages, data.message]
        );
      } else {
        refetchMessages();
      }

      // If listings were returned, show them
      if (data.listings?.length) {
        toast({
          title: "Properties Found",
          description: `${data.listings.length} properties match your criteria.`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatMutation.isPending]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // If not logged in, prompt to log in
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to use the AI chat assistant",
        variant: "destructive",
      });
      return;
    }
    
    chatMutation.mutate({ message, conversationId: conversationId || undefined });
    setMessage("");
  };

  const formatMessages = () => {
    if (!messages || messages.length === 0) {
      return [{
        id: 0,
        content: "Hello! I'm your FlatMate AI assistant. I can help you find apartments, schedule viewings, and analyze lease agreements. What type of housing are you looking for today?",
        role: "assistant",
        createdAt: new Date().toISOString()
      }];
    }
    return messages;
  };

  // Generate a property card
  const renderPropertyCard = (listing: Listing) => (
    <div key={listing.id} className="property-card bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-3">
      <div className="relative">
        <img 
          src={listing.imageUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
          alt={listing.title} 
          className="w-full h-40 object-cover" 
        />
        <Badge className="absolute top-2 right-2 bg-primary text-white">
          €{listing.price}/mo
        </Badge>
      </div>
      <div className="p-4">
        <h4 className="font-medium text-gray-800">{listing.title}</h4>
        <p className="text-sm text-gray-500 mt-1">
          {listing.bedrooms} BR • {listing.bathrooms} Bath • {listing.size}m² • {listing.transportDistance} to {listing.nearestTransport}
        </p>
        <div className="mt-3 flex space-x-2">
          <Button size="sm" variant="default">
            Schedule View
          </Button>
          <Button size="sm" variant="outline">
            More Details
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section id="chat" className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-base font-semibold text-primary tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            AI Assistant
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Try Our Smart AI Assistant
          </motion.p>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Experience how our AI assistant can help you find the perfect home.
          </motion.p>
        </div>

        <motion.div 
          className="mt-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            {/* Chat Header */}
            <CardHeader className="bg-primary text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="ml-3">
                  <CardTitle>FlatMate AI Assistant</CardTitle>
                  <CardDescription className="text-primary-100">
                    Online and ready to help
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            {/* Chat Messages */}
            <CardContent className="p-0">
              <div 
                ref={chatContainerRef}
                className="h-96 overflow-y-auto px-6 py-4"
              >
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isMessagesError ? (
                  <div className="flex justify-center items-center h-full text-red-500">
                    Error loading messages. Please try again.
                  </div>
                ) : (
                  <>
                    {formatMessages().map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex items-start mb-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <Mic className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        )}
                        <div className={`max-w-3/4 ${msg.role !== 'user' ? 'ml-3' : 'mr-3'}`}>
                          <div 
                            className={`text-sm p-3 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                                : 'bg-gray-100 text-gray-800 rounded-tr-lg rounded-tl-lg rounded-br-lg'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                        {msg.role === 'user' && (
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {chatMutation.isPending && (
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <Mic className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-3 max-w-3/4">
                          <div className="bg-gray-100 text-gray-800 rounded-tr-lg rounded-tl-lg rounded-br-lg text-sm p-3">
                            <div className="flex items-center space-x-2">
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"/>
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-75"/>
                              <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"/>
                              <div className="text-gray-500 ml-1">AI is thinking...</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </CardContent>
            
            {/* Chat Input */}
            <CardFooter className="border-t border-gray-200 p-4">
              <div className="flex w-full">
                <Input
                  type="text"
                  className="flex-1 rounded-r-none border-r-0"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={chatMutation.isPending}
                />
                <Button
                  type="submit"
                  className="rounded-l-none"
                  onClick={handleSendMessage}
                  disabled={chatMutation.isPending}
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Try asking "Find me a 2-bedroom apartment in Berlin under €1200"
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
