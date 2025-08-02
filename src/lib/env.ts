import { z } from 'zod';

// 환경 변수 스키마
const envSchema = z.object({
  // Node 환경
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL이 올바르지 않습니다'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase Anon Key가 필요합니다'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase Service Role Key가 필요합니다').optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API Key가 필요합니다').optional(),
  
  // Database
  DATABASE_URL: z.string().url('Database URL이 올바르지 않습니다').optional(),
  
  // Auth
  NEXTAUTH_URL: z.string().url('NextAuth URL이 올바르지 않습니다').optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth Secret은 최소 32자 이상이어야 합니다').optional(),
  
  // External APIs
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url('App URL이 올바르지 않습니다').default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('AI Community Platform'),
  
  // Analytics
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Storage
  NEXT_PUBLIC_STORAGE_BUCKET: z.string().default('public'),
  MAX_FILE_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.coerce.number().default(60 * 1000), // 1분
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // Security
  CSRF_SECRET: z.string().min(32).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
});

// 환경 변수 검증 및 타입 추출
export type Env = z.infer<typeof envSchema>;

// 검증된 환경 변수 내보내기
export const env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 환경 변수 검증 실패:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      
      // 브라우저 환경에서는 필수 클라이언트 환경변수만 체크
      if (typeof window !== 'undefined') {
        // 클라이언트 사이드에서는 NEXT_PUBLIC_ 환경변수만 필요
        const clientRequiredVars = {
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://ai-community-platform.vercel.app',
          NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'AI Community Platform',
          NODE_ENV: process.env.NODE_ENV || 'production',
        };
        
        // 최소한의 검증만 수행
        if (!clientRequiredVars.NEXT_PUBLIC_SUPABASE_URL || !clientRequiredVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('필수 환경 변수가 설정되지 않았습니다');
        }
        
        // 나머지 기본값 설정
        return {
          ...clientRequiredVars,
          NEXT_PUBLIC_STORAGE_BUCKET: 'public',
          MAX_FILE_SIZE: 5 * 1024 * 1024,
          RATE_LIMIT_WINDOW: 60 * 1000,
          RATE_LIMIT_MAX_REQUESTS: 100,
        } as Env;
      }
      
      // 개발 환경에서만 상세 에러 표시
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`환경 변수 검증 실패:\n${JSON.stringify(error.issues, null, 2)}`);
      } else {
        throw new Error('환경 변수 설정을 확인해주세요');
      }
    }
    throw error;
  }
})();

// 클라이언트용 환경 변수 (NEXT_PUBLIC_ 접두사만)
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_GA_ID: env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_SENTRY_DSN: env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_STORAGE_BUCKET: env.NEXT_PUBLIC_STORAGE_BUCKET,
} as const;

// 환경별 설정
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// 보안 설정
export const security = {
  csrfEnabled: isProduction,
  httpsOnly: isProduction,
  corsOrigins: isProduction 
    ? [env.NEXT_PUBLIC_APP_URL] 
    : ['http://localhost:3000', 'http://localhost:3001'],
} as const;

// Rate Limiting 설정
export const rateLimiting = {
  window: env.RATE_LIMIT_WINDOW,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  // 특정 엔드포인트별 설정
  endpoints: {
    '/api/auth/signup': { window: 60 * 60 * 1000, maxRequests: 5 }, // 1시간 5회
    '/api/auth/signin': { window: 15 * 60 * 1000, maxRequests: 10 }, // 15분 10회
    '/api/resources': { window: 60 * 1000, maxRequests: 30 }, // 1분 30회
    '/api/posts': { window: 60 * 1000, maxRequests: 20 }, // 1분 20회
    '/api/upload': { window: 60 * 60 * 1000, maxRequests: 10 }, // 1시간 10회
  },
} as const;

// 파일 업로드 설정
export const upload = {
  maxFileSize: env.MAX_FILE_SIZE,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocTypes: ['application/pdf', 'text/plain', 'text/markdown'],
  storageBucket: env.NEXT_PUBLIC_STORAGE_BUCKET,
} as const;
