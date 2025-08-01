export type ResourceType = 'article' | 'video' | 'course' | 'tool' | 'book' | 'tutorial' | 'other';
export type ResourceLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type ResourceStatus = 'draft' | 'published' | 'archived';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url?: string;
  type: ResourceType;
  level: ResourceLevel;
  author_id: string;
  view_count: number;
  vote_count: number;
  status: ResourceStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Relations
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
    full_name?: string;
  };
  user_vote?: number;
  is_bookmarked?: boolean;
}

export interface ResourceVote {
  id: string;
  resource_id: string;
  user_id: string;
  vote: -1 | 1;
  created_at: string;
}

export interface ResourceBookmark {
  id: string;
  resource_id: string;
  user_id: string;
  created_at: string;
}

export interface ResourceView {
  id: string;
  resource_id: string;
  user_id?: string;
  viewed_at: string;
}

export interface ResourceFormData {
  title: string;
  description: string;
  content?: string;
  url?: string;
  type: ResourceType;
  level: ResourceLevel;
  status?: ResourceStatus;
}

export interface ResourceFilters {
  type?: ResourceType;
  level?: ResourceLevel;
  search?: string;
  author_id?: string;
  categoryIds?: string[];
  tagIds?: string[];
  sort?: 'latest' | 'popular' | 'votes';
}
