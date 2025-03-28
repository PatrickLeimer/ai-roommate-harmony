import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

type TestimonialType = {
  id: number;
  name: string;
  role: string;
  location: string;
  rating: number;
  content: string;
  image: string;
};

const testimonialGroups = {
  students: [
    {
      id: 1,
      name: "Sarah J.",
      role: "Exchange Student",
      location: "Berlin",
      rating: 5,
      content: "As an international student, finding housing in a new city was overwhelming. FlatMate AI found me a cozy studio near my university within my budget in just two days!",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 2,
      name: "Alex T.",
      role: "Graduate Student",
      location: "London",
      rating: 5,
      content: "The lease analysis feature saved me from signing a contract with hidden fees. The AI assistant was incredibly helpful in explaining the terms in simple language.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
    },
    {
      id: 3,
      name: "Miguel R.",
      role: "PhD Student",
      location: "Barcelona",
      rating: 4,
      content: "The automated scheduling saved me so much time. I was able to book five viewings in different neighborhoods without making a single phone call.",
      image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ],
  professionals: [
    {
      id: 4,
      name: "Emma L.",
      role: "Software Engineer",
      location: "Amsterdam",
      rating: 5,
      content: "With my busy work schedule, FlatMate AI was a game changer. I could chat with the AI during breaks and had all my viewings lined up for the weekend.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 5,
      name: "Marcus C.",
      role: "Marketing Executive",
      location: "Paris",
      rating: 4,
      content: "I relocated for work and needed to find an apartment quickly. The AI understood my needs perfectly and found me a place that ticked all my boxes.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 6,
      name: "Sophia W.",
      role: "Healthcare Professional",
      location: "Dublin",
      rating: 5,
      content: "Working night shifts made apartment hunting nearly impossible before. Now I just message the AI anytime, and it handles everything for me.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ],
  travelers: [
    {
      id: 7,
      name: "Jack P.",
      role: "Digital Nomad",
      location: "Lisbon",
      rating: 5,
      content: "I move cities every few months. FlatMate AI has made finding short-term rentals so much easier. No more endless browsing through listings!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 8,
      name: "Nina K.",
      role: "Travel Blogger",
      location: "Bali",
      rating: 4,
      content: "Finding places that allow good internet for my work while traveling was always a challenge. The AI filters for all my specific needs perfectly.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 9,
      name: "Leo M.",
      role: "Remote Developer",
      location: "Mexico City",
      rating: 5,
      content: "As someone who lives in Airbnbs year-round, this tool has been revolutionary. It finds me better deals than I could find after hours of searching.",
      image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ]
};

export default function TestimonialsSection() {
  const [activeTab, setActiveTab] = useState<'students' | 'professionals' | 'travelers'>('students');
  
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} 
        fill={i < rating ? 'currentColor' : 'none'} 
      />
    ));
  };

  return (
    <section id="testimonials" className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2 
            className="text-base font-semibold text-primary tracking-wide uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Testimonials
          </motion.h2>
          <motion.p 
            className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Loved by users worldwide
          </motion.p>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            See how FlatMate AI is transforming the housing search experience for everyone.
          </motion.p>
        </div>

        {/* Testimonial Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
              <button 
                className={`testimonial-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('students')}
              >
                Students
              </button>
              <button 
                className={`testimonial-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'professionals' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('professionals')}
              >
                Professionals
              </button>
              <button 
                className={`testimonial-tab whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'travelers' 
                    ? 'text-primary border-primary' 
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('travelers')}
              >
                Digital Nomads
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                  {testimonialGroups[activeTab].map((testimonial) => (
                    <motion.div 
                      key={testimonial.id} 
                      className="p-6 bg-white rounded-lg shadow-sm mt-6 lg:mt-0 first:mt-0"
                      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center">
                        <img 
                          className="h-12 w-12 rounded-full" 
                          src={testimonial.image} 
                          alt={`${testimonial.name} testimonial`} 
                          width="48" 
                          height="48" 
                        />
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                          <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.location}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex text-yellow-400 mb-2">
                          {renderStars(testimonial.rating)}
                        </div>
                        <p className="text-gray-700 italic">
                          "{testimonial.content}"
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
