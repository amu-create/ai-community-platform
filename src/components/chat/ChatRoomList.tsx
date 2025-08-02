'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare, Plus, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  member_count?: number;
  last_message?: {
    content: string;
    created_at: string;
  };
}

export function ChatRoomList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const router = useRouter();
  const { user } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    fetchRooms();
    
    // 실시간 구독
    const channel = supabase
      .channel('chat_rooms')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chat_rooms' 
      }, () => {
        fetchRooms();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members(count),
          chat_messages(content, created_at)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRooms = data?.map(room => ({
        ...room,
        member_count: room.chat_room_members?.[0]?.count || 0,
        last_message: room.chat_messages?.[0] || null,
      })) || [];

      setRooms(formattedRooms);
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!newRoom.name.trim()) {
      toast.error('채팅방 이름을 입력해주세요');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoom.name,
          description: newRoom.description || null,
          is_public: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // 생성자를 멤버로 추가
      await supabase
        .from('chat_room_members')
        .insert({
          room_id: data.id,
          user_id: user.id,
        });

      toast.success('채팅방이 생성되었습니다');
      setIsCreateOpen(false);
      setNewRoom({ name: '', description: '' });
      router.push(`/chat/${data.id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('채팅방 생성에 실패했습니다');
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    try {
      await supabase
        .from('chat_room_members')
        .upsert({
          room_id: roomId,
          user_id: user.id,
        });

      router.push(`/chat/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="secondary" className="gap-1">
          <Hash className="h-3 w-3" />
          {rooms.length} 개의 채팅방
        </Badge>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              새 채팅방
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 채팅방 만들기</DialogTitle>
              <DialogDescription>
                커뮤니티 멤버들과 대화할 수 있는 공개 채팅방을 만들어보세요
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">채팅방 이름</Label>
                <Input
                  id="name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="예: React 학습방"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">설명 (선택)</Label>
                <Textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                  placeholder="채팅방에 대한 간단한 설명을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                취소
              </Button>
              <Button onClick={createRoom}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="p-4 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => joinRoom(room.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{room.name}</h3>
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {room.member_count}
                </Badge>
              </div>
              
              {room.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {room.description}
                </p>
              )}
              
              {room.last_message ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span className="truncate flex-1">{room.last_message.content}</span>
                  <span className="whitespace-nowrap">
                    {formatDistanceToNow(new Date(room.last_message.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  아직 메시지가 없습니다
                </div>
              )}
            </Card>
          ))}
          
          {rooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>아직 채팅방이 없습니다</p>
              <p className="text-sm">첫 번째 채팅방을 만들어보세요!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
