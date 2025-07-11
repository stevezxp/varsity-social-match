import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const Matches = () => {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let channel: any = null;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchMatches(session.user.id);
        
        // Set up real-time subscription for matches
        channel = supabase
          .channel('matches-changes')
          .on('postgres_changes', { 
            event: 'DELETE', 
            schema: 'public', 
            table: 'matches' 
          }, () => {
            fetchMatches(session.user.id);
          })
          .subscribe();
      } else {
        navigate('/auth');
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate]);

  const fetchMatches = async (userId: string) => {
    setLoading(true);
    
    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('matched_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        setMatches([]);
        setLoading(false);
        return;
      }

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // Get all user IDs from matches
      const userIds = new Set<string>();
      matchesData.forEach(match => {
        userIds.add(match.user1_id);
        userIds.add(match.user2_id);
      });

      // Fetch all profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', Array.from(userIds));

      // Create a map for quick profile lookup
      const profileMap = new Map();
      profilesData?.forEach(profile => {
        profileMap.set(profile.user_id, profile);
      });

      // Format matches to show the other person's profile
      const formattedMatches = matchesData.map(match => {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        const otherProfile = profileMap.get(otherUserId);
        return {
          ...match,
          otherProfile
        };
      });

      setMatches(formattedMatches);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (matchId: string, profileName: string) => {
    navigate(`/chat/${matchId}`, { state: { profileName } });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Matches 🤝
            </h1>
            <p className="text-muted-foreground">
              People who liked you back! Start a conversation.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="tinder-card swipe-card">
                  <div className="p-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage 
                          src={match.otherProfile?.photo_urls?.[0] || undefined} 
                          alt={match.otherProfile?.display_name || 'Profile'} 
                        />
                        <AvatarFallback className="tinder-glow text-2xl">
                          {match.otherProfile?.display_name?.charAt(0).toUpperCase() || '📸'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {match.otherProfile?.display_name || 'Anonymous'}
                        </h3>
                        {match.otherProfile?.age && (
                          <p className="text-sm text-muted-foreground">
                            {match.otherProfile.age} years old
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {match.otherProfile?.university && (
                      <p className="text-sm text-muted-foreground mb-2">
                        📚 {match.otherProfile.university}
                      </p>
                    )}
                    
                    {match.otherProfile?.bio && (
                      <p className="text-sm text-foreground mb-4 line-clamp-2">
                        {match.otherProfile.bio}
                      </p>
                    )}
                    
                    <div className="text-xs text-muted-foreground mb-4">
                      Matched {new Date(match.matched_at).toLocaleDateString()}
                    </div>
                    
                    <Button 
                      onClick={() => handleStartChat(match.id, match.otherProfile?.display_name)}
                      className="w-full tinder-button"
                    >
                      💬 Start Chat
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12">
              <div className="text-6xl mb-4">💔</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No matches yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Keep swiping to find your perfect match!
              </p>
              <Button 
                onClick={() => navigate('/discover')}
                className="tinder-button"
              >
                Start Discovering
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Matches;