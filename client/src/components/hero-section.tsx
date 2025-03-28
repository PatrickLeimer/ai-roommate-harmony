import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 lg:pt-40 lg:pb-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.h1 
              className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-5xl lg:mt-6 xl:text-6xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span>Find Your Perfect Home with</span>
              <span className="text-primary block">AI-Powered Precision</span>
            </motion.h1>
            <motion.p 
              className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg lg:text-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              FlatMate AI streamlines your housing search with intelligent matching, automated viewings, and expert lease analysis. Discover homes that truly fit your lifestyle.
            </motion.p>
            <motion.div 
              className="mt-8 sm:mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="rounded-md shadow">
                <a href="#chat" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10">
                  Try AI Assistant
                </a>
              </div>
              <div className="mt-3">
                <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Learn More
                </a>
              </div>
            </motion.div>
          </div>
          <motion.div 
            className="mt-12 relative lg:mt-0 lg:col-span-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="bg-primary-50 rounded-xl shadow-lg overflow-hidden">
              <img 
                className="w-full h-auto object-cover" 
                src="https://images.unsplash.com/photo-1584738766473-61c083514bf4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Modern apartment interior" 
                width="600" 
                height="400"
              />
              {/* AI Chat Bubble overlay */}
              <motion.div 
                className="absolute top-8 right-8 bg-white rounded-lg shadow-lg p-4 max-w-xs"
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-800">I found 3 apartments in Berlin matching your budget and requirements!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* Abstract Shapes Background */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 transform opacity-10">
        <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
          <defs>
            <pattern id="pattern1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-primary" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="404" fill="url(#pattern1)" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 transform opacity-10">
        <svg width="404" height="404" fill="none" viewBox="0 0 404 404">
          <defs>
            <pattern id="pattern2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" className="text-green-500" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="404" height="404" fill="url(#pattern2)" />
        </svg>
      </div>
    </section>
  );
}
