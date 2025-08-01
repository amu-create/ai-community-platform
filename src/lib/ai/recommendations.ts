import { createServerClient } from '@/lib/supabase/server';
import { createEmbedding } from './openai';

export interface RecommendationInput {
  userId: string;
  contentType?: 'resource' | 'learning_path' | 'post';
  limit?: number;
  excludeIds?: string[];
}

export interface SimilaritySearchInput {
  embedding: number[];
  contentType?: 'resource' | 'learning_path' | 'post';
  limit?: number;
  threshold?: number;
}

// 코사인 유사도 계산 (Supabase의 vector extension 사용)
export async function findSimilarContent(input: SimilaritySearchInput) {
  const supabase = await createServerClient();
  const { embedding, contentType, limit = 10, threshold = 0.7 } = input;
  
  try {
    // pgvector의 코사인 유사도 연산자 <=> 사용
    const { data, error } = await supabase.rpc('match_content_embeddings', {
      query_embedding: embedding,
      match_count: limit,
      match_threshold: threshold,
      content_type_filter: contentType,
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error finding similar content:', error);
    return [];
  }
}

// 사용자 관심사 기반 추천
export async function getUserInterestEmbedding(userId: string) {
  const supabase = await createServerClient();
  
  try {
    // 사용자의 최근 활동 가져오기
    const { data: activities } = await supabase
      .from('user_activities')
      .select('content_id, content_type, activity_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!activities || activities.length === 0) {
      return null;
    }
    
    // 사용자가 상호작용한 콘텐츠의 임베딩 평균 계산
    const { data: embeddings } = await supabase
      .from('content_embeddings')
      .select('embedding')
      .in('content_id', activities.map(a => a.content_id));
    
    if (!embeddings || embeddings.length === 0) {
      return null;
    }
    
    // 임베딩 평균 계산
    const avgEmbedding = embeddings[0].embedding.map((_: number, i: number) => {
      const sum = embeddings.reduce((acc: number, emb: any) => acc + emb.embedding[i], 0);
      return sum / embeddings.length;
    });
    
    return avgEmbedding;
  } catch (error) {
    console.error('Error getting user interest embedding:', error);
    return null;
  }
}

// 개인화된 추천 생성
export async function getPersonalizedRecommendations(input: RecommendationInput) {
  const { userId, contentType, limit = 10, excludeIds = [] } = input;
  const supabase = await createServerClient();
  
  try {
    // 1. 사용자 관심사 임베딩 가져오기
    const userEmbedding = await getUserInterestEmbedding(userId);
    
    if (!userEmbedding) {
      // 신규 사용자의 경우 인기 콘텐츠 반환
      return getPopularContent({ contentType, limit, excludeIds });
    }
    
    // 2. 유사한 콘텐츠 찾기
    const similarContent = await findSimilarContent({
      embedding: userEmbedding,
      contentType,
      limit: limit * 2, // 필터링을 위해 더 많이 가져옴
    });
    
    // 3. 이미 본 콘텐츠 제외
    const filtered = similarContent
      .filter((item: any) => !excludeIds.includes(item.content_id))
      .slice(0, limit);
    
    // 4. 콘텐츠 상세 정보 가져오기
    return enrichRecommendations(filtered);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
}

// 인기 콘텐츠 가져오기 (폴백)
export async function getPopularContent(options: {
  contentType?: string;
  limit: number;
  excludeIds: string[];
}) {
  const supabase = await createServerClient();
  const { contentType, limit, excludeIds } = options;
  
  try {
    let query = supabase
      .from('content_stats')
      .select('content_id, engagement_score')
      .order('engagement_score', { ascending: false })
      .limit(limit * 2);
    
    if (excludeIds.length > 0) {
      query = query.not('content_id', 'in', excludeIds);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return enrichRecommendations(data?.slice(0, limit) || []);
  } catch (error) {
    console.error('Error getting popular content:', error);
    return [];
  }
}

// 추천 결과에 상세 정보 추가
async function enrichRecommendations(recommendations: any[]) {
  const supabase = await createServerClient();
  
  if (recommendations.length === 0) return [];
  
  try {
    // 콘텐츠 ID 목록 추출
    const contentIds = recommendations.map(r => r.content_id);
    
    // 각 콘텐츠 타입별로 정보 가져오기
    const [resources, learningPaths, posts] = await Promise.all([
      supabase
        .from('resources')
        .select('*, categories(name, slug), author:profiles(username, avatar_url)')
        .in('id', contentIds),
      supabase
        .from('learning_paths')
        .select('*, category:categories(name, slug), author:profiles(username, avatar_url)')
        .in('id', contentIds),
      supabase
        .from('posts')
        .select('*, category:categories(name, slug), author:profiles(username, avatar_url)')
        .in('id', contentIds),
    ]);
    
    // 결과 통합
    const allContent = [
      ...(resources.data || []).map(r => ({ ...r, type: 'resource' })),
      ...(learningPaths.data || []).map(lp => ({ ...lp, type: 'learning_path' })),
      ...(posts.data || []).map(p => ({ ...p, type: 'post' })),
    ];
    
    // 추천 순서대로 정렬
    return recommendations.map(rec => {
      const content = allContent.find(c => c.id === rec.content_id);
      return {
        ...content,
        similarity_score: rec.similarity,
        recommendation_reason: rec.reason,
      };
    }).filter(Boolean);
  } catch (error) {
    console.error('Error enriching recommendations:', error);
    return recommendations;
  }
}

// 콘텐츠 임베딩 생성 및 저장
export async function createAndStoreEmbedding(
  contentId: string,
  contentType: 'resource' | 'learning_path' | 'post',
  text: string
) {
  const supabase = await createServerClient();
  
  try {
    // 1. 임베딩 생성
    const embedding = await createEmbedding(text);
    
    // 2. 메타데이터 생성
    const metadata = {
      content_length: text.length,
      created_at: new Date().toISOString(),
      model: 'text-embedding-ada-002',
    };
    
    // 3. 데이터베이스에 저장
    const { error } = await supabase
      .from('content_embeddings')
      .upsert({
        content_id: contentId,
        content_type: contentType,
        embedding,
        metadata,
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error creating and storing embedding:', error);
    return { success: false, error };
  }
}
