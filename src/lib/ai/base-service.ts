import { openai, AI_MODELS, RETRY_CONFIG } from './config';
import { logger } from '@/lib/error/logger';
import { AppError } from '@/lib/errors';

export abstract class BaseAIService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * OpenAI API 호출 with 재시도 로직
   */
  protected async callOpenAI<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        logger.debug(`${this.serviceName}: Calling ${operationName}`, { attempt });
        const result = await operation();
        logger.debug(`${this.serviceName}: ${operationName} successful`);
        return result;
      } catch (error) {
        lastError = error as Error;
        logger.warn(`${this.serviceName}: ${operationName} failed`, {
          attempt,
          error: lastError.message,
        });
        
        if (attempt < RETRY_CONFIG.maxRetries - 1) {
          const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
          await this.delay(delay);
        }
      }
    }
    
    logger.error(`${this.serviceName}: ${operationName} failed after all retries`, {
      error: lastError?.message,
    });
    
    throw new AppError(
      `AI service failed: ${operationName}`,
      'AI_SERVICE_ERROR',
      { service: this.serviceName, operation: operationName }
    );
  }

  /**
   * 텍스트를 임베딩 벡터로 변환
   */
  protected async createEmbedding(text: string): Promise<number[]> {
    return this.callOpenAI(async () => {
      const response = await openai.embeddings.create({
        model: AI_MODELS.EMBEDDING,
        input: text,
      });
      
      return response.data[0].embedding;
    }, 'createEmbedding');
  }

  /**
   * 여러 텍스트를 배치로 임베딩
   */
  protected async createEmbeddings(texts: string[]): Promise<number[][]> {
    return this.callOpenAI(async () => {
      const response = await openai.embeddings.create({
        model: AI_MODELS.EMBEDDING,
        input: texts,
      });
      
      return response.data.map(d => d.embedding);
    }, 'createEmbeddings');
  }

  /**
   * 콘텐츠 중재 (유해 콘텐츠 감지)
   */
  protected async moderateContent(text: string): Promise<{
    flagged: boolean;
    categories: Record<string, boolean>;
    scores: Record<string, number>;
  }> {
    return this.callOpenAI(async () => {
      const response = await openai.moderations.create({
        input: text,
      });
      
      const result = response.results[0];
      return {
        flagged: result.flagged,
        categories: result.categories,
        scores: result.category_scores,
      };
    }, 'moderateContent');
  }

  /**
   * GPT 완성 요청
   */
  protected async complete(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json';
    } = {}
  ): Promise<string> {
    return this.callOpenAI(async () => {
      const response = await openai.chat.completions.create({
        model: options.model || AI_MODELS.CURATION,
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant helping with content curation and analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      });
      
      return response.choices[0].message.content || '';
    }, 'complete');
  }

  /**
   * 지연 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 코사인 유사도 계산
   */
  protected calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 프롬프트 템플릿 채우기
   */
  protected fillPromptTemplate(template: string, variables: Record<string, any>): string {
    let filled = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      filled = filled.replace(regex, JSON.stringify(value));
    }
    
    return filled;
  }
}
