'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Circle } from 'lucide-react';
import { OnlineUser } from '@/types/chat';
import { getOnlineUsers } from '@/app/actions/chat';

interface OnlineUsersListProps {
  roomId?: string;
  currentUserId: string;
}

export function OnlineUsersList({ roomId, currentUserId }: OnlineUsersListProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOnlineUsers = async () => {
      try {
        const users = await getOnlineUsers(roomId);
        setOnlineUsers(users);
      } catch (error) {
        console.error('Failed to load online users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnlineUsers();
    
    // 30초마다 업데이트
    const interval = setInterval(loadOnlineUsers, 30000);
    
    return () => clearInterval(interval);
  }, [roomId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      case 'busy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
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

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-3">
        Online Users ({onlineUsers.length})
      </h3>
      <div className="space-y-2">
        {onlineUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users online
          </p>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 py-2"
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.user?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <Circle
                  className={`absolute bottom-0 right-0 h-3 w-3 fill-current ${getStatusColor(
                    user.status
                  )}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user?.username || 'Unknown'}
                  {user.user_id === currentUserId && ' (You)'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getStatusLabel(user.status)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
