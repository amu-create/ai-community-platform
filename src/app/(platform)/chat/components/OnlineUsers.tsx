'use client';

import { useState, useEffect } from 'react';
import { UserPresence } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { getOnlineUsers } from '@/app/actions/chat';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface OnlineUsersProps {
  currentUserId: string;
}

export default function OnlineUsers({ currentUserId }: OnlineUsersProps) {
  const [users, setUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadOnlineUsers();
    setupRealtimeSubscription();

    // 현재 사용자 상태를 온라인으로 설정
    updateMyPresence('online');

    // 페이지 벗어날 때 오프라인으로 설정
    return () => {
      updateMyPresence('offline');
      supabase.removeAllChannels();
    };
  }, []);

  const loadOnlineUsers = async () => {
    try {
      setLoading(true);
      const data = await getOnlineUsers();
      setUsers(data.filter(u => u.userId !== currentUserId));
    } catch (error) {
      console.error('Error loading online users:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('online_users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          loadOnlineUsers();
        }
      )
      .subscribe();
  };

  const updateMyPresence = async (status: UserPresence['status']) => {
    try {
      const { updateUserPresence } = await import('@/app/actions/chat');
      await updateUserPresence(status);
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const startDirectChat = async (userId: string) => {
    try {
      const { createOrGetDirectChat } = await import('@/app/actions/chat');
      const roomId = await createOrGetDirectChat(userId);
      // Navigate to the chat room
      window.location.href = `/chat?room=${roomId}`;
    } catch (error) {
      console.error('Error starting direct chat:', error);
    }
  };

  const getStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: UserPresence['status']) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Online Users</h2>
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? 'user' : 'users'} online
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </>
          ) : users.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No other users online
            </div>
          ) : (
            users.map((presence) => (
              <div
                key={presence.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={(presence as any).user?.avatar_url} />
                      <AvatarFallback>
                        {(presence as any).user?.username?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                        presence.status
                      )}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {(presence as any).user?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusText(presence.status)}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startDirectChat(presence.userId)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
