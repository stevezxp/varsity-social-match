import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  photo_urls: string[] | null;
}

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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
    if (!matchId || !currentUser) return;

    fetchMatch();
    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId, currentUser]);

  const fetchMatch = async () => {
    if (!matchId || !currentUser) return;

    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      setMatch(matchData);

      // Get the other user's profile
      const otherUserId = matchData.user1_id === currentUser.id ? matchData.user2_id : matchData.user1_id;
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', otherUserId)
        .single();

      if (profileError) throw profileError;

      setOtherUserProfile(profileData);
    } catch (error) {
      console.error('Error fetching match:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!matchId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId || !currentUser || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: currentUser.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!match || !otherUserProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="text-center p-12">
              <div className="text-6xl mb-4">😞</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Chat Not Found
              </h3>
              <p className="text-muted-foreground mb-4">
                This chat doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/matches')}>
                Back to Matches
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
        <div className="container mx-auto max-w-4xl">
          {/* Chat Header */}
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center space-y-0 pb-4">
              <Button
                onClick={() => navigate('/matches')}
                variant="ghost"
                size="sm"
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage 
                  src={otherUserProfile.photo_urls?.[0]} 
                  alt={otherUserProfile.display_name}
                />
                <AvatarFallback>
                  {otherUserProfile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {otherUserProfile.display_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Matched on {new Date(match.matched_at).toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-muted-foreground">
                      Start the conversation! Say hello to {otherUserProfile.display_name}
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender_id === currentUser?.id
                            ? 'chat-bubble-sent'
                            : 'chat-bubble-received'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === currentUser?.id 
                            ? 'text-white/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="love-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;