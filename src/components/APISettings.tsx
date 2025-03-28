
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chatService";

const APISettings = () => {
  const [openAIKey, setOpenAIKey] = useState('');
  const [mongoURI, setMongoURI] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { setMongoURI: connectMongo, isDBConnected } = useAuth();

  const handleSaveOpenAI = () => {
    if (!openAIKey.trim()) {
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
      setOpenAIKey('');
    } else {
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      });
    }
  };

  const handleSaveMongoDB = async () => {
    if (!mongoURI.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid MongoDB URI",
        variant: "destructive",
      });
      return;
    }

    const success = await connectMongo(mongoURI);
    if (success) {
      setMongoURI('');
    }
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
            <p className="text-xs text-gray-500">
              {chatService.hasApiKey() 
                ? "✅ OpenAI API key is configured" 
                : "❌ OpenAI API key is not configured"}
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">MongoDB Connection</h4>
            <div className="flex space-x-2">
              <Input
                type="password"
                placeholder="Enter your MongoDB URI"
                value={mongoURI}
                onChange={(e) => setMongoURI(e.target.value)}
              />
              <Button onClick={handleSaveMongoDB}>Connect</Button>
            </div>
            <p className="text-xs text-gray-500">
              {isDBConnected 
                ? "✅ Connected to MongoDB" 
                : "❌ Not connected to MongoDB"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default APISettings;
