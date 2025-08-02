'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { AdminStats, UserActivity, TopContent, UserGrowth, AdminUser } from '@/types/admin';

// 관리자 권한 확인
async function checkAdminAuth() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: isAdmin } = await supabase
    .rpc('is_admin', { user_id: user.id });
    
  if (!isAdmin) throw new Error('Admin access required');
  
  return { supabase, user };
}

// 대시보드 통계 가져오기
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw new Error('Failed to fetch admin statistics');
  }
}

// 사용자 활동 통계 가져오기
export async function getUserActivityStats(): Promise<UserActivity[]> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const { data, error } = await supabase.rpc('get_user_activity_stats');
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw new Error('Failed to fetch user activity');
  }
}

// 인기 콘텐츠 가져오기
export async function getTopContent(limit: number = 10): Promise<TopContent[]> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const { data, error } = await supabase.rpc('get_top_content', { 
      limit_count: limit 
    });
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching top content:', error);
    throw new Error('Failed to fetch top content');
  }
}

// 사용자 성장 통계
export async function getUserGrowthStats(): Promise<UserGrowth[]> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const { data, error } = await supabase.rpc('get_user_growth_stats');
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user growth:', error);
    throw new Error('Failed to fetch user growth stats');
  }
}

// 모든 사용자 목록 가져오기
export async function getAllUsers(
  page: number = 1, 
  limit: number = 20,
  search?: string
): Promise<{ users: AdminUser[], total: number }> {
  try {
    const { supabase } = await checkAdminAuth();
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        role,
        created_at,
        updated_at
      `, { count: 'exact' });
    
    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
    }
    
    const { data: profiles, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    
    // 각 사용자의 상세 정보 가져오기
    const users = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: userDetails } = await supabase
          .rpc('get_user_details_for_admin', { target_user_id: profile.id });
        return userDetails;
      })
    );
    
    return {
      users: users.filter(Boolean),
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

// 사용자 역할 변경
export async function updateUserRole(
  userId: string, 
  role: 'user' | 'admin' | 'moderator'
): Promise<void> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

// 사용자 정지/활성화
export async function toggleUserStatus(
  userId: string,
  suspend: boolean,
  days?: number
): Promise<void> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const banned_until = suspend && days 
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    // Supabase Auth Admin API를 통해 사용자 상태 업데이트
    // 주의: 이 기능은 Supabase 대시보드에서 Service Role 키가 필요합니다
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: suspend && days ? `${days * 24}h` : undefined
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error('Failed to update user status');
  }
}

// 콘텐츠 삭제 (포스트/댓글/리소스)
export async function deleteContent(
  contentId: string,
  contentType: 'post' | 'comment' | 'resource'
): Promise<void> {
  try {
    const { supabase } = await checkAdminAuth();
    
    const table = contentType === 'post' ? 'posts' 
      : contentType === 'comment' ? 'comments' 
      : 'resources';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'deleted' })
      .eq('id', contentId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting content:', error);
    throw new Error('Failed to delete content');
  }
}

// 대시보드 전체 데이터 가져오기
export async function getAdminDashboardData() {
  try {
    const [stats, activity, topContent, growth] = await Promise.all([
      getAdminStats(),
      getUserActivityStats(),
      getTopContent(),
      getUserGrowthStats()
    ]);
    
    return {
      stats,
      activity,
      topContent,
      growth
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}
