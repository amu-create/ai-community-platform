'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createComment, voteComment } from '@/app/actions/community';
import { useAuth } from '@/hooks/useAuth';
import CommentItem from './CommentItem';
import type { Comment } from '@/types/community';
import { Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  postAuthorId: string;
}

export default function CommentSection({ 
  postId, 
  initialComments,
  postAuthorId 
}: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = async (parentId?: string) => {
    const content = parentId ? comments.find(c => c.id === parentId)?.content || newComment : newComment;
    
    if (!content.trim()) return;

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to comment',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const comment = await createComment({
        post_id: postId,
        parent_id: parentId,
        content: parentId ? content : newComment.trim(),
      });

      // Add the new comment with author info
      const newCommentWithAuthor = {
        ...comment,
        author: {
          id: user.id,
          username: user.user_metadata?.username || 'Anonymous',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || '',
        },
        replies: [],
        user_vote: 0,
      };

      if (parentId) {
        // Add reply to parent comment
        const updateComments = (comments: Comment[]): Comment[] => {
          return comments.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), newCommentWithAuthor],
              };
            }
            if (c.replies) {
              return {
                ...c,
                replies: updateComments(c.replies),
              };
            }
            return c;
          });
        };
        setComments(updateComments(comments));
        setReplyingTo(null);
      } else {
        // Add root comment
        setComments([...comments, newCommentWithAuthor]);
        setNewComment('');
      }

      toast({
        title: 'Success',
        description: 'Comment posted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, vote: -1 | 0 | 1) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to vote',
        variant: 'destructive',
      });
      return;
    }

    try {
      await voteComment(commentId, vote);
      
      // Update local state
      const updateVotes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            const oldVote = comment.user_vote || 0;
            const voteDiff = vote - oldVote;
            return {
              ...comment,
              user_vote: vote,
              vote_count: comment.vote_count + voteDiff,
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateVotes(comment.replies),
            };
          }
          return comment;
        });
      };
      
      setComments(updateVotes(comments));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vote. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Comments ({comments.length})
      </h2>

      {/* New comment form */}
      {user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="mb-3"
            rows={3}
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please <a href="/login" className="text-primary hover:underline">login</a> to comment
          </p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postAuthorId={postAuthorId}
            onVote={handleVote}
            onReply={(content) => handleSubmit(comment.id)}
            isReplying={replyingTo === comment.id}
            onStartReply={() => setReplyingTo(comment.id)}
            onCancelReply={() => setReplyingTo(null)}
            depth={0}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
