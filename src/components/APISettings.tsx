
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chatService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const APISettings = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [mongoURI, setMongoURI] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { setMongoURI: connectMongo, isDBConnected } = useAuth();
  
  // Load existing values from localStorage for display
  useEffect(() => {
    const storedOpenAIKey = localStorage.getItem('openai_api_key');
    const storedMongoURI = localStorage.getItem('mongodb_uri');
    
    if (storedOpenAIKey) {
      setOpenAIKey('••••••••••••••••••••••••••');
    }
    
    if (storedMongoURI) {
      setMongoURI('••••••••••••••••••••••••••');
    }
  }, [open]);

  const handleSaveOpenAI = () => {
    if (!openAIKey.trim() || openAIKey === '••••••••••••••••••••••••••') {
      toast({
        title: "Error",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    const success = chatService.setApiKey(openAIKey);
    if (success) {
      toast({
        title: "Success",
        description: "OpenAI API key saved successfully",
      });
      setOpenAIKey('••••••••••••••••••••••••••');
    } else {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const clearOpenAIKey = () => {
    setOpenAIKey('');
    localStorage.removeItem('openai_api_key');
    toast({
      title: "Cleared",
      description: "OpenAI API key has been removed",
    });
  };

  const handleSaveMongoDB = async () => {
    if (!mongoURI.trim() || mongoURI === '••••••••••••••••••••••••••') {
      toast({
        title: "Error",
        description: "Please enter a valid MongoDB URI",
        variant: "destructive",
      });
      return;
    }

    const success = await connectMongo(mongoURI);
    if (success) {
      setMongoURI('••••••••••••••••••••••••••');
    }
  };

  const clearMongoURI = () => {
    setMongoURI('');
    localStorage.removeItem('mongodb_uri');
    toast({
      title: "Cleared",
      description: "MongoDB URI has been removed",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys for OpenAI and MongoDB connections.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This is a browser-based demo with simulated storage. In a production environment, APIs would be called securely from a backend server.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">OpenAI API Key</h4>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter your OpenAI API key"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
              />
              <Button onClick={handleSaveOpenAI}>Save</Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {chatService.hasApiKey() 
                  ? "✅ OpenAI API key is configured" 
                  : "❌ OpenAI API key is not configured"}
              </p>
              {chatService.hasApiKey() && (
                <Button variant="ghost" size="sm" onClick={clearOpenAIKey} className="text-xs">
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">MongoDB Connection</h4>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter a mock MongoDB URI"
                value={mongoURI}
                onChange={(e) => setMongoURI(e.target.value)}
              />
              <Button onClick={handleSaveMongoDB}>Connect</Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {isDBConnected 
                  ? "✅ Connected to simulated MongoDB" 
                  : "❌ Not connected to MongoDB"}
              </p>
              {isDBConnected && (
                <Button variant="ghost" size="sm" onClick={clearMongoURI} className="text-xs">
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              For demo purposes, any valid URI format will work.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default APISettings;
