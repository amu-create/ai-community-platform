'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { 
  ChatRoom, 
  ChatMessage, 
  CreateRoomPayload, 
  SendMessagePayload,
  UpdateMessagePayload 
} from '@/types/chat';

// 채팅방 목록 가져오기
export async function getChatRooms(): Promise<ChatRoom[]> {
  
  const supabase = await createServerClient();

  const { data: rooms, error } = await supabase
    .from('chat_rooms')
    .select(`
      *,
      chat_room_members!inner(user_id),
      chat_messages(
        id,
        content,
        created_at,
        user:profiles(username)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 각 방의 멤버 수와 마지막 메시지 처리
  const processedRooms = rooms?.map(room => {
    const lastMessage = room.chat_messages?.[0];
    return {
      ...room,
      member_count: room.chat_room_members?.length || 0,
      last_message: lastMessage ? {
        ...lastMessage,
        user: lastMessage.user
      } : undefined,
      chat_room_members: undefined,
      chat_messages: undefined
    };
  });

  return processedRooms || [];
}

// 채팅방 생성
export async function createChatRoom(payload: CreateRoomPayload): Promise<string> {
  
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .rpc('create_chat_room', {
      p_name: payload.name,
      p_description: payload.description || null,
      p_type: payload.type || 'public'
    });

  if (error) throw error;
  return data;
}

// 채팅방 참여
export async function joinChatRoom(roomId: string): Promise<void> {
  
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('chat_room_members')
    .insert({
      room_id: roomId,
      user_id: user.id,
      role: 'member'
    });

  if (error && error.code !== '23505') { // 중복 키 에러 무시
    throw error;
  }
}

// 채팅방 나가기
export async function leaveChatRoom(roomId: string): Promise<void> {
  
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('chat_room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// 메시지 전송
export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: payload.room_id,
      sender_id: user.id,
      content: payload.content,
      type: payload.type || 'text',
      metadata: payload.metadata || {}
    })
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .single();

  if (error) throw error;
  
  // user_id 필드 추가 (타입 호환성)
  return {
    ...data,
    user_id: data.sender_id,
    is_edited: data.edited_at ? true : false
  };
}

// 메시지 수정
export async function updateMessage(payload: UpdateMessagePayload): Promise<void> {
  
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('chat_messages')
    .update({
      content: payload.content,
      edited_at: new Date().toISOString()
    })
    .eq('id', payload.message_id);

  if (error) throw error;
}

// 메시지 삭제
export async function deleteMessage(messageId: string): Promise<void> {
  
  const supabase = await createServerClient();

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}

// 최근 메시지 가져오기
export async function getRecentMessages(
  roomId: string, 
  limit: number = 50,
  beforeId?: string
): Promise<ChatMessage[]> {
  
  const supabase = await createServerClient();

  let query = supabase
    .from('chat_messages')
    .select(`
      *,
      user:profiles!chat_messages_sender_id_fkey(id, username, avatar_url)
    `)
    .eq('room_id', roomId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (beforeId) {
    const { data: beforeMessage } = await supabase
      .from('chat_messages')
      .select('created_at')
      .eq('id', beforeId)
      .single();
    
    if (beforeMessage) {
      query = query.lt('created_at', beforeMessage.created_at);
    }
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // 타입 변환 및 역순 정렬 (최신 메시지가 아래로)
  return (data || []).map(msg => ({
    ...msg,
    user_id: msg.sender_id,
    is_edited: msg.edited_at ? true : false
  })).reverse();
}

// 온라인 상태 업데이트
export async function updateOnlineStatus(
  status: 'online' | 'away' | 'busy' = 'online',
  roomId?: string
): Promise<void> {
  
  const supabase = await createServerClient();

  const { error } = await supabase
    .rpc('update_online_status', {
      p_status: status,
      p_room_id: roomId || null
    });

  if (error) throw error;
}

// 채팅방 멤버 가져오기
export async function getChatRoomMembers(roomId: string) {
  
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('chat_room_members')
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

// 온라인 사용자 가져오기
export async function getOnlineUsers(roomId?: string) {
  
  const supabase = await createServerClient();

  let query = supabase
    .from('online_users')
    .select(`
      *,
      user:profiles(id, username, avatar_url)
    `)
    .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  if (roomId) {
    query = query.eq('room_id', roomId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// 읽음 표시 업데이트
export async function markAsRead(roomId: string): Promise<void> {
  
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('chat_room_members')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('room_id', roomId)
    .eq('user_id', user.id);

  if (error) throw error;
}