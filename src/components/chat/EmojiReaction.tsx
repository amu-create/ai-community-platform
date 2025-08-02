'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile, Heart, ThumbsUp, Laugh, Frown, Angry } from 'lucide-react';

interface EmojiReactionProps {
  messageId: string;
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

const EMOJI_OPTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: '좋아요' },
  { emoji: '❤️', icon: Heart, label: '하트' },
  { emoji: '😂', icon: Laugh, label: '웃음' },
  { emoji: '😮', icon: Smile, label: '놀람' },
  { emoji: '😢', icon: Frown, label: '슬픔' },
  { emoji: '😡', icon: Angry, label: '화남' },
];

export function EmojiReaction({ messageId, reactions = [] }: EmojiReactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);
  const supabase = createClientComponentClient();
  const user = useAuthStore((state) => state.user);

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      // 이미 리액션한 경우 제거, 아니면 추가
      const existingReaction = await supabase
        .from('message_reactions')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existingReaction.data) {
        // 리액션 제거
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.data.id);

        // 로컬 상태 업데이트
        setLocalReactions((prev) =>
          prev.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count - 1,
                  users: r.users.filter((u) => u !== user.id),
                }
              : r
          ).filter((r) => r.count > 0)
        );
      } else {
        // 리액션 추가
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

        // 로컬 상태 업데이트
        setLocalReactions((prev) => {
          const existing = prev.find((r) => r.emoji === emoji);
          if (existing) {
            return prev.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count + 1,
                    users: [...r.users, user.id],
                  }
                : r
            );
          }
          return [...prev, { emoji, count: 1, users: [user.id] }];
        });
      }

      setIsOpen(false);
    } catch (error) {
      console.error('리액션 처리 실패:', error);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* 기존 리액션 표시 */}
      {localReactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.users.includes(user?.id || '') ? 'default' : 'outline'}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReaction(reaction.emoji)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}

      {/* 이모지 추가 버튼 */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {EMOJI_OPTIONS.map((option) => (
              <Button
                key={option.emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleReaction(option.emoji)}
                title={option.label}
              >
                <span className="text-lg">{option.emoji}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
