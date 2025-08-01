import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserActivity {
  user_id: string;
  activity_type: string;
  content_id: string;
  content_type: string;
  metadata?: any;
  created_at: string;
}

interface UserPreferences {
  categories: Record<string, number>;
  tags: Record<string, number>;
  skill_levels: Record<string, number>;
  content_types: Record<string, number>;
  learning_patterns: {
    most_active_time?: string;
    avg_session_duration?: number;
    preferred_content_length?: string;
    engagement_score?: number;
  };
}

export class AIRecommendationEngine {
  private supabase = createClient();

  async analyzeUserBehavior(userId: string): Promise<UserPreferences> {
    // 사용자 활동 데이터 수집
    const { data: activities } = await this.supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // 사용자 북마크 데이터
    const { data: bookmarks } = await this.supabase
      .from('resource_bookmarks')
      .select(`
        resource_id,
        resources (
          id,
          type,
          skill_level,
          metadata
        )
      `)
      .eq('user_id', userId);

    // 사용자가 작성한 콘텐츠
    const { data: userContent } = await this.supabase
      .from('posts')
      .select('category_id, metadata')
      .eq('author_id', userId);

    // 선호도 분석
    const preferences: UserPreferences = {
      categories: {},
      tags: {},
      skill_levels: {},
      content_types: {},
      learning_patterns: {}
    };

    // 활동 기반 선호도 계산
    if (activities) {
      activities.forEach((activity: UserActivity) => {
        // 카테고리 선호도
        if (activity.metadata?.category) {
          preferences.categories[activity.metadata.category] = 
            (preferences.categories[activity.metadata.category] || 0) + 1;
        }

        // 태그 선호도
        if (activity.metadata?.tags) {
          activity.metadata.tags.forEach((tag: string) => {
            preferences.tags[tag] = (preferences.tags[tag] || 0) + 1;
          });
        }

        // 콘텐츠 타입 선호도
        preferences.content_types[activity.content_type] = 
          (preferences.content_types[activity.content_type] || 0) + 1;
      });
    }

    // 시간대별 활동 패턴 분석
    if (activities && activities.length > 0) {
      const hourCounts: Record<number, number> = {};
      activities.forEach((activity: UserActivity) => {
        const hour = new Date(activity.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const mostActiveHour = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      preferences.learning_patterns.most_active_time = 
        mostActiveHour ? `${mostActiveHour}:00` : undefined;
    }

    return preferences;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return [];
    }
  }

  async findSimilarContent(
    contentType: 'resource' | 'learning_path',
    userPreferences: UserPreferences,
    limit: number = 10
  ) {
    // 사용자 선호도를 텍스트로 변환
    const preferenceText = this.preferencesToText(userPreferences);
    const embedding = await this.generateEmbedding(preferenceText);

    if (embedding.length === 0) {
      return [];
    }

    // 벡터 유사도 검색
    const { data: similarContent } = await this.supabase.rpc(
      'search_similar_content',
      {
        query_embedding: embedding,
        match_count: limit,
        content_type: contentType
      }
    );

    return similarContent || [];
  }

  private preferencesToText(preferences: UserPreferences): string {
    const parts = [];

    // 카테고리 선호도
    const topCategories = Object.entries(preferences.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat);
    
    if (topCategories.length > 0) {
      parts.push(`Interested in ${topCategories.join(', ')}`);
    }

    // 태그 선호도
    const topTags = Object.entries(preferences.tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    if (topTags.length > 0) {
      parts.push(`Topics: ${topTags.join(', ')}`);
    }

    // 스킬 레벨
    const topSkillLevel = Object.entries(preferences.skill_levels)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    
    if (topSkillLevel) {
      parts.push(`Skill level: ${topSkillLevel}`);
    }

    // 학습 패턴
    if (preferences.learning_patterns.most_active_time) {
      parts.push(`Active time: ${preferences.learning_patterns.most_active_time}`);
    }

    return parts.join('. ');
  }

  async generatePersonalizedRecommendations(
    userId: string,
    type: 'resource' | 'learning_path' | 'mixed',
    limit: number = 10
  ) {
    // 사용자 행동 분석
    const userPreferences = await this.analyzeUserBehavior(userId);

    // 콘텐츠 검색
    let recommendations = [];

    if (type === 'resource' || type === 'mixed') {
      const resources = await this.findSimilarContent('resource', userPreferences, limit);
      recommendations.push(...resources.map((r: any) => ({
        ...r,
        type: 'resource',
        score: r.similarity || 0.5
      })));
    }

    if (type === 'learning_path' || type === 'mixed') {
      const paths = await this.findSimilarContent('learning_path', userPreferences, limit);
      recommendations.push(...paths.map((p: any) => ({
        ...p,
        type: 'learning_path',
        score: p.similarity || 0.5
      })));
    }

    // 점수별로 정렬하고 상위 N개 반환
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, limit);
  }

  async generateRecommendationReasons(
    recommendations: any[],
    userPreferences: UserPreferences
  ): Promise<any[]> {
    const prompt = `
      Based on the user preferences and recommended content, generate brief, 
      personalized reasons for each recommendation.
      
      User Preferences:
      ${JSON.stringify(userPreferences, null, 2)}
      
      Recommendations:
      ${JSON.stringify(recommendations.map(r => ({
        title: r.title,
        description: r.description,
        type: r.type
      })), null, 2)}
      
      Generate a JSON array with reasons for each recommendation.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful AI learning assistant that explains recommendations.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"reasons": []}');
      
      return recommendations.map((rec, index) => ({
        ...rec,
        reason: result.reasons?.[index] || 'Recommended based on your interests'
      }));
    } catch (error) {
      console.error('Error generating reasons:', error);
      return recommendations.map(rec => ({
        ...rec,
        reason: 'Recommended based on your learning preferences'
      }));
    }
  }
}
