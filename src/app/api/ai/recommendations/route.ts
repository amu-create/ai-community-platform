import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, type = 'general' } = await request.json()
    const targetUserId = userId || user.id

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('skills, interests, level')
      .eq('id', targetUserId)
      .single()

    // 사용자의 최근 활동 가져오기
    const { data: recentActivities } = await supabase
      .from('user_activities')
      .select('activity_type, resource_id, created_at')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(20)

    // 북마크한 리소스 가져오기
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('resource_id')
      .eq('user_id', targetUserId)
      .limit(10)

    // 사용자가 작성한 리소스와 포스트
    const { data: userResources } = await supabase
      .from('resources')
      .select('category, tags')
      .eq('author_id', targetUserId)
      .limit(10)

    // AI 프롬프트 생성
    const prompt = `
      사용자 프로필 분석:
      - 스킬: ${profile?.skills?.join(', ') || '없음'}
      - 관심사: ${profile?.interests?.join(', ') || '없음'}
      - 레벨: ${profile?.level || 1}
      
      최근 활동:
      ${recentActivities?.map(a => `- ${a.activity_type} on resource ${a.resource_id}`).join('\n') || '활동 없음'}
      
      사용자가 작성한 콘텐츠 카테고리:
      ${userResources?.map(r => r.category).filter(Boolean).join(', ') || '없음'}
      
      이 사용자를 위한 AI 학습 추천을 생성해주세요:
      1. 다음 단계 학습 주제 3개
      2. 추천 리소스 카테고리 5개
      3. 스킬 향상을 위한 구체적인 행동 계획 3개
      
      JSON 형식으로 응답해주세요.
    `

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI learning assistant that provides personalized recommendations for AI/ML learners. Always respond in Korean and in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000
    })

    const recommendations = JSON.parse(completion.choices[0].message.content || '{}')

    // 추천 결과에 기반한 실제 리소스 가져오기
    let recommendedResources = []
    if (recommendations.categories && recommendations.categories.length > 0) {
      const { data: resources } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          description,
          category,
          tags,
          difficulty_level,
          author_id,
          profiles!author_id(username, avatar_url)
        `)
        .in('category', recommendations.categories)
        .eq('status', 'published')
        .order('rating', { ascending: false })
        .limit(10)

      recommendedResources = resources || []
    }

    // 추천 기록 저장
    await supabase.from('ai_recommendations').insert({
      user_id: targetUserId,
      recommendations,
      type,
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      recommendations: {
        ...recommendations,
        resources: recommendedResources
      }
    })
  } catch (error) {
    console.error('AI recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// 추천 기록 가져오기
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: recommendations } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
