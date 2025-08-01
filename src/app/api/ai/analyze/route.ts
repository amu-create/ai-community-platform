import { NextRequest, NextResponse } from 'next/server';
import { contentAnalysisService } from '@/lib/ai/content-analysis';
import { createServerClient } from '@/lib/supabase/server';
import { handleApiError } from '@/lib/error-handler';
import { AppError, UnauthorizedError, BadRequestError, NotFoundError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = await req.json();
    const { contentId, forceReanalyze = false } = body;

    if (!contentId) {
      throw new BadRequestError('Content ID is required');
    }

    // 콘텐츠 가져오기
    const { data: content, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (error || !content) {
      throw new NotFoundError('Content not found');
    }

    // 기존 분석 확인
    if (!forceReanalyze) {
      const { data: existingAnalysis } = await supabase
        .from('content_analysis')
        .select('*')
        .eq('content_id', contentId)
        .single();

      if (existingAnalysis) {
        return NextResponse.json({ 
          analysis: existingAnalysis,
          cached: true 
        });
      }
    }

    // 콘텐츠 분석 실행
    const analysis = await contentAnalysisService.analyzeContent({
      contentId: content.id,
      title: content.title,
      description: content.description || '',
      content: content.content || '',
      authorId: content.author_id,
      type: content.type,
      tags: content.tags,
    });

    return NextResponse.json({ 
      analysis,
      cached: false 
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// 유사 콘텐츠 찾기
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get('contentId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!contentId) {
      throw new BadRequestError('Content ID is required');
    }

    // 유사 콘텐츠 찾기
    const similarContents = await contentAnalysisService.findSimilarContent(
      contentId,
      limit
    );

    // 콘텐츠 정보 가져오기
    const contentIds = similarContents.map(s => s.contentId);
    const { data: contents, error } = await supabase
      .from('contents')
      .select(`
        *,
        profiles!author_id (id, full_name, avatar_url)
      `)
      .in('id', contentIds)
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    // 유사도 점수와 함께 반환
    const results = contents?.map(content => {
      const similarity = similarContents.find(s => s.contentId === content.id);
      return {
        ...content,
        similarity: similarity?.similarity || 0,
      };
    }).sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ 
      similarContents: results || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}