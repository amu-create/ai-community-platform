'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { 
  AIRecommendation, 
  AIAnalysis, 
  AIChat, 
  AIMessage, 
  ContentEmbedding,
  AIResponse 
} from '@/types/ai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 인증 확인
async function checkAuth() {
  const supabase = createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  return { supabase, user };
}

// 텍스트를 임베딩으로 변환
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// 콘텐츠 임베딩 생성 및 저장
export async function createContentEmbedding(
  contentType: 'resource' | 'learning_path' | 'post',
  contentId: string,
  title: string,
  description: string,
  tags: string[] = []
): Promise<void> {
  try {
    const { supabase } = await checkAuth();
    
    // 임베딩할 텍스트 준비
    const textToEmbed = `${title} ${description} ${tags.join(' ')}`;
    const embedding = await generateEmbedding(textToEmbed);
    
    // 임베딩 저장
    const { error } = await supabase
      .from('content_embeddings')
      .upsert({
        content_type: contentType,
        content_id: contentId,
        embedding,
        metadata: {
          title,
          description,
          tags,
        },
      });
      
    if (error) throw error;
  } catch (error) {
    console.error('Error creating content embedding:', error);
    throw new Error('Failed to create content embedding');
  }
}

// 사용자를 위한 AI 추천 생성
export async function generateRecommendations(
  userId: string
): Promise<AIRecommendation[]> {
  try {
    const { supabase } = await checkAuth();
    
    // 사용자 프로필 및 활동 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('interests, skill_level')
      .eq('id', userId)
      .single();
      
    // 사용자 최근 활동 가져오기
    const { data: recentActivities } = await supabase
      .from('user_progress')
      .select('learning_path_id')
      .eq('user_id', userId)
      .order('last_accessed', { ascending: false })
      .limit(5);
      
    // GPT로 추천 컨텍스트 생성
    const systemPrompt = `You are an AI learning assistant that recommends educational content.
    Based on the user's profile and activity, suggest relevant resources, learning paths, and posts.
    Return recommendations as a JSON array with fields: type, itemId, score (0-1), reason.`;
    
    const userContext = `
    User Profile:
    - Interests: ${profile?.interests?.join(', ') || 'Not specified'}
    - Skill Level: ${profile?.skill_level || 'Beginner'}
    - Recent Activities: ${recentActivities?.map(a => a.learning_path_id).join(', ') || 'None'}
    `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContext }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    
    const recommendations = JSON.parse(completion.choices[0].message.content || '{"recommendations": []}');
    
    // 추천 저장
    if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
      const { error } = await supabase
        .from('ai_recommendations')
        .upsert(
          recommendations.recommendations.map((rec: any) => ({
            user_id: userId,
            type: rec.type,
            item_id: rec.itemId,
            score: rec.score,
            reason: rec.reason,
          }))
        );
        
      if (error) console.error('Error saving recommendations:', error);
    }
    
    // 저장된 추천 반환
    const { data } = await supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .limit(10);
      
    return data || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// 사용자 행동 분석
export async function analyzeUserBehavior(userId: string): Promise<AIAnalysis> {
  try {
    const { supabase } = await checkAuth();
    
    // 사용자 활동 데이터 수집
    const [profile, posts, comments, resources, progress] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('posts').select('category_id, created_at').eq('author_id', userId),
      supabase.from('comments').select('created_at').eq('author_id', userId),
      supabase.from('resources').select('categories, created_at').eq('author_id', userId),
      supabase.from('user_progress').select('*').eq('user_id', userId),
    ]);
    
    // GPT로 사용자 분석
    const analysisPrompt = `Analyze this user's learning behavior and preferences:
    - Profile: ${JSON.stringify(profile.data)}
    - Posts: ${posts.data?.length || 0} posts
    - Comments: ${comments.data?.length || 0} comments
    - Resources created: ${resources.data?.length || 0}
    - Learning progress: ${JSON.stringify(progress.data)}
    
    Return a JSON object with: interests[], skillLevel, learningStyle, preferredContentTypes[], activityPatterns{}`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an AI that analyzes user learning patterns. Return only valid JSON.' 
        },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // 분석 결과 저장
    const { error } = await supabase
      .from('user_ai_analysis')
      .upsert({
        user_id: userId,
        ...analysis,
        last_updated: new Date().toISOString(),
      });
      
    if (error) throw error;
    
    return {
      userId,
      ...analysis,
    };
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    throw new Error('Failed to analyze user behavior');
  }
}

// AI 채팅 세션 생성
export async function createChatSession(
  title?: string,
  context?: string
): Promise<string> {
  try {
    const { supabase, user } = await checkAuth();
    
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .insert({
        user_id: user.id,
        title: title || 'New Chat',
        context,
      })
      .select('id')
      .single();
      
    if (error) throw error;
    
    return data.id;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw new Error('Failed to create chat session');
  }
}

// AI 채팅 메시지 전송
export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<AIMessage> {
  try {
    const { supabase, user } = await checkAuth();
    
    // 세션 확인
    const { data: session } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();
      
    if (!session) throw new Error('Session not found');
    
    // 이전 메시지 가져오기
    const { data: previousMessages } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);
      
    // 사용자 메시지 저장
    const { data: userMessage } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'user',
        content: message,
      })
      .select()
      .single();
      
    // GPT 응답 생성
    const messages = [
      { 
        role: 'system' as const, 
        content: `You are an AI learning assistant for a community platform. 
        Help users with learning resources, answer questions, and provide guidance.
        ${session.context ? `Context: ${session.context}` : ''}` 
      },
      ...(previousMessages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    const assistantContent = completion.choices[0].message.content || 'Sorry, I could not generate a response.';
    
    // AI 응답 저장
    const { data: assistantMessage, error } = await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: assistantContent,
        metadata: {
          model: 'gpt-4-turbo-preview',
          tokens: completion.usage?.total_tokens,
        },
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return assistantMessage;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send chat message');
  }
}

// 콘텐츠 요약 생성
export async function summarizeContent(
  content: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: `Summarize the following content in ${maxLength} characters or less. 
          Focus on key points and main ideas.` 
        },
        { role: 'user', content }
      ],
      temperature: 0.5,
      max_tokens: Math.floor(maxLength / 4), // Rough estimate
    });
    
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error summarizing content:', error);
    throw new Error('Failed to summarize content');
  }
}

// 유사 콘텐츠 검색
export async function findSimilarContent(
  text: string,
  limit: number = 5
): Promise<Array<{ type: string; id: string; similarity: number }>> {
  try {
    const { supabase } = await checkAuth();
    
    // 텍스트 임베딩 생성
    const embedding = await generateEmbedding(text);
    
    // 유사 콘텐츠 검색
    const { data, error } = await supabase
      .rpc('search_similar_content', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
      });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error finding similar content:', error);
    throw new Error('Failed to find similar content');
  }
}

// 학습 경로 추천
export async function recommendLearningPath(userId: string): Promise<any> {
  try {
    const { supabase } = await checkAuth();
    
    // 사용자 분석 가져오기
    const { data: analysis } = await supabase
      .from('user_ai_analysis')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (!analysis) {
      // 분석이 없으면 생성
      await analyzeUserBehavior(userId);
    }
    
    // 사용 가능한 학습 경로 가져오기
    const { data: paths } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('status', 'published');
      
    // GPT로 추천
    const prompt = `Based on user analysis: ${JSON.stringify(analysis)}
    Recommend the best learning paths from: ${JSON.stringify(paths)}
    Return top 3 recommendations with reasons.`;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You recommend learning paths based on user preferences and behavior.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error recommending learning path:', error);
    throw new Error('Failed to recommend learning path');
  }
}

// 채팅 세션 목록 가져오기
export async function getChatSessions(): Promise<AIChat[]> {
  try {
    const { supabase, user } = await checkAuth();
    
    const { data, error } = await supabase
      .from('ai_chat_sessions')
      .select(`
        *,
        ai_chat_messages (
          id,
          role,
          content,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    
    return data?.map(session => ({
      id: session.id,
      userId: session.user_id,
      messages: session.ai_chat_messages || [],
      context: session.context,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    })) || [];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    throw new Error('Failed to get chat sessions');
  }
}

// 채팅 메시지 가져오기
export async function getChatMessages(sessionId: string): Promise<AIMessage[]> {
  try {
    const { supabase } = await checkAuth();
    
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data?.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at,
      metadata: msg.metadata,
    })) || [];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw new Error('Failed to get chat messages');
  }
}
