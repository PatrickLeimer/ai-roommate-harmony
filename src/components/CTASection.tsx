
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <div className="primary-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Start Finding Your Perfect Home Today
          </h2>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto mb-10">
            Join thousands of satisfied users who found their ideal living space with FlatMate AI. 
            Our AI-powered platform makes finding your next home effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-brand-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 rounded-lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
