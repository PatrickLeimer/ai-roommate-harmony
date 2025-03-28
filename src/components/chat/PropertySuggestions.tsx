
import React from 'react';
import { Button } from '@/components/ui/button';
import { DollarSign, Map, Calendar } from 'lucide-react';
import { PropertySuggestion } from '@/services/chatService';

interface PropertySuggestionsProps {
  propertySuggestions: PropertySuggestion[];
  scheduleViewing: (propertyId: string) => void;
}

const PropertySuggestions = ({ propertySuggestions, scheduleViewing }: PropertySuggestionsProps) => {
  return (
    <div className="mb-4">
      <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
        <p className="font-medium mb-2">I found these properties matching your criteria:</p>
        <div className="space-y-3">
          {propertySuggestions.map((property) => (
            <div key={property.id} className="flex border border-gray-100 rounded-md overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-20 h-20 object-cover"
              />
              <div className="p-2 flex-1">
                <h4 className="font-medium text-sm">{property.title}</h4>
                <div className="flex justify-between text-xs mt-1">
                  <span className="flex items-center text-gray-600">
                    <DollarSign size={12} className="mr-1" />
                    {property.price}
                  </span>
                  <span className="flex items-center text-gray-600">
                    <Map size={12} className="mr-1" />
                    {property.location}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {property.beds} bed • {property.baths} bath
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-brand-600 text-brand-600"
                    onClick={() => scheduleViewing(property.id)}
                  >
                    <Calendar size={12} className="mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertySuggestions;
