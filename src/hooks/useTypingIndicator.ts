'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuthStore } from '@/store/authStore';
import debounce from 'lodash/debounce';

interface TypingUser {
  user_id: string;
  username: string;
  timestamp: number;
}

export function useTypingIndicator(roomId: string) {
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const supabase = createClientComponentClient();
  const user = useAuthStore((state) => state.user);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const cleanupIntervalRef = useRef<NodeJS.Timeout>();

  // 타이핑 중인 사용자 정리 (5초 이상 업데이트 없으면 제거)
  const cleanupTypingUsers = useCallback(() => {
    const now = Date.now();
    setTypingUsers((prev) => {
      const updated = new Map(prev);
      updated.forEach((user, userId) => {
        if (now - user.timestamp > 5000) {
          updated.delete(userId);
        }
      });
      return updated.size === prev.size ? prev : updated;
    });
  }, []);

  // 타이핑 상태 브로드캐스트
  const broadcastTyping = useCallback(async (isTyping: boolean) => {
    if (!user) return;

    const channel = supabase.channel(`typing:${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        username: user.username || 'Unknown',
        is_typing: isTyping,
        timestamp: Date.now(),
      },
    });
  }, [roomId, user, supabase]);

  // 디바운스된 타이핑 중지 함수
  const stopTypingDebounced = useRef(
    debounce(() => {
      broadcastTyping(false);
    }, 3000)
  ).current;

  // 타이핑 시작 알림
  const startTyping = useCallback(() => {
    broadcastTyping(true);
    stopTypingDebounced();
  }, [broadcastTyping, stopTypingDebounced]);

  // 타이핑 중지 알림
  const stopTyping = useCallback(() => {
    stopTypingDebounced.cancel();
    broadcastTyping(false);
  }, [broadcastTyping, stopTypingDebounced]);

  useEffect(() => {
    // 실시간 타이핑 상태 구독
    const channel = supabase
      .channel(`typing:${roomId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, is_typing, timestamp } = payload.payload;
        
        if (user_id === user?.id) return; // 자신의 타이핑은 무시

        setTypingUsers((prev) => {
          const updated = new Map(prev);
          if (is_typing) {
            updated.set(user_id, { user_id, username, timestamp });
          } else {
            updated.delete(user_id);
          }
          return updated;
        });
      })
      .subscribe();

    // 주기적으로 오래된 타이핑 사용자 정리
    cleanupIntervalRef.current = setInterval(cleanupTypingUsers, 1000);

    return () => {
      channel.unsubscribe();
      stopTypingDebounced.cancel();
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [roomId, user, supabase, cleanupTypingUsers, stopTypingDebounced]);

  // 타이핑 중인 사용자 배열로 변환
  const typingUsersList = Array.from(typingUsers.values());

  return {
    typingUsers: typingUsersList,
    startTyping,
    stopTyping,
  };
}
