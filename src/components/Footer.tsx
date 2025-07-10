
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/assets/varsity-heights-logo.png';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src={logoImage} 
                alt="Varsity Heights Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h3 className="text-2xl font-bold">Varsity Heights Dating</h3>
                <p className="text-gray-400 text-sm">Home Away from Home</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md">
              Connecting university students and young professionals to build meaningful relationships within the campus community.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                📘
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors">
                📷
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                🐦
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Safety Center</a></li>
              <li>
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Contact Creator
                </button>
              </li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Support</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Help Center
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')}
                  className="text-gray-300 hover:text-white transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Varsity Heights Dating. Created by Stephen RJ.
            </p>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <a href="tel:+263778031727" className="hover:text-white transition-colors">
                  📱 +263778031727
                </a>
                <a href="mailto:stephennyams2002@gmail.com" className="hover:text-white transition-colors">
                  📧 Email
                </a>
                <a href="https://instagram.com/stephen_r.j" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  📸 @stephen_r.j
                </a>
              </div>
              <span className="text-gray-400 text-sm">Made with ❤️ for students</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
