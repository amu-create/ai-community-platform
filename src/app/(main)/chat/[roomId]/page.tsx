import { Suspense } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

interface ChatRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function ChatRoomPage({ params }: ChatRoomPageProps) {
  const { roomId } = await params;
  const supabase = await createServerClient();

  // 채팅방 정보 가져오기
  const { data: room, error } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error || !room) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Suspense fallback={<div>채팅방 로딩 중...</div>}>
        <ChatRoom roomId={roomId} />
      </Suspense>
    </div>
  );
}
