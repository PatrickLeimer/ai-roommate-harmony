import { Link } from "wouter";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon,
  HomeIcon
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center mr-2">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">FlatMate <span className="text-primary">AI</span></span>
            </div>
            <p className="mt-4 text-gray-400 text-sm">
              AI-powered home search platform that revolutionizes the way you find your next place to live.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white text-sm">AI Search</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white text-sm">Smart Scheduling</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white text-sm">Lease Analysis</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white text-sm">Verified Listings</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Help Center</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Rental Guides</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Moving Tips</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">FAQ</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Get in Touch</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Contact Us</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Support</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white text-sm">Career</a></Link></li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} FlatMate AI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/"><a className="text-gray-400 hover:text-white text-sm">Privacy Policy</a></Link>
            <Link href="/"><a className="text-gray-400 hover:text-white text-sm">Terms of Service</a></Link>
            <Link href="/"><a className="text-gray-400 hover:text-white text-sm">Cookie Policy</a></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
