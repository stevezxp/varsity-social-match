
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const HowItWorks = () => {
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

  const steps = [
    {
      step: "01",
      title: "Sign Up",
      description: "Create your profile with your university email and get verified",
      icon: "📝"
    },
    {
      step: "02", 
      title: "Discover",
      description: "Browse profiles of students from your campus and nearby universities",
      icon: "👀"
    },
    {
      step: "03",
      title: "Match",
      description: "Swipe right on profiles you like and get matched instantly",
      icon: "💕"
    },
    {
      step: "04",
      title: "Connect",
      description: "Start chatting and plan your first campus date together",
      icon: "💬"
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="how-it-works" className="py-32 bg-gradient-to-b from-pink-50 dark:from-gray-800 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-24">
          <h2 className="text-5xl font-bold text-foreground mb-8">
            How It Works
          </h2>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Getting started is easy. Follow these simple steps to find your perfect match
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative p-6">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-pink-200 to-orange-200 transform -translate-x-1/2 z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className="w-36 h-36 mx-auto mb-8 rounded-full love-gradient flex items-center justify-center text-5xl relative shadow-love">
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring"></div>
                    {step.icon}
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent font-bold text-xl mb-4">
                    Step {step.step}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-24">
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="love-button text-xl px-12 py-5 shadow-love hover:shadow-love-lg"
          >
            {user ? 'Continue Your Journey' : 'Get Started Today'}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
