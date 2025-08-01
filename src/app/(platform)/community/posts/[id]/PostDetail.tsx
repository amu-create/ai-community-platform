'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronUp, 
  ChevronDown,
  MessageSquare,
  Eye,
  MoreVertical,
  Edit,
  Trash,
  Share2,
  Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { votePost, deletePost } from '@/app/actions/community';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { Post } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';
import ReactMarkdown from 'react-markdown';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);

  const isAuthor = user?.id === post.author_id;

  const handleVote = async (vote: -1 | 1) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to vote on posts',
        variant: 'destructive',
      });
      return;
    }

    setIsVoting(true);
    try {
      const newVote = currentPost.user_vote === vote ? 0 : vote;
      await votePost(post.id, newVote);
      
      // Update local state
      const voteDiff = newVote - (currentPost.user_vote || 0);
      setCurrentPost({
        ...currentPost,
        user_vote: newVote,
        vote_count: currentPost.vote_count + voteDiff,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      router.push('/community');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 200),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Post link copied to clipboard',
      });
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-start gap-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className={cn(
                "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                currentPost.user_vote === 1 && "text-orange-500"
              )}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">{currentPost.vote_count}</span>
            <button
              onClick={() => handleVote(-1)}
              disabled={isVoting}
              className={cn(
                "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                currentPost.user_vote === -1 && "text-blue-500"
              )}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          {/* Post header content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {post.category && (
                <Link href={`/community?category=${post.category.id}`}>
                  <Badge
                    variant="secondary"
                    style={{ 
                      backgroundColor: `${post.category.color}20`,
                      color: post.category.color,
                      borderColor: post.category.color 
                    }}
                  >
                    {post.category.name}
                  </Badge>
                </Link>
              )}
              
              <Link 
                href={`/profile/${post.author?.username}`}
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {post.author?.avatar_url && (
                  <img 
                    src={post.author.avatar_url} 
                    alt={post.author.username}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span>{post.author?.username || 'Anonymous'}</span>
              </Link>

              <span>
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>

              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {post.comment_count}
              </span>

              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {post.view_count}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthor ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push(`/community/posts/${post.id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
