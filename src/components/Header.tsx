
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useNotifications } from '@/hooks/useNotifications';
import logoImage from '@/assets/varsity-heights-logo.png';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize notifications
  useNotifications(user?.id || null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    // If not on index page, navigate there first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logoImage} 
            alt="Varsity Heights Logo" 
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">VARSITY HEIGHTS</h1>
            <p className="text-xs text-gray-600">Home away from home</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => scrollToSection('features')} 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('safety')} 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Safety
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => navigate('/contact')} 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Contact
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-muted-foreground text-sm hidden md:block">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-primary"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-primary"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="love-button px-6"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
