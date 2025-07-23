import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import logoImage from '@/assets/varsity-heights-logo.png';

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { label: 'Features', action: () => scrollToSection('features') },
    { label: 'How It Works', action: () => scrollToSection('how-it-works') },
    { label: 'Safety', action: () => scrollToSection('safety') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src={logoImage} 
              alt="Varsity Heights Logo" 
              className="w-10 h-10 rounded-lg"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Varsity Heights</h1>
              <p className="text-xs text-muted-foreground">Home Away from Home</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  Profile
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-border hover:bg-accent"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="love-button"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Join Now
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-left text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex justify-center pb-2">
                  <ThemeToggle />
                </div>
                {user ? (
                  <>
                    <Button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      Profile
                    </Button>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      className="w-full justify-start border-border hover:bg-accent"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-foreground hover:text-primary"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                      className="w-full love-button"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;