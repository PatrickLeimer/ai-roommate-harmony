
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, X } from 'lucide-react';

interface PricingPlanProps {
  title: string;
  price: string;
  description: string;
  features: Array<{
    text: string;
    included: boolean;
  }>;
  buttonText: string;
  isPopular?: boolean;
  annualPrice?: string;
  isBilledAnnually: boolean;
}

const PricingPlan = ({
  title,
  price,
  description,
  features,
  buttonText,
  isPopular,
  annualPrice,
  isBilledAnnually
}: PricingPlanProps) => {
  return (
    <div className={`
      rounded-2xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1
      ${isPopular 
        ? 'ring-2 ring-brand-600 shadow-lg bg-white' 
        : 'border border-gray-200 shadow-sm bg-white'}
    `}>
      {isPopular && (
        <div className="bg-brand-600 text-white text-center py-2 font-medium text-sm">
          Most Popular
        </div>
      )}
      
      <div className="p-8">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="mt-4 flex items-baseline text-gray-900">
          <span className="text-4xl font-extrabold tracking-tight">
            {isBilledAnnually && annualPrice ? annualPrice : price}
          </span>
          <span className="ml-1 text-xl font-semibold">/month</span>
        </div>
        {isBilledAnnually && (
          <p className="text-sm text-brand-600 font-medium mt-1">Billed annually</p>
        )}
        <p className="mt-5 text-gray-500">{description}</p>
        
        <ul className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                {feature.included ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <p className={`ml-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                {feature.text}
              </p>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <Button 
            className={`w-full py-6 ${
              isPopular 
                ? 'bg-brand-600 hover:bg-brand-700 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const freePlanFeatures = [
    { text: 'Basic property search', included: true },
    { text: 'Limited AI chat assistance', included: true },
    { text: '5 listings saves', included: true },
    { text: 'Email notifications', included: true },
    { text: 'Automated viewings', included: false },
    { text: 'Advanced filters', included: false },
    { text: 'Lease analysis', included: false },
    { text: 'Priority support', included: false },
  ];
  
  const proPlanFeatures = [
    { text: 'Advanced property search', included: true },
    { text: 'Unlimited AI chat assistance', included: true },
    { text: 'Unlimited listings saves', included: true },
    { text: 'Real-time notifications', included: true },
    { text: 'Automated viewings scheduling', included: true },
    { text: 'Advanced filters & sorting', included: true },
    { text: 'Basic lease analysis', included: true },
    { text: 'Standard support', included: true },
  ];
  
  const premiumPlanFeatures = [
    { text: 'Premium property search', included: true },
    { text: 'Priority AI chat assistance', included: true },
    { text: 'Unlimited listings saves', included: true },
    { text: 'Real-time notifications', included: true },
    { text: 'Automated viewings scheduling', included: true },
    { text: 'Advanced filters & sorting', included: true },
    { text: 'Advanced lease analysis', included: true },
    { text: 'Priority 24/7 support', included: true },
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            Choose the plan that works best for your housing search needs.
          </p>
          
          <div className="flex items-center justify-center mt-8">
            <span className={`mr-3 text-sm ${billingCycle === 'monthly' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'annually'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
            />
            <span className={`ml-3 text-sm ${billingCycle === 'annually' ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              Annually <span className="text-brand-600 font-semibold">Save 20%</span>
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingPlan
            title="Free Trial"
            price="$0"
            annualPrice="$0"
            description="Perfect for getting started with basic search features."
            features={freePlanFeatures}
            buttonText="Start Free Trial"
            isBilledAnnually={billingCycle === 'annually'}
          />
          
          <PricingPlan
            title="Pro"
            price="$19.99"
            annualPrice="$15.99"
            description="Everything you need for a successful housing search."
            features={proPlanFeatures}
            buttonText="Get Pro Plan"
            isPopular={true}
            isBilledAnnually={billingCycle === 'annually'}
          />
          
          <PricingPlan
            title="Premium"
            price="$39.99"
            annualPrice="$31.99"
            description="Premium features for the most demanding housing needs."
            features={premiumPlanFeatures}
            buttonText="Get Premium Plan"
            isBilledAnnually={billingCycle === 'annually'}
          />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            All plans include a 7-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
