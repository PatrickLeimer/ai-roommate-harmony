import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
    { href: "#chat", label: "Chat Demo" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">FlatMate <span className="text-primary">AI</span></span>
              </a>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* Authentication Buttons */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:block text-sm text-gray-700">
                  Welcome, <span className="font-medium">{user.username}</span>
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="ml-4">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden ml-4">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>FlatMate AI</SheetTitle>
                    <SheetDescription>
                      Smart housing & roommate matching platform
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-base font-medium text-gray-900 hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </a>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      {user ? (
                        <>
                          <p className="text-sm text-gray-700 mb-4">
                            Signed in as <span className="font-medium">{user.username}</span>
                          </p>
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                          >
                            Log out
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <Link href="/auth">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setIsOpen(false)}
                            >
                              Log in
                            </Button>
                          </Link>
                          <Link href="/auth">
                            <Button
                              className="w-full"
                              onClick={() => setIsOpen(false)}
                            >
                              Get Started
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
