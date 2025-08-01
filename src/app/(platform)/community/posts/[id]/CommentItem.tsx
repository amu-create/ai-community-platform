'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';

interface CommentItemProps {
  comment: Comment;
  postAuthorId: string;
  onVote: (commentId: string, vote: -1 | 0 | 1) => void;
  onReply: (content: string) => void;
  isReplying: boolean;
  onStartReply: () => void;
  onCancelReply: () => void;
  depth: number;
}

export default function CommentItem({
  comment,
  postAuthorId,
  onVote,
  onReply,
  isReplying,
  onStartReply,
  onCancelReply,
  depth,
}: CommentItemProps) {
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState('');
  const isAuthor = user?.id === comment.author_id;
  const isPostAuthor = comment.author_id === postAuthorId;
  
  const handleVote = (vote: -1 | 1) => {
    const newVote = comment.user_vote === vote ? 0 : vote;
    onVote(comment.id, newVote);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim()) {
      onReply(replyContent.trim());
      setReplyContent('');
      onCancelReply();
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm",
      depth > 0 && "ml-8 mt-4"
    )}>
      <div className="p-4">
        <div className="flex gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              className={cn(
                "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                comment.user_vote === 1 && "text-orange-500"
              )}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">{comment.vote_count}</span>
            <button
              onClick={() => handleVote(-1)}
              className={cn(
                "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                comment.user_vote === -1 && "text-blue-500"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Comment content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href={`/profile/${comment.author?.username}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                {comment.author?.avatar_url && (
                  <img 
                    src={comment.author.avatar_url} 
                    alt={comment.author.username}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="font-medium">
                  {comment.author?.username || 'Anonymous'}
                </span>
              </Link>
              
              {isPostAuthor && (
                <Badge variant="secondary" className="text-xs">
                  OP
                </Badge>
              )}
              
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="prose prose-sm prose-gray dark:prose-invert max-w-none mb-3">
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            </div>

            <div className="flex items-center gap-4">
              {user && depth < 3 && (
                <button
                  onClick={onStartReply}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>
              )}
              
              {isAuthor && (
                <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reply form */}
            {isReplying && (
              <div className="mt-4 space-y-3">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim()}
                  >
                    Post Reply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelReply}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-t dark:border-gray-700">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postAuthorId={postAuthorId}
              onVote={onVote}
              onReply={onReply}
              isReplying={false}
              onStartReply={() => {}}
              onCancelReply={() => {}}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
