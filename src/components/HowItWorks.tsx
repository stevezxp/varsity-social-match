
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
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to find your perfect match
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-yellow-200 transform -translate-x-1/2 z-0"></div>
                )}
                
                <div className="relative z-10">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-yellow-400 flex items-center justify-center text-4xl relative">
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring"></div>
                    {step.icon}
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-yellow-500 bg-clip-text text-transparent font-bold text-lg mb-2">
                    Step {step.step}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            {user ? 'Continue Your Journey' : 'Get Started Today'}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
