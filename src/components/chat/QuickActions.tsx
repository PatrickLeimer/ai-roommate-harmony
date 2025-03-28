
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Building, DollarSign, Calendar } from 'lucide-react';

interface QuickActionsProps {
  setInputValue: (value: string) => void;
}

const QuickActions = ({ setInputValue }: QuickActionsProps) => {
  return (
    <div className="flex overflow-x-auto p-2 border-t border-gray-100 gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap text-xs h-8"
        onClick={() => setInputValue("I'm looking for a 2-bedroom apartment")}
      >
        <Home size={12} className="mr-1" /> 2-Bedroom
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap text-xs h-8"
        onClick={() => setInputValue("I need a pet-friendly rental")}
      >
        <Building size={12} className="mr-1" /> Pet-friendly
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap text-xs h-8"
        onClick={() => setInputValue("My budget is $1500/month")}
      >
        <DollarSign size={12} className="mr-1" /> Budget $1500
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap text-xs h-8"
        onClick={() => setInputValue("Schedule apartment viewings this weekend")}
      >
        <Calendar size={12} className="mr-1" /> Weekend viewings
      </Button>
    </div>
  );
};

export default QuickActions;
