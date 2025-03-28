
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, Plane } from 'lucide-react';

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  image: string;
}

const TestimonialCard = ({ content, author, role, image }: TestimonialProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-500 hover:shadow-md">
      <div className="space-y-4">
        <div className="flex-shrink-0">
          <svg className="h-8 w-8 text-brand-400" fill="currentColor" viewBox="0 0 32 32">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
        </div>
        <p className="text-gray-600 leading-relaxed">{content}</p>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img 
              className="h-10 w-10 rounded-full object-cover"
              src={image} 
              alt={author}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{author}</h4>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [activeTab, setActiveTab] = useState("students");
  
  const studentTestimonials = [
    {
      content: "As an international student, finding affordable housing was a nightmare until I discovered FlatMate AI. It matched me with the perfect roommate and apartment within my budget.",
      author: "Sophia Chen",
      role: "Graduate Student, MIT",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "The AI chat assistant understood exactly what I was looking for and scheduled viewings automatically. Saved me countless hours during finals week!",
      author: "Marcus Johnson",
      role: "Undergraduate, NYU",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "Moving to a new city for school was intimidating, but FlatMate AI made the housing search process simple and stress-free.",
      author: "Emma Rodriguez",
      role: "PhD Student, Stanford",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const professionalTestimonials = [
    {
      content: "When I relocated for work, FlatMate AI found me a furnished apartment near my new office in just two days. The AI lease review feature saved me from a problematic contract.",
      author: "David Mitchell",
      role: "Software Engineer, Google",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "As someone who works long hours, I didn't have time to search through listings. FlatMate AI's automated scheduling feature found me viewings that worked with my calendar.",
      author: "Priya Sharma",
      role: "Investment Analyst, JP Morgan",
      image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "The comprehensive neighborhood reports helped me find a safe area with great amenities for my family. Worth every penny of the subscription.",
      author: "Michael Thompson",
      role: "Marketing Director, Salesforce",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  const travelerTestimonials = [
    {
      content: "As a digital nomad, I need flexible housing in different cities. FlatMate AI's short-term rental filter and verified listings have been a game-changer for my lifestyle.",
      author: "Lukas Weber",
      role: "Remote Designer",
      image: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "I travel for work constantly, and this platform has made it simple to find monthly rentals that feel like home, not just sterile hotel rooms.",
      author: "Jessica Kim",
      role: "Travel Blogger",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      content: "The AI understood my need for spaces with good internet and quiet work areas. It's like having a personal housing assistant who travels with me.",
      author: "Raj Patel",
      role: "Tech Consultant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Trusted by <span className="gradient-text">Thousands</span> of Happy Users
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-600">
            See how FlatMate AI has transformed the housing search experience for people just like you.
          </p>
        </div>
        
        <Tabs 
          defaultValue="students" 
          className="w-full" 
          onValueChange={setActiveTab}
        >
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="students" className="flex items-center space-x-2">
                <User size={16} />
                <span>Students</span>
              </TabsTrigger>
              <TabsTrigger value="professionals" className="flex items-center space-x-2">
                <Briefcase size={16} />
                <span>Professionals</span>
              </TabsTrigger>
              <TabsTrigger value="travelers" className="flex items-center space-x-2">
                <Plane size={16} />
                <span>Travelers</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent 
            value="students" 
            className={`transition-all duration-500 ${activeTab === 'students' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentTestimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                  role={testimonial.role}
                  image={testimonial.image}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent 
            value="professionals" 
            className={`transition-all duration-500 ${activeTab === 'professionals' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {professionalTestimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                  role={testimonial.role}
                  image={testimonial.image}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent 
            value="travelers" 
            className={`transition-all duration-500 ${activeTab === 'travelers' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {travelerTestimonials.map((testimonial, index) => (
                <TestimonialCard 
                  key={index}
                  content={testimonial.content}
                  author={testimonial.author}
                  role={testimonial.role}
                  image={testimonial.image}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Testimonials;
