import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const targetUserId = userId || user.id
    
    // 사용자 레벨 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, total_points, current_level, level_progress')
      .eq('id', targetUserId)
      .single()
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // 현재 레벨 정보
    const { data: currentLevelInfo } = await supabase
      .from('level_definitions')
      .select('*')
      .eq('level', profile.current_level || 1)
      .single()
    
    // 다음 레벨까지 필요한 포인트
    const { data: nextLevelData } = await supabase
      .rpc('get_points_to_next_level', { p_user_id: targetUserId })
    
    // 포인트 통계
    const { data: pointStats } = await supabase
      .rpc('get_user_points_stats', { p_user_id: targetUserId })
    
    // 최근 포인트 획득 내역
    const { data: recentPoints } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      profile: {
        ...profile,
        level_info: currentLevelInfo
      },
      next_level: nextLevelData?.[0] || null,
      point_stats: pointStats || [],
      recent_points: recentPoints || []
    })
  } catch (error) {
    console.error('Level API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 수동으로 포인트 추가 (관리자용)
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { userId, actionType, actionId, description } = body
    
    if (!userId || !actionType) {
      return NextResponse.json(
        { error: 'userId and actionType are required' },
        { status: 400 }
      )
    }
    
    // 포인트 추가
    const { data, error } = await supabase
      .rpc('add_user_points', {
        p_user_id: userId,
        p_action_type: actionType,
        p_action_id: actionId || null,
        p_description: description || null
      })
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ success: true, points_added: data })
  } catch (error) {
    console.error('Add points error:', error)
    return NextResponse.json(
      { error: 'Failed to add points' },
      { status: 500 }
    )
  }
}
