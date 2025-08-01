'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { ChatMessage, TypingIndicator } from '@/types/chat';
import { sendMessage, updateMessage, deleteMessage } from '@/app/actions/chat';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '@/lib/performance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
  initialMessages?: ChatMessage[];
}

export function ChatRoom({ roomId, currentUserId, initialMessages = [] }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingIndicator>>(new Map());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();
  const supabase = createClient();

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 타이핑 상태 브로드캐스트
  const broadcastTyping = useCallback(async (typing: boolean) => {
    const { data: userData } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', currentUserId)
      .single();

    const channel = supabase.channel(`room:${roomId}:typing`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        room_id: roomId,
        user_id: currentUserId,
        username: userData?.username || 'Unknown',
        is_typing: typing
      }
    });
  }, [roomId, currentUserId, supabase]);

  // 타이핑 디바운스
  const debouncedTyping = useDebounce(() => {
    setIsTyping(false);
    broadcastTyping(false);
  }, 2000);

  // 입력 중 처리
  const handleInputChange = (value: string) => {
    setNewMessage(value);
    
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }
    
    if (value.trim()) {
      debouncedTyping();
    } else {
      setIsTyping(false);
      broadcastTyping(false);
    }
  };

  // 실시간 메시지 및 타이핑 구독
  useEffect(() => {
    // 메시지 채널
    const messageChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          
          // 사용자 정보 가져오기
          const { data: userData } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .eq('id', newMsg.user_id)
            .single();

          if (userData) {
            newMsg.user = userData;
          }

          setMessages(prev => [...prev, newMsg]);
          
          // 타이핑 상태 제거
          setTypingUsers(prev => {
            const updated = new Map(prev);
            updated.delete(newMsg.user_id!);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const updatedMsg = payload.new as ChatMessage;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMsg.id 
                ? { ...msg, ...updatedMsg }
                : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages(prev => prev.filter(msg => msg.id !== deletedId));
        }
      )
      .subscribe();

    // 타이핑 채널
    const typingChannel = supabase
      .channel(`room:${roomId}:typing`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const indicator = payload as TypingIndicator;
        
        if (indicator.user_id === currentUserId) return;
        
        setTypingUsers(prev => {
          const updated = new Map(prev);
          
          if (indicator.is_typing) {
            updated.set(indicator.user_id, indicator);
            
            // 3초 후 자동 제거
            setTimeout(() => {
              setTypingUsers(current => {
                const newMap = new Map(current);
                newMap.delete(indicator.user_id);
                return newMap;
              });
            }, 3000);
          } else {
            updated.delete(indicator.user_id);
          }
          
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [roomId, currentUserId, supabase]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(false);
    broadcastTyping(false);
    
    try {
      await sendMessage({
        room_id: roomId,
        content: newMessage.trim()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 수정
  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await updateMessage({
        message_id: messageId,
        content: editContent.trim()
      });
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 삭제
  const handleDeleteMessage = async (messageId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 타이핑 인디케이터 렌더링
  const renderTypingIndicator = () => {
    const typingUsersList = Array.from(typingUsers.values());
    if (typingUsersList.length === 0) return null;

    const names = typingUsersList.map(u => u.username);
    const text = names.length === 1 
      ? `${names[0]} is typing...`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing...`
      : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are typing...`;

    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.user_id === currentUserId;
            const isEditing = editingMessage === message.id;

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  isOwnMessage ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.user?.avatar_url && (
                    <AvatarImage src={message.user.avatar_url} />
                  )}
                  <AvatarFallback>
                    {message.user?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={`flex flex-col gap-1 max-w-[70%] ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {message.user?.username || 'Unknown'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {message.is_edited && (
                      <span className="text-xs text-muted-foreground">(edited)</span>
                    )}
                    
                    {isOwnMessage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingMessage(message.id);
                              setEditContent(message.content);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2 w-full">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleEditMessage(message.id);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditMessage(message.id)}
                        disabled={isLoading}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingMessage(null);
                          setEditContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {renderTypingIndicator()}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}