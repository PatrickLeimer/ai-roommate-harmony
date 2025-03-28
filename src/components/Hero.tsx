
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.4" fill-rule="evenodd"%3E%3Ccircle cx="3" cy="3" r="3"/%3E%3Ccircle cx="13" cy="13" r="3"/%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className={`lg:col-span-6 text-center lg:text-left transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="block text-gray-900">Find Your Perfect</span>
              <span className="block gradient-text mt-1">Home with AI</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 sm:text-xl max-w-3xl">
              FlatMate AI uses artificial intelligence to help you find the perfect apartment and roommate match. 
              Search smarter, not harder.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white text-lg px-8 py-6 rounded-lg transition">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="border-brand-600 text-brand-600 hover:bg-brand-50 hover:text-brand-700 text-lg px-8 py-6 rounded-lg">
                Watch Demo
              </Button>
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                No credit card required • Free trial available
              </p>
            </div>
          </div>
          <div className={`mt-12 lg:mt-0 lg:col-span-6 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-w-5 aspect-h-3 bg-gradient-to-br from-brand-600 to-secondary-500 rounded-lg overflow-hidden">
                <div className="flex items-center justify-center p-8">
                  <div className="bg-white/95 rounded-lg shadow-lg p-4 w-full max-w-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-brand-600 font-semibold">FlatMate AI Assistant</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Online
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm max-w-xs ml-auto">
                        I need a 2-bedroom apartment near downtown under $1,800.
                      </div>
                      <div className="bg-brand-50 rounded-lg p-3 text-gray-800 text-sm max-w-xs">
                        I'll help you find that! What amenities are most important to you?
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 text-gray-700 text-sm max-w-xs ml-auto">
                        I need parking and prefer in-unit laundry.
                      </div>
                      <div className="bg-brand-50 rounded-lg p-3 text-gray-800 text-sm max-w-xs">
                        Searching for options now... I've found 3 matches!
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type your housing needs..."
                          className="w-full border-gray-300 focus:ring-brand-500 focus:border-brand-500 rounded-md shadow-sm py-2 pl-3 pr-10"
                        />
                        <button className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-600">
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
