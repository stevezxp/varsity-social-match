
import React from 'react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 vh-gradient animate-gradient"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/20 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-20 w-16 h-16 bg-white/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
            <span className="text-white font-medium">🎓 For University Students</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your
            <span className="block bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Perfect Match
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with fellow students and young professionals in your area. 
            <span className="block mt-2 font-medium text-yellow-200">
              "Home Away from Home" for your heart ❤️
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            Start Dating Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
          >
            Learn More
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-white/80 text-sm">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-white/80 text-sm">Matches Daily</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-white/80 text-sm">Universities</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
