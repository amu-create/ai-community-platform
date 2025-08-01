'use client';

import { useState, useEffect } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { OnlineUsersList } from '@/components/chat/OnlineUsersList';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Menu, X } from 'lucide-react';
import { ChatRoom as ChatRoomType, ChatMessage } from '@/types/chat';
import { getRecentMessages, joinChatRoom, markAsRead, updateOnlineStatus } from '@/app/actions/chat';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ChatPageContentProps {
  userId: string;
}

export default function ChatPageContent({ userId }: ChatPageContentProps) {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  // 온라인 상태 업데이트
  useEffect(() => {
    updateOnlineStatus('online');

    const interval = setInterval(() => {
      updateOnlineStatus('online', selectedRoom?.id);
    }, 60000); // 1분마다 업데이트

    return () => {
      clearInterval(interval);
    };
  }, [selectedRoom?.id]);

  // 채팅방 선택
  const handleRoomSelect = async (room: ChatRoomType) => {
    setSelectedRoom(room);
    setIsLoadingMessages(true);
    setIsMobileMenuOpen(false);

    try {
      // 채팅방 참여
      await joinChatRoom(room.id);
      
      // 메시지 로드
      const recentMessages = await getRecentMessages(room.id);
      setMessages(recentMessages);
      
      // 읽음 표시
      await markAsRead(room.id);
      
      // 온라인 상태 업데이트
      await updateOnlineStatus('online', room.id);
    } catch (error) {
      console.error('Failed to load room:', error);
      toast({
        title: "Error",
        description: "Failed to load chat room",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community Chat</h1>
        <p className="text-muted-foreground">
          Connect with other AI learners in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Menu className="h-4 w-4 mr-2" />
                Chat Rooms & Users
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Chat Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100vh-5rem)]">
                <div className="flex-1 overflow-hidden">
                  <ChatRoomList
                    onRoomSelect={handleRoomSelect}
                    selectedRoomId={selectedRoom?.id}
                  />
                </div>
                <div className="p-4 border-t">
                  <OnlineUsersList
                    roomId={selectedRoom?.id}
                    currentUserId={userId}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Room List */}
        <div className="hidden lg:block">
          <ChatRoomList
            onRoomSelect={handleRoomSelect}
            selectedRoomId={selectedRoom?.id}
          />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedRoom ? (
            <>
              <Card className="p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedRoom.name}</h2>
                    {selectedRoom.description && (
                      <p className="text-sm text-muted-foreground">
                        {selectedRoom.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedRoom.member_count || 0}
                    </Badge>
                  </div>
                </div>
              </Card>
              
              {isLoadingMessages ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading messages...</p>
                </Card>
              ) : (
                <ChatRoom
                  roomId={selectedRoom.id}
                  currentUserId={userId}
                  initialMessages={messages}
                />
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Select a chat room</h3>
              <p className="text-muted-foreground">
                Choose a room from the list to start chatting
              </p>
            </Card>
          )}
        </div>

        {/* Desktop Online Users */}
        <div className="hidden lg:block">
          <OnlineUsersList
            roomId={selectedRoom?.id}
            currentUserId={userId}
          />
        </div>
      </div>
    </div>
  );
}
