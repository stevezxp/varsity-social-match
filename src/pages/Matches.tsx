import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchMatches(session.user.id);
      } else {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const fetchMatches = async (userId: string) => {
    setLoading(true);
    
    const { data } = await supabase
      .from('matches')
      .select(`
        id,
        matched_at,
        user1_id,
        user2_id,
        user1_profile:profiles!matches_user1_id_fkey(*),
        user2_profile:profiles!matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('matched_at', { ascending: false });

    // Format matches to show the other person's profile
    const formattedMatches = data?.map(match => {
      const otherProfile = match.user1_id === userId ? match.user2_profile : match.user1_profile;
      return {
        ...match,
        otherProfile
      };
    }) || [];

    setMatches(formattedMatches);
    setLoading(false);
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
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-yellow-400 flex items-center justify-center">
                    <span className="text-6xl">📸</span>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {match.otherProfile?.display_name || 'Anonymous'}
                    </h3>
                    
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
                      className="w-full bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600"
                    >
                      💬 Start Chat
                    </Button>
                  </CardContent>
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
                className="bg-gradient-to-r from-blue-500 to-yellow-500 hover:from-blue-600 hover:to-yellow-600"
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