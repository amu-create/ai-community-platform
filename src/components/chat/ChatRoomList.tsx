'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Search, MessageSquare, Lock, Globe } from 'lucide-react';
import { ChatRoom } from '@/types/chat';
import { getChatRooms, joinChatRoom } from '@/app/actions/chat';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createChatRoom } from '@/app/actions/chat';

interface ChatRoomListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId?: string;
}

export function ChatRoomList({ onRoomSelect, selectedRoomId }: ChatRoomListProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState<'public' | 'private'>('public');
  const { toast } = useToast();

  // 채팅방 목록 로드
  const loadRooms = async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // 채팅방 생성
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    setIsLoading(true);
    try {
      await createChatRoom({
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || undefined,
        type: newRoomType
      });
      
      toast({
        title: "Success",
        description: "Chat room created successfully"
      });
      
      setIsCreateDialogOpen(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomType('public');
      
      // 목록 새로고침
      await loadRooms();
    } catch (error) {
      console.error('Failed to create room:', error);
      toast({
        title: "Error",
        description: "Failed to create chat room",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링된 채팅방
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat Rooms</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chat Room</DialogTitle>
                <DialogDescription>
                  Create a new chat room for your community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="e.g., AI Discussion"
                  />
                </div>
                <div>
                  <Label htmlFor="room-description">Description (Optional)</Label>
                  <Textarea
                    id="room-description"
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    placeholder="What's this room about?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="room-type"
                        value="public"
                        checked={newRoomType === 'public'}
                        onChange={(e) => setNewRoomType(e.target.value as 'public')}
                        className="h-4 w-4"
                      />
                      <Globe className="h-4 w-4" />
                      <span>Public</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="room-type"
                        value="private"
                        checked={newRoomType === 'private'}
                        onChange={(e) => setNewRoomType(e.target.value as 'private')}
                        className="h-4 w-4"
                      />
                      <Lock className="h-4 w-4" />
                      <span>Private</span>
                    </label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isLoading || !newRoomName.trim()}
                >
                  Create Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading rooms...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No rooms found
          </div>
        ) : (
          <div className="divide-y">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedRoomId === room.id ? 'bg-muted' : ''
                }`}
                onClick={() => onRoomSelect(room)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {room.type === 'private' && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    {room.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {room.description}
                      </p>
                    )}
                    {room.last_message && (
                      <div className="flex items-center gap-2 mt-1">
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium">
                            {room.last_message.user?.username}:
                          </span>{' '}
                          {room.last_message.content}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {room.member_count || 0}
                    </Badge>
                    {room.unread_count && room.unread_count > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {room.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
