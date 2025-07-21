
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-background to-orange-50 dark:from-gray-900 dark:via-background dark:to-gray-800 py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 love-gradient opacity-10"></div>
      
      {/* Premium floating bubbles */}
      <div className="absolute top-32 left-16 w-20 h-20 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full animate-float shadow-lg opacity-40" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-48 right-24 w-24 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full animate-float shadow-xl opacity-35" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-48 left-24 w-16 h-16 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full animate-float shadow-lg opacity-30" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-32 right-16 w-18 h-18 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full animate-float shadow-md opacity-25" style={{ animationDelay: '6s' }}></div>
      
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center bg-card/90 backdrop-blur-sm rounded-full px-8 py-4 mb-12 shadow-lg border border-pink-100 dark:border-pink-800">
            <span className="text-foreground font-medium">🎓 For University Students</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-12 leading-tight">
            Find Your
            <span className="block bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
              Perfect Match
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
            Connect with fellow students and young professionals in your area. 
            <span className="block mt-4 font-medium text-pink-600">
              "Home Away from Home" for your heart ❤️
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button 
            size="lg" 
            onClick={handleStartDating}
            className="love-button text-xl px-12 py-5 shadow-love hover:shadow-love-lg"
          >
            {user ? 'Continue Dating' : 'Start Dating Now'}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => scrollToSection('features')}
            className="border-border text-foreground hover:bg-card hover:text-pink-600 px-12 py-5 text-xl font-semibold rounded-full backdrop-blur-sm transition-all bg-card/50 shadow-md hover:shadow-lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
