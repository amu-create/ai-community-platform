import { createClient } from '@/lib/supabase/client';
import type { Resource, ResourceFormData, ResourceFilters } from '@/types/resource';

export class ResourceService {
  private supabase = createClient();

  // 리소스 목록 조회
  async getResources(filters: ResourceFilters = {}, page = 1, limit = 20) {
    let query = this.supabase
      .from('resources')
      .select(`
        *,
        author:user_profiles!author_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        user_vote:resource_votes(vote),
        is_bookmarked:resource_bookmarks(id)
      `)
      .eq('status', 'published');

    // 필터 적용
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.level) {
      query = query.eq('level', filters.level);
    }
    if (filters.author_id) {
      query = query.eq('author_id', filters.author_id);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // 카테고리 필터
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const { data: resourceIds } = await this.supabase
        .from('resource_categories')
        .select('resource_id')
        .in('category_id', filters.categoryIds);
      
      if (resourceIds && resourceIds.length > 0) {
        query = query.in('id', resourceIds.map(r => r.resource_id));
      } else {
        // No matching resources
        return { resources: [], count: 0 };
      }
    }

    // 태그 필터
    if (filters.tagIds && filters.tagIds.length > 0) {
      const { data: resourceIds } = await this.supabase
        .from('resource_tags')
        .select('resource_id')
        .in('tag_id', filters.tagIds);
      
      if (resourceIds && resourceIds.length > 0) {
        query = query.in('id', resourceIds.map(r => r.resource_id));
      } else {
        // No matching resources
        return { resources: [], count: 0 };
      }
    }

    // 정렬
    switch (filters.sort) {
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'votes':
        query = query.order('vote_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // 페이지네이션
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // 사용자 투표와 북마크 정보 처리
    const resources = data?.map(resource => ({
      ...resource,
      user_vote: resource.user_vote?.[0]?.vote || 0,
      is_bookmarked: (resource.is_bookmarked?.length || 0) > 0
    })) || [];

    return { resources, count };
  }

  // 단일 리소스 조회
  async getResource(id: string) {
    const { data, error } = await this.supabase
      .from('resources')
      .select(`
        *,
        author:user_profiles!author_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        user_vote:resource_votes(vote),
        is_bookmarked:resource_bookmarks(id)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // 조회수 증가
    await this.incrementViewCount(id);

    return {
      ...data,
      user_vote: data.user_vote?.[0]?.vote || 0,
      is_bookmarked: (data.is_bookmarked?.length || 0) > 0
    };
  }

  // 리소스 생성
  async createResource(data: ResourceFormData) {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: resource, error } = await this.supabase
      .from('resources')
      .insert({
        ...data,
        author_id: user.user.id,
        published_at: data.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;
    return resource;
  }

  // 리소스 수정
  async updateResource(id: string, data: Partial<ResourceFormData>) {
    const { data: resource, error } = await this.supabase
      .from('resources')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        published_at: data.status === 'published' ? new Date().toISOString() : undefined
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return resource;
  }

  // 리소스 삭제
  async deleteResource(id: string) {
    const { error } = await this.supabase
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // 투표
  async voteResource(resourceId: string, vote: -1 | 1) {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await this.supabase
      .from('resource_votes')
      .upsert({
        resource_id: resourceId,
        user_id: user.user.id,
        vote
      });

    if (error) throw error;
  }

  // 투표 취소
  async removeVote(resourceId: string) {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await this.supabase
      .from('resource_votes')
      .delete()
      .eq('resource_id', resourceId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // 북마크 토글
  async toggleBookmark(resourceId: string) {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // 기존 북마크 확인
    const { data: existing } = await this.supabase
      .from('resource_bookmarks')
      .select()
      .eq('resource_id', resourceId)
      .eq('user_id', user.user.id)
      .single();

    if (existing) {
      // 북마크 제거
      const { error } = await this.supabase
        .from('resource_bookmarks')
        .delete()
        .eq('resource_id', resourceId)
        .eq('user_id', user.user.id);

      if (error) throw error;
      return false;
    } else {
      // 북마크 추가
      const { error } = await this.supabase
        .from('resource_bookmarks')
        .insert({
          resource_id: resourceId,
          user_id: user.user.id
        });

      if (error) throw error;
      return true;
    }
  }

  // 조회수 증가
  private async incrementViewCount(resourceId: string) {
    const { data: user } = await this.supabase.auth.getUser();
    
    await this.supabase
      .from('resource_views')
      .insert({
        resource_id: resourceId,
        user_id: user.user?.id
      });
  }
}

export const resourceService = new ResourceService();
