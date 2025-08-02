'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Send, Users, Loader2, Paperclip, Image, FileText, X, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  type?: 'text' | 'image' | 'file';
  metadata?: {
    url?: string;
    name?: string;
    size?: number;
  };
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
}

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { user } = useAuthStore();

  // 채팅방 정보 및 메시지 로드
  useEffect(() => {
    if (!roomId) return;
    
    loadRoomInfo();
    loadMessages();
    
    // 실시간 구독
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          handleNewMessage(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 새 메시지가 추가될 때 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRoomInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;
      setRoom(data);
    } catch (error) {
      console.error('채팅방 정보 로드 실패:', error);
      toast.error('채팅방을 찾을 수 없습니다');
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!sender_id(username, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      toast.error('메시지를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = async (payload: any) => {
    // 이미 있는 메시지인지 확인
    if (messages.some(msg => msg.id === payload.id)) return;

    // 발신자 정보 가져오기
    const { data: senderData } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', payload.sender_id)
      .single();

    const newMsg = {
      ...payload,
      profiles: senderData || { username: 'Unknown', avatar_url: null },
    };

    setMessages((prev) => [...prev, newMsg]);
  };

  const uploadFile = async (file: File): Promise<any> => {
    try {
      setUploading(true);
      setProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(data.path);

      return {
        url: publicUrl,
        name: file.name,
        size: file.size,
      };
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      toast.error('파일 업로드에 실패했습니다');
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending || !user) return;

    setSending(true);
    
    try {
      let messageData: any = {
        room_id: roomId,
        sender_id: user.id,
        content: newMessage.trim() || '',
        type: 'text',
      };

      // 파일이 선택된 경우
      if (selectedFile) {
        const fileMetadata = await uploadFile(selectedFile);
        if (!fileMetadata) {
          setSending(false);
          return;
        }

        messageData = {
          ...messageData,
          type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          content: newMessage.trim() || selectedFile.name,
          metadata: fileMetadata,
        };
      }

      const { error } = await supabase.from('chat_messages').insert(messageData);

      if (error) throw error;
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송에 실패했습니다');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('파일 크기는 10MB 이하여야 합니다');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {room?.name || '채팅룸'}
              </CardTitle>
              {room?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {room.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender_id === user?.id ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {message.profiles.username?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex flex-col ${
                  message.sender_id === user?.id ? 'items-end' : 'items-start'
                } max-w-[70%]`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {message.profiles.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                </div>

                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'image' && message.metadata?.url ? (
                    <div className="space-y-2">
                      <img
                        src={message.metadata.url}
                        alt={message.content}
                        className="rounded-md max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(message.metadata.url, '_blank')}
                      />
                      {message.content && (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  ) : message.type === 'file' && message.metadata?.url ? (
                    <a
                      href={message.metadata.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{message.metadata.name || message.content}</span>
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="p-4 border-t">
        {/* 선택된 파일 미리보기 */}
        {selectedFile && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedFile.type.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="text-sm truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeSelectedFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* 업로드 진행 상태 */}
        {uploading && (
          <div className="mb-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>업로드 중...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={sending || uploading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={sending || uploading || (!newMessage.trim() && !selectedFile)}
          >
            {sending || uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
