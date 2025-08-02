import { supabase } from '@/lib/supabase/client';
import type { Resource, ResourceFilters } from '@/types/resource';
import type { Database } from '@/types/supabase';

interface SearchOptions {
  filters: ResourceFilters;
  page?: number;
  pageSize?: number;
  userId?: string;
}

interface SearchResult {
  resources: Resource[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const searchService = {
  async searchResources({
    filters,
    page = 1,
    pageSize = 20,
    userId,
  }: SearchOptions): Promise<SearchResult> {
    let query = supabase
      .from('resources')
      .select('*, author:profiles!resources_author_id_fkey(*)', { count: 'exact' })
      .eq('status', 'published');

    // Full-text search
    if (filters.search && filters.search.trim()) {
      query = query.textSearch('search_vector', filters.search, {
        type: 'websearch',
        config: 'english',
      });
    }

    // Type filter
    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Level filter
    if (filters.level) {
      query = query.eq('level', filters.level);
    }

    // Author filter
    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }

    // Category filter (requires join)
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const { data: categoryResources } = await supabase
        .from('resource_categories')
        .select('resource_id')
        .in('category_id', filters.categoryIds);
      
      if (categoryResources && categoryResources.length > 0) {
        const resourceIds = categoryResources.map(rc => rc.resource_id);
        query = query.in('id', resourceIds);
      }
    }

    // Tag filter (requires join)
    if (filters.tagIds && filters.tagIds.length > 0) {
      const { data: tagResources } = await supabase
        .from('resource_tags')
        .select('resource_id')
        .in('tag_id', filters.tagIds);
      
      if (tagResources && tagResources.length > 0) {
        const resourceIds = tagResources.map(rt => rt.resource_id);
        query = query.in('id', resourceIds);
      }
    }

    // Sorting
    switch (filters.sort) {
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'votes':
        query = query.order('vote_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const start = (page - 1) * pageSize;
    query = query.range(start, start + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // If user is authenticated, get their votes and bookmarks
    let enrichedResources = data || [];
    if (userId && enrichedResources.length > 0) {
      const resourceIds = enrichedResources.map(r => r.id);

      // Get user votes
      const { data: votes } = await supabase
        .from('resource_votes')
        .select('resource_id, vote')
        .eq('user_id', userId)
        .in('resource_id', resourceIds);

      // Get user bookmarks
      const { data: bookmarks } = await supabase
        .from('resource_bookmarks')
        .select('resource_id')
        .eq('user_id', userId)
        .in('resource_id', resourceIds);

      const voteMap = new Map(votes?.map(v => [v.resource_id, v.vote]) || []);
      const bookmarkSet = new Set(bookmarks?.map(b => b.resource_id) || []);

      enrichedResources = enrichedResources.map(resource => ({
        ...resource,
        user_vote: voteMap.get(resource.id),
        is_bookmarked: bookmarkSet.has(resource.id),
      }));
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      resources: enrichedResources,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },

  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const { data, error } = await supabase
      .from('resources')
      .select('title')
      .eq('status', 'published')
      .ilike('title', `${query}%`)
      .limit(5);

    if (error) throw error;

    return data?.map(r => r.title) || [];
  },

  async getRelatedResources(resourceId: string, limit = 5): Promise<Resource[]> {
    // Get the current resource to find related ones
    const { data: resource } = await supabase
      .from('resources')
      .select('*, resource_categories(category_id), resource_tags(tag_id)')
      .eq('id', resourceId)
      .single();

    if (!resource) return [];

    // Find resources with similar categories or tags
    const categoryIds = resource.resource_categories?.map(rc => rc.category_id) || [];
    const tagIds = resource.resource_tags?.map(rt => rt.tag_id) || [];

    let query = supabase
      .from('resources')
      .select('*, author:profiles!resources_author_id_fkey(*)')
      .eq('status', 'published')
      .neq('id', resourceId)
      .limit(limit);

    if (categoryIds.length > 0 || tagIds.length > 0) {
      // This is a simplified approach - for better results, you might want to
      // create a stored procedure that calculates similarity scores
      if (categoryIds.length > 0) {
        const { data: categoryResources } = await supabase
          .from('resource_categories')
          .select('resource_id')
          .in('category_id', categoryIds);
        
        if (categoryResources && categoryResources.length > 0) {
          const resourceIds = categoryResources.map(rc => rc.resource_id);
          query = query.in('id', resourceIds);
        }
      }
    } else {
      // Fallback to same type and level
      query = query
        .eq('type', resource.type)
        .eq('level', resource.level);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  },

  async getFilterOptions(): Promise<{
    types: Array<{ value: string; label: string; count: number }>;
    levels: Array<{ value: string; label: string; count: number }>;
  }> {
    // Get counts for each type
    const { data: typeCounts } = await supabase
      .from('resources')
      .select('type')
      .eq('status', 'published');

    const typeMap = new Map<string, number>();
    typeCounts?.forEach(r => {
      typeMap.set(r.type, (typeMap.get(r.type) || 0) + 1);
    });

    // Get counts for each level
    const { data: levelCounts } = await supabase
      .from('resources')
      .select('level')
      .eq('status', 'published');

    const levelMap = new Map<string, number>();
    levelCounts?.forEach(r => {
      levelMap.set(r.level, (levelMap.get(r.level) || 0) + 1);
    });

    const typeLabels: Record<string, string> = {
      article: '아티클',
      video: '비디오',
      course: '강의',
      tool: '도구',
      book: '책',
      tutorial: '튜토리얼',
      other: '기타',
    };

    const levelLabels: Record<string, string> = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급',
      all: '모든 수준',
    };

    return {
      types: Array.from(typeMap.entries()).map(([value, count]) => ({
        value,
        label: typeLabels[value] || value,
        count,
      })),
      levels: Array.from(levelMap.entries()).map(([value, count]) => ({
        value,
        label: levelLabels[value] || value,
        count,
      })),
    };
  },
};