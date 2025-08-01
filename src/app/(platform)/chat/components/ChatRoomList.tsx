'use client';

import { useState } from 'react';
import { ChatRoom } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Hash, Lock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreateRoomDialog from './CreateRoomDialog';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoomListProps {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onRoomsUpdate: () => void;
}

export default function ChatRoomList({
  rooms,
  selectedRoom,
  onRoomSelect,
  onRoomsUpdate,
}: ChatRoomListProps) {
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  );

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'public':
        return <Hash className="h-4 w-4" />;
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'direct':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-4 space-y-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat Rooms</h2>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors",
                  "hover:bg-accent",
                  selectedRoom?.id === room.id && "bg-accent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getRoomIcon(room.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {room.name}
                      </h3>
                      {room.unreadCount && room.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {room.lastMessage ? (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          <span className="font-medium">
                            {room.lastMessage.sender?.username}:
                          </span>{' '}
                          {room.lastMessage.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(room.lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <CreateRoomDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          onRoomsUpdate();
        }}
      />
    </>
  );
}
