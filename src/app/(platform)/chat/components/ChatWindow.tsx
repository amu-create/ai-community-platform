'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MoreVertical, Users, Settings } from 'lucide-react';
import { getMessages, sendMessage, markMessageAsRead } from '@/app/actions/chat';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  room: ChatRoom;
  userId: string;
}

export default function ChatWindow({ room, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(room.id);
      setMessages(data);
      
      // 메시지 읽음 표시
      data.forEach(msg => {
        if (msg.senderId !== userId) {
          markMessageAsRead(msg.id);
        }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${room.id}`,
        },
        async (payload) => {
          // 새 메시지를 메시지 목록에 추가
          const newMessage = payload.new as ChatMessage;
          
          // 발신자 정보 가져오기
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', newMessage.senderId)
            .single();
            
          setMessages(prev => [...prev, {
            ...newMessage,
            sender,
          }]);
          
          // 다른 사용자의 메시지면 읽음 표시
          if (newMessage.senderId !== userId) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;

    const messageContent = input.trim();
    setInput('');
    setSending(true);

    try {
      await sendMessage({
        roomId: room.id,
        content: messageContent,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      setInput(messageContent); // 실패 시 입력 복원
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    
    return formatDistanceToNow(messageDate, { addSuffix: true });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{room.name}</h2>
          {room.type !== 'direct' && (
            <Badge variant="secondary" className="text-xs">
              {room.type}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {room.members && (
            <Button variant="ghost" size="icon">
              <Users className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.senderId === userId && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender?.avatarUrl} />
                  <AvatarFallback>
                    {message.sender?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex-1 space-y-1",
                    message.senderId === userId && "items-end"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.sender?.username || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] inline-block",
                      message.senderId === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Import Badge if not already imported
import { Badge } from '@/components/ui/badge';
