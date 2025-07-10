
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartDating = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Background gradient */}
      <div className="absolute inset-0 love-gradient opacity-10"></div>
      
      {/* Premium floating bubbles */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full animate-float shadow-lg opacity-80" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full animate-float shadow-xl opacity-70" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float shadow-lg opacity-75" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-orange-300 to-red-300 rounded-full animate-float shadow-md opacity-60" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-28 h-28 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full animate-float shadow-lg opacity-50" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/4 left-1/2 w-18 h-18 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full animate-float shadow-md opacity-65" style={{ animationDelay: '5s' }}></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border border-pink-100">
            <span className="text-gray-800 font-medium">🎓 For University Students</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
            Find Your
            <span className="block bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Perfect Match
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with fellow students and young professionals in your area. 
            <span className="block mt-2 font-medium text-pink-600">
              "Home Away from Home" for your heart ❤️
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button 
            size="lg" 
            onClick={handleStartDating}
            className="love-button text-lg px-8 py-4 shadow-love hover:shadow-love-lg"
          >
            {user ? 'Continue Dating' : 'Start Dating Now'}
          </button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => scrollToSection('features')}
            className="border-gray-300 text-gray-700 hover:bg-white hover:text-pink-600 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm transition-all bg-white/50 shadow-md hover:shadow-lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
