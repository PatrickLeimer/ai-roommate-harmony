
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold gradient-text">
              FlatMate AI
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="font-medium text-gray-700 hover:text-brand-600 transition">
              Home
            </Link>
            <Link to="/features" className="font-medium text-gray-700 hover:text-brand-600 transition">
              Features
            </Link>
            <Link to="/pricing" className="font-medium text-gray-700 hover:text-brand-600 transition">
              Pricing
            </Link>
            <Link to="/about" className="font-medium text-gray-700 hover:text-brand-600 transition">
              About
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              className="border-brand-600 text-brand-600 hover:bg-brand-50 hover:text-brand-700"
            >
              Login
            </Button>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white">
              Get Started
            </Button>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-brand-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5 space-x-3">
              <Button 
                variant="outline" 
                className="w-full border-brand-600 text-brand-600 hover:bg-brand-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Button>
            </div>
            <div className="mt-3 px-5 mb-3">
              <Button 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
