import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const Discover = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userGender, setUserGender] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserGender(session.user.id);
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const fetchUserGender = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('gender')
      .eq('user_id', userId)
      .single();
    
    if (data?.gender) {
      setUserGender(data.gender);
      fetchProfiles(userId, data.gender);
    } else {
      // If user hasn't set gender, redirect to profile completion
      navigate('/profile');
    }
  };

  const fetchProfiles = async (userId: string, currentUserGender: string) => {
    setLoading(true);
    
    // Determine opposite gender for filtering
    const targetGender = currentUserGender === 'male' ? 'female' : 'male';
    
    // Get profiles excluding the current user and people already liked
    const { data: likedUsers } = await supabase
      .from('likes')
      .select('to_user_id')
      .eq('from_user_id', userId);

    const excludedIds = [userId, ...(likedUsers?.map(l => l.to_user_id) || [])];

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .not('user_id', 'in', `(${excludedIds.join(',')})`)
      .eq('gender', targetGender)
      .limit(10);

    setProfiles(data || []);
    setCurrentIndex(0);
    setLoading(false);
  };

  const handleLike = async (liked: boolean) => {
    if (!user || currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    if (liked) {
      const { error } = await supabase
        .from('likes')
        .insert({
          from_user_id: user.id,
          to_user_id: currentProfile.user_id
        });

      if (!error) {
        toast({
          title: "Liked! 💕",
          description: "You liked this person. If they like you back, it's a match!"
        });
      }
    }

    // Move to next profile
    if (currentIndex + 1 >= profiles.length) {
      // Fetch more profiles
      if (userGender) {
        fetchProfiles(user.id, userGender);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentProfile = profiles[currentIndex];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Discover People ✨
            </h1>
            <p className="text-muted-foreground">
              {userGender && `Showing ${userGender === 'male' ? 'female' : 'male'} profiles • `}
              Swipe to find your perfect campus connection
            </p>
          </div>

          {loading ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Finding amazing people...</p>
              </div>
            </Card>
          ) : currentProfile ? (
            <Card className="overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-blue-400 to-yellow-400 flex items-center justify-center">
                <span className="text-6xl">📸</span>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {currentProfile.display_name}
                    </h2>
                    {currentProfile.age && (
                      <p className="text-muted-foreground">
                        {currentProfile.age} years old
                      </p>
                    )}
                  </div>
                  {currentProfile.verified_student && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      ✓ Verified Student
                    </Badge>
                  )}
                </div>

                {currentProfile.university && (
                  <p className="text-sm text-muted-foreground mb-2">
                    📚 {currentProfile.university}
                  </p>
                )}

                {currentProfile.course && (
                  <p className="text-sm text-muted-foreground mb-2">
                    🎓 {currentProfile.course}
                  </p>
                )}

                {currentProfile.location && (
                  <p className="text-sm text-muted-foreground mb-4">
                    📍 {currentProfile.location}
                  </p>
                )}

                {currentProfile.bio && (
                  <p className="text-foreground mb-4">
                    {currentProfile.bio}
                  </p>
                )}

                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.interests.map((interest: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleLike(false)}
                    variant="outline"
                    size="lg"
                    className="flex-1 h-12 text-lg"
                  >
                    👎 Pass
                  </Button>
                  <Button
                    onClick={() => handleLike(true)}
                    size="lg"
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                  >
                    💕 Like
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🎉</span>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  You're all caught up!
                </h3>
                <p className="text-muted-foreground mb-4">
                  No new profiles to show right now.
                </p>
                <Button onClick={() => userGender && fetchProfiles(user.id, userGender)}>
                  Refresh
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;