import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

export const useNotifications = (userId: string | null) => {
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Request notification permission
    const requestPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (!userId || !hasPermission) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${userId}` // Only listen for messages not sent by current user
        },
        async (payload) => {
          // Check if this message is for the current user
          const { data: matchData } = await supabase
            .from('matches')
            .select('user1_id, user2_id')
            .eq('id', payload.new.match_id)
            .single();

          if (matchData && (matchData.user1_id === userId || matchData.user2_id === userId)) {
            // Get sender's profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', payload.new.sender_id)
              .single();

            const senderName = senderProfile?.display_name || 'Someone';
            
            // Show browser notification
            if (document.hidden || !location.pathname.includes('/chat/')) {
              new Notification(`New message from ${senderName}`, {
                body: payload.new.content.length > 50 
                  ? payload.new.content.substring(0, 50) + '...' 
                  : payload.new.content,
                icon: '/favicon.ico',
                tag: 'new-message',
                requireInteraction: false
              });
            }

            // Show toast notification
            if (!location.pathname.includes(`/chat/${payload.new.match_id}`)) {
              toast({
                title: `💬 New message from ${senderName}`,
                description: payload.new.content.length > 100 
                  ? payload.new.content.substring(0, 100) + '...' 
                  : payload.new.content,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to new matches
    const matchChannel = supabase
      .channel('match-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        async (payload) => {
          const newMatch = payload.new;
          if (newMatch.user1_id === userId || newMatch.user2_id === userId) {
            const otherUserId = newMatch.user1_id === userId ? newMatch.user2_id : newMatch.user1_id;
            
            // Get other user's profile
            const { data: otherProfile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', otherUserId)
              .single();

            const otherName = otherProfile?.display_name || 'Someone';
            
            // Show browser notification
            if (hasPermission) {
              new Notification(`It's a Match! 🎉`, {
                body: `You and ${otherName} liked each other!`,
                icon: '/favicon.ico',
                tag: 'new-match',
                requireInteraction: true
              });
            }

            // Show toast notification
            toast({
              title: "🎉 It's a Match!",
              description: `You and ${otherName} liked each other! Start chatting now.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(matchChannel);
    };
  }, [userId, hasPermission, toast, location.pathname]);

  return { hasPermission };
};