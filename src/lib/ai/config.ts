import OpenAI from 'openai';

// OpenAI 설정
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI 모델 설정
export const AI_MODELS = {
  CURATION: 'gpt-4-turbo-preview',
  EMBEDDING: 'text-embedding-3-small',
  MODERATION: 'text-moderation-latest',
} as const;

// 프롬프트 템플릿
export const PROMPTS = {
  CONTENT_RECOMMENDATION: `
    Based on the user's profile and interaction history, recommend relevant content.
    
    User Profile:
    - Interests: {interests}
    - Skills: {skills}
    - Recent Activities: {activities}
    
    Available Content:
    {content}
    
    Provide recommendations with reasoning for each suggestion.
    Format as JSON: { recommendations: [{ contentId, score, reason }] }
  `,
  
  CONTENT_ANALYSIS: `
    Analyze the following content and extract key information:
    
    Title: {title}
    Description: {description}
    Content: {content}
    
    Extract:
    1. Main topics (3-5 keywords)
    2. Target audience
    3. Difficulty level (beginner/intermediate/advanced)
    4. Key takeaways
    
    Format as JSON.
  `,
  
  USER_INTEREST_EXTRACTION: `
    Based on the user's activities, extract their interests and preferences:
    
    Activities:
    {activities}
    
    Extract:
    1. Primary interests (top 5)
    2. Skill levels in different areas
    3. Content preferences (type, format, length)
    4. Learning goals
    
    Format as JSON.
  `,
} as const;

// AI 서비스 설정
export const AI_CONFIG = {
  // 임베딩 설정
  embedding: {
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },
  
  // 추천 설정
  recommendation: {
    maxRecommendations: 10,
    minScore: 0.7,
    cacheTime: 3600, // 1시간
  },
  
  // 콘텐츠 분석 설정
  analysis: {
    maxContentLength: 4000,
    extractKeywords: 5,
    summarizeLength: 200,
  },
  
  // 중재 설정
  moderation: {
    enabled: true,
    threshold: 0.7,
  },
} as const;

// 에러 재시도 설정
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
} as const;
