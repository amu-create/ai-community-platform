import { Suspense } from 'react';
import { ChatRoomList } from '@/components/chat/ChatRoomList';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">실시간 채팅</h1>
        </div>
        <p className="text-muted-foreground">
          커뮤니티 멤버들과 실시간으로 소통하고 지식을 공유하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">채팅방 목록</h2>
            <Suspense fallback={<div>채팅방 로딩 중...</div>}>
              <ChatRoomList />
            </Suspense>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6 min-h-[600px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">채팅방을 선택하여 대화를 시작하세요</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
