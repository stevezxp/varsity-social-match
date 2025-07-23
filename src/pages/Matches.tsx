import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Heart, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  other_user: {
    id: string;
    user_id: string;
    display_name: string;
    photo_urls: string[] | null;
    bio: string | null;
    age: number | null;
    university: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
}

interface Like {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
  from_user: {
    id: string;
    user_id: string;
    display_name: string;
    photo_urls: string[] | null;
    bio: string | null;
    age: number | null;
    university: string | null;
  };
}

const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      fetchMatches();
      fetchLikes();
    }
  }, [currentUser]);

  const fetchMatches = async () => {
    if (!currentUser) return;

    try {
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, matched_at')
        .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
        .order('matched_at', { ascending: false });

      if (error) throw error;

      // Process matches to get the other user's profile
      const processedMatches = await Promise.all(
        (matchesData || []).map(async (match) => {
          const otherUserId = match.user1_id === currentUser.id ? match.user2_id : match.user1_id;
          
          const { data: otherUserProfile } = await supabase
            .from('profiles')
            .select('id, user_id, display_name, photo_urls, bio, age, university')
            .eq('user_id', otherUserId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...match,
            other_user: otherUserProfile,
            last_message: lastMessage
          };
        })
      );

      setMatches(processedMatches.filter(match => match.other_user));
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    }
  };

  const fetchLikes = async () => {
    if (!currentUser) return;

    try {
      const { data: likesData, error } = await supabase
        .from('likes')
        .select('id, from_user_id, to_user_id, created_at')
        .eq('to_user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process likes to get the sender's profile
      const processedLikes = await Promise.all(
        (likesData || []).map(async (like) => {
          const { data: fromUserProfile } = await supabase
            .from('profiles')
            .select('id, user_id, display_name, photo_urls, bio, age, university')
            .eq('user_id', like.from_user_id)
            .single();

          return {
            ...like,
            from_user: fromUserProfile
          };
        })
      );

      setLikes(processedLikes.filter(like => like.from_user));
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeBack = async (userId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('likes')
        .insert({
          from_user_id: currentUser.id,
          to_user_id: userId
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        throw error;
      }

      toast({
        title: "It's a Match! 🎉",
        description: "You've been matched! Start chatting now.",
      });

      // Refresh data
      fetchMatches();
      fetchLikes();
    } catch (error) {
      console.error('Error liking back:', error);
      toast({
        title: "Error",
        description: "Failed to like back",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Connections</h1>
            <p className="text-muted-foreground">
              Manage your matches and see who likes you
            </p>
          </div>

          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matches" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Matches ({matches.length})
              </TabsTrigger>
              <TabsTrigger value="likes" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Likes ({likes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="mt-6">
              {matches.length === 0 ? (
                <Card className="text-center p-12">
                  <div className="text-6xl mb-4">💕</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Matches Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start swiping to find your perfect match!
                  </p>
                  <Button onClick={() => navigate('/discover')} className="love-button">
                    Start Discovering
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((match) => (
                    <Card key={match.id} className="dating-card cursor-pointer hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage 
                              src={match.other_user.photo_urls?.[0]} 
                              alt={match.other_user.display_name}
                            />
                            <AvatarFallback>
                              {match.other_user.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {match.other_user.display_name}
                              {match.other_user.age && (
                                <span className="text-muted-foreground ml-2 font-normal">
                                  {match.other_user.age}
                                </span>
                              )}
                            </h3>
                            {match.other_user.university && (
                              <p className="text-sm text-muted-foreground">
                                {match.other_user.university}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Matched {new Date(match.matched_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {match.last_message && (
                          <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-foreground">
                              {match.last_message.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(match.last_message.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <Button 
                          onClick={() => navigate(`/chat/${match.id}`)}
                          className="w-full love-button"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {match.last_message ? 'Continue Chat' : 'Start Chat'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="likes" className="mt-6">
              {likes.length === 0 ? (
                <Card className="text-center p-12">
                  <div className="text-6xl mb-4">👀</div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Likes Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Keep swiping! Someone special is waiting to discover you.
                  </p>
                  <Button onClick={() => navigate('/discover')} className="love-button">
                    Keep Swiping
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {likes.map((like) => (
                    <Card key={like.id} className="dating-card">
                      <CardContent className="p-6 text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage 
                            src={like.from_user.photo_urls?.[0]} 
                            alt={like.from_user.display_name}
                          />
                          <AvatarFallback>
                            {like.from_user.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <h3 className="text-lg font-bold text-foreground mb-1">
                          {like.from_user.display_name}
                          {like.from_user.age && (
                            <span className="text-muted-foreground ml-2 font-normal">
                              {like.from_user.age}
                            </span>
                          )}
                        </h3>
                        
                        {like.from_user.university && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {like.from_user.university}
                          </p>
                        )}
                        
                        {like.from_user.bio && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {like.from_user.bio}
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mb-4">
                          Liked you {new Date(like.created_at).toLocaleDateString()}
                        </p>
                        
                        <Button 
                          onClick={() => handleLikeBack(like.from_user.user_id)}
                          className="w-full love-button"
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Like Back
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Matches;