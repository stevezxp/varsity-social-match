import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ matches: 0, likes: 0, chats: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    setProfile(data);
    
    if (data) {
      await fetchStats(userId);
    }
  };

  const fetchStats = async (userId: string) => {
    // Fetch matches count
    const { data: matchesData } = await supabase
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Fetch likes count (likes sent)
    const { data: likesData } = await supabase
      .from('likes')
      .select('id')
      .eq('from_user_id', userId);

    // Fetch chats count (unique matches with messages)
    const { data: chatsData } = await supabase
      .from('messages')
      .select('match_id')
      .eq('sender_id', userId);

    const uniqueChats = new Set(chatsData?.map(chat => chat.match_id) || []);

    setStats({
      matches: matchesData?.length || 0,
      likes: likesData?.length || 0,
      chats: uniqueChats.size
    });
  };

  const quickActions = [
    {
      title: 'Discover People',
      description: 'Start swiping to find your perfect match',
      action: () => navigate('/discover'),
      icon: '💕',
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'Your Matches',
      description: 'See who liked you back',
      action: () => navigate('/matches'),
      icon: '🤝',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      title: 'Messages',
      description: 'Chat with your connections',
      action: () => navigate('/matches'),
      icon: '💬',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Edit Profile',
      description: 'Update your photos and info',
      action: () => navigate('/profile'),
      icon: '👤',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to make meaningful connections on campus?
            </p>
          </div>

          {/* Profile Setup Alert */}
          {!profile && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800">Complete Your Profile</h3>
                    <p className="text-yellow-700 text-sm">
                      Set up your profile to start discovering amazing people on your campus.
                    </p>
                  </div>
                  <Button 
                    onClick={() => navigate('/profile')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Setup Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {action.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          {profile && (
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.matches}</div>
                <div className="text-muted-foreground text-sm">Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.likes}</div>
                <div className="text-muted-foreground text-sm">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.chats}</div>
                <div className="text-muted-foreground text-sm">Chats</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;