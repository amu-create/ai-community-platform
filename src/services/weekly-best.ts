import { createClient } from '@/lib/supabase/client';

export interface WeeklyBestResource {
  id: string;
  content_id: string;
  score: number;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'tool' | 'book' | 'other';
  created_by: string;
  username: string;
  avatar_url: string | null;
  view_count: number;
  vote_count: number;
  bookmark_count?: number;
  created_at?: string;
}

export interface WeeklyBestPost {
  id: string;
  content_id: string;
  score: number;
  title: string;
  content: string;
  created_by: string;
  username: string;
  avatar_url: string | null;
  view_count: number;
  vote_count: number;
  comment_count: number;
  bookmark_count?: number;
  created_at?: string;
}

export interface WeeklyStats {
  totalResources: number;
  totalPosts: number;
  totalViews: number;
  totalVotes: number;
  topContributors: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    contribution_count: number;
    total_score: number;
  }[];
}

class WeeklyBestService {
  private supabase = createClient();

  async getWeeklyBestResources(limit = 10): Promise<WeeklyBestResource[]> {
    try {
      // Get resources from the last 7 days with calculated scores
      const { data, error } = await this.supabase
        .from('resources')
        .select(`
          *,
          profiles!author_id (
            username,
            avatar_url
          ),
          bookmarks (count),
          votes!resource_id (count)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_featured', true)
        .order('view_count', { ascending: false });

      if (error) throw error;

      // Calculate scores and format data
      const scoredResources = data?.map(resource => {
        const bookmarkCount = resource.bookmarks?.[0]?.count || 0;
        const voteCount = resource.upvotes || 0;
        const score = 
          resource.view_count * 1 +
          voteCount * 10 +
          bookmarkCount * 5;

        return {
          id: resource.id,
          content_id: resource.id,
          score,
          title: resource.title,
          description: resource.description || '',
          url: resource.url,
          type: resource.type,
          created_by: resource.author_id,
          username: resource.profiles?.username || 'Unknown',
          avatar_url: resource.profiles?.avatar_url || null,
          view_count: resource.view_count || 0,
          vote_count: voteCount,
          bookmark_count: bookmarkCount,
          created_at: resource.created_at,
        };
      }) || [];

      // Sort by score and limit
      return scoredResources
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch weekly best resources:', error);
      return [];
    }
  }

  async getWeeklyBestPosts(limit = 10): Promise<WeeklyBestPost[]> {
    try {
      // Get posts from the last 7 days with calculated scores
      const { data, error } = await this.supabase
        .from('posts')
        .select(`
          *,
          profiles!author_id (
            username,
            avatar_url
          ),
          comments (count),
          bookmarks (count),
          votes!post_id (count)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq('is_published', true)
        .order('view_count', { ascending: false });

      if (error) throw error;

      // Calculate scores and format data
      const scoredPosts = data?.map(post => {
        const commentCount = post.comments?.[0]?.count || 0;
        const bookmarkCount = post.bookmarks?.[0]?.count || 0;
        const voteCount = post.upvotes || 0;
        const score = 
          post.view_count * 1 +
          voteCount * 10 +
          commentCount * 5 +
          bookmarkCount * 5;

        return {
          id: post.id,
          content_id: post.id,
          score,
          title: post.title,
          content: post.content,
          created_by: post.author_id,
          username: post.profiles?.username || 'Unknown',
          avatar_url: post.profiles?.avatar_url || null,
          view_count: post.view_count || 0,
          vote_count: voteCount,
          comment_count: commentCount,
          bookmark_count: bookmarkCount,
          created_at: post.created_at,
        };
      }) || [];

      // Sort by score and limit
      return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch weekly best posts:', error);
      return [];
    }
  }

  async getWeeklyStats(): Promise<WeeklyStats | null> {
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get total counts
      const [resourcesCount, postsCount] = await Promise.all([
        this.supabase
          .from('resources')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo),
        this.supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', weekAgo),
      ]);

      // Get aggregated stats
      const { data: topContributors } = await this.supabase
        .rpc('get_weekly_top_contributors', { days: 7 })
        .limit(5);

      return {
        totalResources: resourcesCount.count || 0,
        totalPosts: postsCount.count || 0,
        totalViews: 0, // Would need custom aggregation
        totalVotes: 0, // Would need custom aggregation
        topContributors: topContributors || [],
      };
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
      return null;
    }
  }

  async getDateRange() {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      start: startDate,
      end: endDate,
      formatted: {
        start: startDate.toLocaleDateString('ko-KR'),
        end: endDate.toLocaleDateString('ko-KR'),
      }
    };
  }
}

export const weeklyBestService = new WeeklyBestService();
