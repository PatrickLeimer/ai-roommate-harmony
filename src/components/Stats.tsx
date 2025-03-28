
import React, { useEffect, useState } from 'react';
import { Users, Buildings, CalendarCheck, Clock } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const StatItem = ({ icon, value, label, delay }: StatItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`text-center transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-full text-brand-600 mb-4">
        {icon}
      </div>
      <p className="text-4xl font-bold gradient-text mb-2">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
};

const Stats = () => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <StatItem 
            icon={<Users size={28} />}
            value="10,000+"
            label="Happy Users"
            delay={100}
          />
          <StatItem 
            icon={<Buildings size={28} />}
            value="25,000+"
            label="Properties Listed"
            delay={200}
          />
          <StatItem 
            icon={<CalendarCheck size={28} />}
            value="5,000+"
            label="Viewings Scheduled"
            delay={300}
          />
          <StatItem 
            icon={<Clock size={28} />}
            value="120+ hrs"
            label="Time Saved per User"
            delay={400}
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
