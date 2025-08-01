// Database types for community features
export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  vote_count: number;
  comment_count: number;
  view_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  
  // Relations
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  user_vote?: number; // -1, 0, or 1
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string;
  content: string;
  vote_count: number;
  status: 'active' | 'deleted' | 'hidden';
  created_at: string;
  updated_at: string;
  
  // Relations
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  replies?: Comment[];
  user_vote?: number;
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote: -1 | 1;
  created_at: string;
}

export interface CommentVote {
  id: string;
  comment_id: string;
  user_id: string;
  vote: -1 | 1;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  metadata: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// API types
export interface CreatePostInput {
  title: string;
  content: string;
  category_id?: string;
  status?: 'draft' | 'published';
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  category_id?: string | null;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreateCommentInput {
  post_id: string;
  parent_id?: string;
  content: string;
}
