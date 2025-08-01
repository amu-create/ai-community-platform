import { BaseAIService } from './base-service';
import { PROMPTS, AI_CONFIG } from './config';
import { logger } from '@/lib/error/logger';
import { supabase } from '@/lib/supabase/client';

export interface ContentAnalysis {
  topics: string[];
  targetAudience: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  keyTakeaways: string[];
  summary: string;
  embedding?: number[];
}

export interface ContentMetadata {
  contentId: string;
  title: string;
  description: string;
  content: string;
  authorId: string;
  type: 'post' | 'resource' | 'event' | 'project';
  tags?: string[];
}

export class ContentAnalysisService extends BaseAIService {
  constructor() {
    super('ContentAnalysisService');
  }

  /**
   * 콘텐츠 분석 및 메타데이터 추출
   */
  async analyzeContent(metadata: ContentMetadata): Promise<ContentAnalysis> {
    try {
      logger.info('Analyzing content', { contentId: metadata.contentId });

      // 콘텐츠 중재 체크
      const moderation = await this.moderateContent(
        `${metadata.title} ${metadata.description} ${metadata.content}`
      );

      if (moderation.flagged) {
        logger.warn('Content flagged by moderation', {
          contentId: metadata.contentId,
          categories: moderation.categories,
        });
      }

      // 콘텐츠 분석 프롬프트 생성
      const prompt = this.fillPromptTemplate(PROMPTS.CONTENT_ANALYSIS, {
        title: metadata.title,
        description: metadata.description,
        content: metadata.content.substring(0, AI_CONFIG.analysis.maxContentLength),
      });

      // AI 분석 실행
      const analysisResponse = await this.complete(prompt, {
        responseFormat: 'json',
        temperature: 0.3,
      });

      const analysis = JSON.parse(analysisResponse);

      // 요약 생성
      const summary = await this.generateSummary(metadata.content);

      // 임베딩 생성
      const embeddingText = `${metadata.title} ${metadata.description} ${analysis.topics.join(' ')}`;
      const embedding = await this.createEmbedding(embeddingText);

      const result: ContentAnalysis = {
        topics: analysis.topics || [],
        targetAudience: analysis.targetAudience || 'general',
        difficultyLevel: analysis.difficultyLevel || 'intermediate',
        keyTakeaways: analysis.keyTakeaways || [],
        summary,
        embedding,
      };

      // 분석 결과 저장
      await this.saveAnalysis(metadata.contentId, result);

      return result;
    } catch (error) {
      logger.error('Content analysis failed', {
        contentId: metadata.contentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * 콘텐츠 요약 생성
   */
  private async generateSummary(content: string): Promise<string> {
    const prompt = `
      Summarize the following content in ${AI_CONFIG.analysis.summarizeLength} characters or less:
      
      ${content.substring(0, AI_CONFIG.analysis.maxContentLength)}
      
      Focus on the main points and key takeaways.
    `;

    const summary = await this.complete(prompt, {
      temperature: 0.5,
      maxTokens: 200,
    });

    return summary.trim();
  }

  /**
   * 분석 결과 저장
   */
  private async saveAnalysis(contentId: string, analysis: ContentAnalysis): Promise<void> {
    const { error } = await supabase
      .from('content_analysis')
      .upsert({
        content_id: contentId,
        topics: analysis.topics,
        target_audience: analysis.targetAudience,
        difficulty_level: analysis.difficultyLevel,
        key_takeaways: analysis.keyTakeaways,
        summary: analysis.summary,
        embedding: analysis.embedding,
        analyzed_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Failed to save content analysis', { contentId, error });
      throw error;
    }
  }

  /**
   * 배치 콘텐츠 분석
   */
  async analyzeContentBatch(contents: ContentMetadata[]): Promise<Map<string, ContentAnalysis>> {
    const results = new Map<string, ContentAnalysis>();
    
    // 배치 처리를 위한 청크 나누기
    const chunks = this.chunkArray(contents, 5);
    
    for (const chunk of chunks) {
      const promises = chunk.map(content => 
        this.analyzeContent(content)
          .then(analysis => results.set(content.contentId, analysis))
          .catch(error => {
            logger.error('Batch analysis failed for content', {
              contentId: content.contentId,
              error,
            });
          })
      );
      
      await Promise.all(promises);
    }
    
    return results;
  }

  /**
   * 키워드 추출
   */
  async extractKeywords(text: string, count: number = 5): Promise<string[]> {
    const prompt = `
      Extract ${count} most important keywords from the following text:
      
      ${text}
      
      Return only the keywords as a JSON array.
    `;

    const response = await this.complete(prompt, {
      responseFormat: 'json',
      temperature: 0.3,
    });

    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  /**
   * 유사 콘텐츠 찾기
   */
  async findSimilarContent(
    contentId: string,
    limit: number = 5
  ): Promise<Array<{ contentId: string; similarity: number }>> {
    // 현재 콘텐츠의 임베딩 가져오기
    const { data: currentAnalysis, error } = await supabase
      .from('content_analysis')
      .select('embedding')
      .eq('content_id', contentId)
      .single();

    if (error || !currentAnalysis?.embedding) {
      logger.error('Failed to get content embedding', { contentId, error });
      return [];
    }

    // 모든 콘텐츠의 임베딩 가져오기 (실제로는 벡터 DB 사용 권장)
    const { data: allAnalysis, error: allError } = await supabase
      .from('content_analysis')
      .select('content_id, embedding')
      .neq('content_id', contentId);

    if (allError || !allAnalysis) {
      logger.error('Failed to get all embeddings', { error: allError });
      return [];
    }

    // 유사도 계산
    const similarities = allAnalysis
      .filter(a => a.embedding)
      .map(analysis => ({
        contentId: analysis.content_id,
        similarity: this.calculateCosineSimilarity(
          currentAnalysis.embedding,
          analysis.embedding
        ),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return similarities;
  }

  /**
   * 배열을 청크로 나누기
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// 싱글톤 인스턴스
export const contentAnalysisService = new ContentAnalysisService();
