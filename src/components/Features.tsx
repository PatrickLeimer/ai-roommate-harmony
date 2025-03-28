
import React, { useEffect, useState } from 'react';
import { Search, Zap, Shield, FileText } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-700 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="p-6">
        <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-lg text-brand-600 mb-5">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
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
    
    const element = document.getElementById('features-section');
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
    <div id="features-section" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className={`text-3xl sm:text-4xl font-bold mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <span className="gradient-text">Smart Features</span> for Smart Home Finding
          </h2>
          <p 
            className={`max-w-2xl mx-auto text-xl text-gray-600 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            Our AI-powered platform makes finding your ideal home effortless with these powerful tools.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Search size={24} />}
            title="Unified Search"
            description="Our AI scans multiple listing platforms to find the perfect match for your unique preferences."
            delay={100}
          />
          <FeatureCard 
            icon={<Zap size={24} />}
            title="Instant Alerts"
            description="Get real-time notifications when new listings match your criteria before anyone else."
            delay={200}
          />
          <FeatureCard 
            icon={<Shield size={24} />}
            title="Trusted Security"
            description="Every listing is verified to ensure you're connecting with legitimate properties and roommates."
            delay={300}
          />
          <FeatureCard 
            icon={<FileText size={24} />}
            title="Lease Analysis"
            description="Our AI reviews lease agreements to highlight important terms and potential concerns."
            delay={400}
          />
        </div>
      </div>
    </div>
  );
};

export default Features;
