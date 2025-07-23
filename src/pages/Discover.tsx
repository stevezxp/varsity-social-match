import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, GraduationCap, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import PhotoCarousel from '@/components/PhotoCarousel';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  age: number | null;
  university: string | null;
  course: string | null;
  interests: string[] | null;
  photo_urls: string[] | null;
  location: string | null;
  gender: string | null;
}

const Discover = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'pass' | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUser(user);
    };

    getCurrentUser();
  }, [navigate]);

  useEffect(() => {
    if (currentUser) {
      fetchProfiles();
    }
  }, [currentUser]);

  const fetchProfiles = async () => {
    if (!currentUser) return;

    try {
      // Get users that current user hasn't liked or been liked by
      const { data: likedUsers } = await supabase
        .from('likes')
        .select('to_user_id')
        .eq('from_user_id', currentUser.id);

      const { data: blockedUsers } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', currentUser.id);

      const likedUserIds = likedUsers?.map(like => like.to_user_id) || [];
      const blockedUserIds = blockedUsers?.map(block => block.blocked_id) || [];
      const excludedIds = [...likedUserIds, ...blockedUserIds, currentUser.id];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, bio, age, university, course, interests, photo_urls, location, gender')
        .not('user_id', 'in', `(${excludedIds.join(',')})`)
        .not('photo_urls', 'is', null)
        .limit(10);

      if (error) throw error;

      // Filter out profiles with no photos
      const validProfiles = (data || []).filter(profile => 
        profile.photo_urls && profile.photo_urls.length > 0
      );

      setProfiles(validProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (swiping || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    if (!currentProfile || !currentUser) return;

    setSwiping(true);
    setSwipeDirection(direction);

    try {
      if (direction === 'like') {
        const { error } = await supabase
          .from('likes')
          .insert({
            from_user_id: currentUser.id,
            to_user_id: currentProfile.user_id
          });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
          throw error;
        }

        // Check if it's a match
        const { data: mutualLike } = await supabase
          .from('likes')
          .select('id')
          .eq('from_user_id', currentProfile.user_id)
          .eq('to_user_id', currentUser.id)
          .single();

        if (mutualLike) {
          toast({
            title: "It's a Match! 🎉",
            description: `You and ${currentProfile.display_name} liked each other!`,
          });
        }
      }

      // Animate card out
      if (cardRef.current) {
        cardRef.current.style.transform = direction === 'like' 
          ? 'translateX(100%) rotate(15deg)' 
          : 'translateX(-100%) rotate(-15deg)';
        cardRef.current.style.opacity = '0';
      }

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwiping(false);
        setSwipeDirection(null);
        
        if (cardRef.current) {
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '1';
        }
      }, 300);

    } catch (error) {
      console.error('Error handling swipe:', error);
      toast({
        title: "Error",
        description: "Failed to process swipe",
        variant: "destructive",
      });
      setSwiping(false);
      setSwipeDirection(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Finding amazing people...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4">
          <div className="container mx-auto max-w-md">
            <Card className="text-center p-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You're All Caught Up!
              </h3>
              <p className="text-muted-foreground mb-4">
                Check back later for more profiles to discover.
              </p>
              <Button onClick={() => navigate('/matches')} className="love-button">
                View Your Matches
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Discover</h1>
            <p className="text-muted-foreground">
              {profiles.length - currentIndex} people nearby
            </p>
          </div>

          {/* Profile Card */}
          <div className="relative">
            <Card 
              ref={cardRef}
              className="profile-card overflow-hidden transition-all duration-300"
              style={{ height: '600px' }}
            >
              {/* Swipe Overlays */}
              {swipeDirection === 'like' && (
                <div className="swipe-like z-10">LIKE</div>
              )}
              {swipeDirection === 'pass' && (
                <div className="swipe-nope z-10">NOPE</div>
              )}

              {/* Photo Carousel */}
              <div className="relative h-2/3">
                <PhotoCarousel 
                  photos={currentProfile.photo_urls || []} 
                  className="w-full h-full"
                />
              </div>

              {/* Profile Info */}
              <CardContent className="p-6 h-1/3 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {currentProfile.display_name}
                    {currentProfile.age && (
                      <span className="text-muted-foreground ml-2">
                        {currentProfile.age}
                      </span>
                    )}
                  </h2>
                </div>

                {currentProfile.bio && (
                  <p className="text-muted-foreground mb-3 text-sm">
                    {currentProfile.bio}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {currentProfile.university && (
                    <div className="flex items-center text-muted-foreground">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {currentProfile.university}
                      {currentProfile.course && ` • ${currentProfile.course}`}
                    </div>
                  )}
                  
                  {currentProfile.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {currentProfile.location}
                    </div>
                  )}
                </div>

                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {currentProfile.interests.slice(0, 6).map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-8 mt-6">
              <Button
                onClick={() => handleSwipe('pass')}
                disabled={swiping}
                size="lg"
                variant="outline"
                className="w-16 h-16 rounded-full border-2 border-red-200 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <X className="h-8 w-8 text-red-500" />
              </Button>
              
              <Button
                onClick={() => handleSwipe('like')}
                disabled={swiping}
                size="lg"
                className="w-16 h-16 rounded-full love-button"
              >
                <Heart className="h-8 w-8" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;