
import React, { useEffect, useState } from 'react';
import { MessageSquare, Search, CalendarCheck, Home } from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

const Step = ({ number, title, description, icon, delay }: StepProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-md primary-gradient text-white">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <dt className="text-lg leading-6 font-medium text-gray-900">
            <span className="text-brand-600 mr-2">Step {number}:</span>
            {title}
          </dt>
          <dd className="mt-2 text-base text-gray-600">
            {description}
          </dd>
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    
    const element = document.getElementById('how-it-works-section');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div id="how-it-works-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            How <span className="gradient-text">FlatMate AI</span> Works
          </h2>
          <p 
            className={`max-w-2xl mx-auto text-xl text-gray-600 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            Find your perfect home in just four simple steps.
          </p>
        </div>
        
        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
          <Step 
            number={1}
            title="Chat with AI Assistant"
            description="Tell our AI assistant what you're looking for in natural language. Share your preferences, budget, and location requirements."
            icon={<MessageSquare size={20} />}
            delay={100}
          />
          <Step 
            number={2}
            title="AI Searches for Matches"
            description="Our AI scans multiple listing platforms in real-time to find properties that match your exact criteria."
            icon={<Search size={20} />}
            delay={200}
          />
          <Step 
            number={3}
            title="Schedule Automated Viewings"
            description="Select properties you're interested in, and our AI will automatically schedule viewings at times that work for you."
            icon={<CalendarCheck size={20} />}
            delay={300}
          />
          <Step 
            number={4}
            title="Find Your Perfect Home"
            description="Visit properties, make your selection, and use our AI lease analysis to ensure you understand the terms before signing."
            icon={<Home size={20} />}
            delay={400}
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
