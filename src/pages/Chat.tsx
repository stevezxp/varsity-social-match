import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { MoreVertical, UserX, Heart, UserCheck } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedUserName, setBlockedUserName] = useState('');
  const [isBlockedByCurrentUser, setIsBlockedByCurrentUser] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { matchId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  const profileName = location.state?.profileName || 'Your Match';

  useEffect(() => {
    let channel: any = null;

    const initializeChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        if (matchId) {
          await checkIfBlocked(session.user.id);
          await fetchMessages();
          channel = subscribeToMessages();
        }
      } else {
        navigate('/auth');
      }
    };

    initializeChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [navigate, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkIfBlocked = async (userId: string) => {
    if (!matchId) return;

    // Get the other user in the match
    const { data: matchData } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!matchData) return;

    const otherUserId = matchData.user1_id === userId ? matchData.user2_id : matchData.user1_id;

    // Check if current user blocked the other user
    const { data: blockedData } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('blocker_id', userId)
      .eq('blocked_id', otherUserId)
      .single();

    if (blockedData) {
      // Get the blocked user's profile name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', otherUserId)
        .single();

      setIsBlocked(true);
      setIsBlockedByCurrentUser(true);
      setBlockedUserName(profileData?.display_name || 'This user');
    } else {
      // Check if the other user blocked the current user
      const { data: blockedByOtherData } = await supabase
        .from('blocked_users')
        .select('*')
        .eq('blocker_id', otherUserId)
        .eq('blocked_id', userId)
        .single();

      if (blockedByOtherData) {
        setIsBlocked(true);
        setIsBlockedByCurrentUser(false);
        setBlockedUserName('This user');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!matchId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const subscribeToMessages = () => {
    if (!matchId) return null;

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        async (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return channel;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !matchId) return;

    setLoading(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } else {
      setNewMessage('');
    }

    setLoading(false);
  };

  const handleBlock = async () => {
    if (!user || !matchId) return;

    // Get the other user in the match
    const { data: matchData } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!matchData) return;

    const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id: otherUserId
      });

    if (!error) {
      setIsBlocked(true);
      setIsBlockedByCurrentUser(true);
      toast({
        title: "User blocked",
        description: "You won't see this user anymore.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnblock = async () => {
    if (!user || !matchId) return;

    // Get the other user in the match
    const { data: matchData } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!matchData) return;

    const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', otherUserId);

    if (!error) {
      setIsBlocked(false);
      setIsBlockedByCurrentUser(false);
      toast({
        title: "User unblocked",
        description: "You can now send messages to this user again.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to unblock user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnmatch = async () => {
    if (!user || !matchId) return;

    // Get the other user in the match first
    const { data: matchData } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!matchData) return;

    const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

    // Delete the match
    const { error: matchError } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (matchError) {
      toast({
        title: "Error",
        description: "Failed to unmatch. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Delete the mutual likes so they can appear in discover again
    const { error: likesError } = await supabase
      .from('likes')
      .delete()
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`);

    if (!likesError) {
      toast({
        title: "Unmatched",
        description: "You have unmatched with this person. They will appear in your discover again.",
      });
      navigate('/matches');
    } else {
      toast({
        title: "Error",
        description: "Failed to complete unmatch. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user || !matchId) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-2xl h-[calc(100vh-5rem)]">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/matches')}
                >
                  ← Back
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    💬 Chat with {profileName}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={handleUnmatch}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Unmatch
                    </DropdownMenuItem>
                    {isBlockedByCurrentUser ? (
                      <DropdownMenuItem 
                        onClick={handleUnblock}
                        className="text-green-600 hover:text-green-700"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Unblock User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        onClick={handleBlock}
                        className="text-red-600 hover:text-red-700"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Block User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {isBlocked && isBlockedByCurrentUser ? (
                <div className="text-center text-muted-foreground py-8">
                  <span className="text-4xl block mb-2">🚫</span>
                  <p className="text-lg font-semibold text-red-600">You blocked {blockedUserName}</p>
                  <p>You cannot send messages to this user.</p>
                  <Button 
                    onClick={handleUnblock}
                    variant="outline"
                    className="mt-4 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Unblock User
                  </Button>
                </div>
              ) : isBlocked && !isBlockedByCurrentUser ? (
                <div className="text-center text-muted-foreground py-8">
                  <span className="text-4xl block mb-2">🚫</span>
                  <p className="text-lg font-semibold text-red-600">This user has blocked you</p>
                  <p>You cannot send messages to this user.</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <span className="text-4xl block mb-2">👋</span>
                  <p>Start the conversation! Say hello to {profileName}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_id === user.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Message Input */}
            <div className="flex-shrink-0 border-t p-4">
              {isBlocked && isBlockedByCurrentUser ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>You cannot send messages because you blocked this user.</p>
                </div>
              ) : isBlocked && !isBlockedByCurrentUser ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>You cannot send messages because this user blocked you.</p>
                </div>
              ) : (
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button 
                    type="submit" 
                    disabled={loading || !newMessage.trim()}
                    className="tinder-button"
                  >
                    Send
                  </Button>
                </form>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;