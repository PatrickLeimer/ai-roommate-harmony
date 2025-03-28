
import React from 'react';
import ChatInterface from './ChatInterface';

const ChatDemo = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Meet Your <span className="gradient-text">AI Housing Assistant</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Experience how our AI assistant makes finding and scheduling viewings effortless.
            Try it out with some sample queries below!
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg mb-2 text-brand-600">Personalized Search</h3>
                <p className="text-gray-700">
                  Tell our AI what you're looking for in natural language, and it will find properties that match your exact criteria.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg mb-2 text-brand-600">Automated Scheduling</h3>
                <p className="text-gray-700">
                  Let the AI assistant schedule viewings automatically, saving you hours of back-and-forth communication.
                </p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <h3 className="font-semibold text-lg mb-2 text-brand-600">Real-time Updates</h3>
                <p className="text-gray-700">
                  Receive instant notifications when new properties match your criteria or when viewings are confirmed.
                </p>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDemo;
