
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-yellow-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">VH</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Varsity Heights</h1>
            <p className="text-xs text-gray-600">Dating</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
          <a href="#safety" className="text-gray-600 hover:text-blue-600 transition-colors">Safety</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
        </nav>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
            Login
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
