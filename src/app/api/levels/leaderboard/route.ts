import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const timeframe = searchParams.get('timeframe') || 'all' // all, monthly, weekly
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // 리더보드 데이터 가져오기
    const { data: leaderboard, error } = await supabase
      .rpc('get_leaderboard', {
        p_limit: limit,
        p_offset: offset,
        p_timeframe: timeframe
      })
    
    if (error) {
      throw error
    }
    
    // 현재 사용자의 순위 정보 가져오기
    const { data: { user } } = await supabase.auth.getUser()
    let userRank = null
    
    if (user) {
      // 전체 리더보드에서 현재 사용자 순위 찾기
      const { data: allRanks } = await supabase
        .rpc('get_leaderboard', {
          p_limit: 1000,
          p_offset: 0,
          p_timeframe: timeframe
        })
      
      const userRankData = allRanks?.find(u => u.user_id === user.id)
      if (userRankData) {
        userRank = {
          ...userRankData,
          is_current_user: true
        }
      }
    }
    
    return NextResponse.json({
      leaderboard: leaderboard || [],
      current_user_rank: userRank,
      pagination: {
        limit,
        offset,
        timeframe
      }
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
