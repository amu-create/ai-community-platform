'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { votePost, getPosts } from '@/app/actions/community';
import type { Post } from '@/types/community';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface CommunityContentProps {
  initialPosts: Post[];
  categories: any[];
  searchParams: {
    category?: string;
    sort?: 'recent' | 'popular' | 'commented';
  };
}

export default function CommunityContent({
  initialPosts,
  categories,
  searchParams,
}: CommunityContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [posts, setPosts] = useState(initialPosts);
  const [votingPostId, setVotingPostId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const selectedCategory = searchParams.category;
  const currentSort = searchParams.sort || 'recent';

  // Reset when filters change
  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(true);
  }, [searchParams.category, searchParams.sort]);

  const loadMorePosts = useCallback(async () => {
    try {
      const nextPage = page + 1;
      const newPosts = await getPosts({
        category_id: selectedCategory,
        sort: currentSort,
        limit,
        offset: nextPage * limit
      });

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(nextPage);
        
        // If we got less than the limit, there are no more posts
        if (newPosts.length < limit) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more posts. Please try again.',
        variant: 'destructive',
      });
    }
  }, [page, selectedCategory, currentSort, limit]);

  const handleSort = (sort: string) => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('sort', sort);
    router.push(`/community?${params.toString()}`);
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    params.set('sort', currentSort);
    router.push(`/community?${params.toString()}`);
  };

  const handleVote = async (postId: string, currentVote: number, newVote: -1 | 1) => {
    setVotingPostId(postId);
    try {
      const voteValue = currentVote === newVote ? 0 : newVote;
      await votePost(postId, voteValue);
      
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const oldVote = post.user_vote || 0;
          const newUserVote = voteValue;
          const voteDiff = newUserVote - oldVote;
          
          return {
            ...post,
            user_vote: newUserVote,
            vote_count: post.vote_count + voteDiff
          };
        }
        return post;
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setVotingPostId(null);
    }
  };

  const PostItem = ({ post }: { post: Post }) => (
    <article className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote(post.id, post.user_vote || 0, 1)}
            disabled={votingPostId === post.id}
            className={cn(
              "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              post.user_vote === 1 && "text-orange-500"
            )}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm">
            {post.vote_count}
          </span>
          <button
            onClick={() => handleVote(post.id, post.user_vote || 0, -1)}
            disabled={votingPostId === post.id}
            className={cn(
              "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              post.user_vote === -1 && "text-blue-500"
            )}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Post content */}
        <div className="flex-1">
          <Link 
            href={`/community/posts/${post.id}`}
            className="block group"
          >
            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {post.content}
            </p>
          </Link>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {post.category && (
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

            <Link 
              href={`/community/posts/${post.id}#comments`}
              className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{post.comment_count} comments</span>
            </Link>

            <span>{post.view_count} views</span>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Tabs value={currentSort} onValueChange={handleSort}>
            <TabsList>
              <TabsTrigger value="recent">
                <Clock className="w-4 h-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="commented">
                <MessageSquare className="w-4 h-4 mr-2" />
                Most Discussed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Link href="/community/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Posts List with Infinite Scroll */}
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No posts yet. Be the first to start a discussion!
            </p>
            <Link href="/community/new">
              <Button>Create First Post</Button>
            </Link>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            }
            endMessage={
              <p className="text-center text-muted-foreground py-4">
                모든 게시물을 불러왔습니다.
              </p>
            }
          >
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          {/* Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md transition-colors",
                  !selectedCategory && "bg-primary/10 text-primary",
                  "hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between",
                    selectedCategory === category.id && "bg-primary/10 text-primary",
                    "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500">
                    {category.resource_count || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-4">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Be respectful and constructive</li>
              <li>• Stay on topic</li>
              <li>• No spam or self-promotion</li>
              <li>• Help others learn and grow</li>
              <li>• Share knowledge generously</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
