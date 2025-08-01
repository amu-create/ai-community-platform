export interface ChatRoom {
  id: string;
  name: string;
  description?: string | null;
  type: 'public' | 'private' | 'direct';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  max_members: number;
  metadata: Record<string, any>;
  member_count?: number;
  unread_count?: number;
  last_message?: ChatMessage;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string | null;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  is_edited: boolean;
  edited_at?: string | null;
  created_at: string;
  metadata: Record<string, any>;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface OnlineUser {
  id: string;
  user_id: string;
  last_seen: string;
  status: 'online' | 'away' | 'busy';
  room_id?: string | null;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface SendMessagePayload {
  room_id: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  metadata?: Record<string, any>;
}

export interface CreateRoomPayload {
  name: string;
  description?: string;
  type?: 'public' | 'private';
}

export interface JoinRoomPayload {
  room_id: string;
}

export interface UpdateMessagePayload {
  message_id: string;
  content: string;
}

export interface TypingIndicator {
  room_id: string;
  user_id: string;
  username: string;
  is_typing: boolean;
}
