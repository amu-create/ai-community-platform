'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/types/chat';
import ChatRoomList from './components/ChatRoomList';
import ChatWindow from './components/ChatWindow';
import OnlineUsers from './components/OnlineUsers';
import { getChatRooms } from '@/app/actions/chat';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatLayoutProps {
  userId: string;
}

export default function ChatLayout({ userId }: ChatLayoutProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadRooms();
    setupRealtimeSubscription();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await getChatRooms();
      setRooms(data);
      
      // 첫 번째 방 자동 선택
      if (data.length > 0 && !selectedRoom) {
        setSelectedRoom(data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chat rooms',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // 새 메시지 구독
    const messageChannel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload) => {
          // 방 목록 새로고침 (마지막 메시지 업데이트)
          await loadRooms();
          
          // 알림 표시 (현재 선택된 방이 아닌 경우)
          if (payload.new.room_id !== selectedRoom?.id) {
            toast({
              title: 'New Message',
              description: 'You have a new message',
            });
          }
        }
      )
      .subscribe();

    // 사용자 상태 구독
    const presenceChannel = supabase
      .channel('user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        () => {
          // 온라인 사용자 목록 새로고침
        }
      )
      .subscribe();
  };

  return (
    <div className="container mx-auto p-0 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-12 gap-0 h-full">
        {/* 채팅방 목록 */}
        <div className="col-span-3 border-r h-full overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ChatRoomList
              rooms={rooms}
              selectedRoom={selectedRoom}
              onRoomSelect={setSelectedRoom}
              onRoomsUpdate={loadRooms}
            />
          )}
        </div>

        {/* 채팅 창 */}
        <div className="col-span-6 h-full overflow-hidden">
          {selectedRoom ? (
            <ChatWindow
              room={selectedRoom}
              userId={userId}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a chat room to start messaging
            </div>
          )}
        </div>

        {/* 온라인 사용자 */}
        <div className="col-span-3 border-l h-full overflow-hidden">
          <OnlineUsers currentUserId={userId} />
        </div>
      </div>
    </div>
  );
}
