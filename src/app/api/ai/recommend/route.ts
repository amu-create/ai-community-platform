import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AIRecommendationEngine } from '@/lib/ai/recommendation-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, limit = 10 } = await request.json();

    // AI 추천 엔진 사용
    const engine = new AIRecommendationEngine();
    const recommendations = await engine.generatePersonalizedRecommendations(
      user.id,
      type,
      limit
    );

    // 추천 이유 생성
    const userPreferences = await engine.analyzeUserBehavior(user.id);
    const recommendationsWithReasons = await engine.generateRecommendationReasons(
      recommendations,
      userPreferences
    );

    // 추천 결과를 데이터베이스에 저장
    if (recommendationsWithReasons.length > 0) {
      const recommendationsToSave = recommendationsWithReasons.map((rec: any) => ({
        user_id: user.id,
        resource_id: rec.type === 'resource' ? rec.id : null,
        learning_path_id: rec.type === 'learning_path' ? rec.id : null,
        recommendation_type: rec.type,
        score: rec.score,
        reason: rec.reason,
        metadata: {
          generated_at: new Date().toISOString(),
          model: 'gpt-4-turbo-preview',
          engine_version: '2.0'
        }
      }));

      await supabase
        .from('ai_recommendations')
        .insert(recommendationsToSave);
    }

    // 사용자 선호도 분석 업데이트
    await supabase
      .from('user_preferences_analysis')
      .upsert({
        user_id: user.id,
        category_preferences: userPreferences.categories,
        tag_preferences: userPreferences.tags,
        skill_level_preferences: userPreferences.skill_levels,
        interaction_patterns: userPreferences.learning_patterns,
        last_analyzed_at: new Date().toISOString()
      });

    return NextResponse.json({
      recommendations: recommendationsWithReasons,
      count: recommendationsWithReasons.length
    });

  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// 추천 피드백 처리
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recommendationId, feedbackType, feedbackText } = await request.json();

    // 피드백 저장
    const { error } = await supabase
      .from('ai_feedback')
      .insert({
        user_id: user.id,
        recommendation_id: recommendationId,
        feedback_type: feedbackType,
        feedback_text: feedbackText
      });

    if (error) throw error;

    // 추천 상태 업데이트
    if (feedbackType === 'save') {
      await supabase
        .from('ai_recommendations')
        .update({ is_clicked: true })
        .eq('id', recommendationId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}
