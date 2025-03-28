
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold gradient-text mb-4">AI Housing Assistant</h1>
            <p className="text-gray-600">Chat with our AI to find your perfect home and schedule viewings.</p>
          </div>
          <ChatInterface />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chat;
