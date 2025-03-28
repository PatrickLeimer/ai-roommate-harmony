
import React from 'react';
import { Button } from '@/components/ui/button';
import APISettings from '@/components/APISettings';
import { Settings } from 'lucide-react';

interface ChatHeaderProps {
  isAuthenticated: boolean;
  logout: () => void;
  setShowAuthDialog: (show: boolean) => void;
}

const ChatHeader = ({ isAuthenticated, logout, setShowAuthDialog }: ChatHeaderProps) => {
  return (
    <div className="bg-brand-600 text-white p-4 flex justify-between items-center">
      <div>
        <h3 className="font-semibold">FlatMate AI Assistant</h3>
        <p className="text-xs opacity-80">Helping you find your perfect home</p>
      </div>
      <div className="flex items-center space-x-2">
        <APISettings />
        {isAuthenticated ? (
          <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:text-white hover:bg-brand-700">
            Logout
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAuthDialog(true)}
            className="text-white hover:text-white hover:bg-brand-700"
          >
            Login
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
