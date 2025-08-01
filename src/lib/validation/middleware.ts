import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { sanitize } from './sanitize';

// API 응답 타입
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// 검증 에러 응답 생성
export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(err.message);
  });

  return NextResponse.json(
    {
      success: false,
      error: '입력값이 올바르지 않습니다',
      errors,
    },
    { status: 400 }
  );
}

// 요청 본문 검증 미들웨어
export async function validateBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: '잘못된 요청입니다' },
        { status: 400 }
      ),
    };
  }
}

// 쿼리 파라미터 검증 미들웨어
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: '잘못된 요청입니다' },
        { status: 400 }
      ),
    };
  }
}

// 경로 파라미터 검증 미들웨어
export function validateParams<T>(
  params: any,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    const validated = schema.parse(params);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: '잘못된 요청입니다' },
        { status: 400 }
      ),
    };
  }
}

// 파일 업로드 검증
export async function validateFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): Promise<{ success: true } | { success: false; error: string }> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;

  // 파일 크기 검증
  if (file.size > maxSize) {
    return {
      success: false,
      error: `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다`,
    };
  }

  // MIME 타입 검증
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `허용된 파일 형식: ${allowedTypes.join(', ')}`,
    };
  }

  // 확장자 검증
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      success: false,
      error: `허용된 파일 확장자: ${allowedExtensions.join(', ')}`,
    };
  }

  // 파일 내용 검증 (매직 넘버 체크)
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  const magicNumbers: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46],
  };

  const expectedMagic = magicNumbers[file.type];
  if (expectedMagic) {
    const fileMagic = Array.from(bytes.slice(0, expectedMagic.length));
    if (!expectedMagic.every((byte, index) => byte === fileMagic[index])) {
      return {
        success: false,
        error: '파일 내용이 올바르지 않습니다',
      };
    }
  }

  return { success: true };
}

// CSRF 토큰 검증
export function validateCSRFToken(
  request: NextRequest,
  token: string
): boolean {
  const headerToken = request.headers.get('X-CSRF-Token');
  const cookieToken = request.cookies.get('csrf-token')?.value;
  
  return headerToken === token && cookieToken === token;
}

// Rate Limiting 검증
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  options: {
    windowMs?: number;
    maxRequests?: number;
  } = {}
): { success: true } | { success: false; response: NextResponse } {
  const { windowMs = 60 * 1000, maxRequests = 60 } = options; // 1분당 60회
  
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true };
  }
  
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      ),
    };
  }
  
  record.count++;
  return { success: true };
}

// SQL Injection 방지를 위한 파라미터 바인딩 헬퍼
export function prepareSQLParams(params: Record<string, any>): Record<string, any> {
  const prepared: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      prepared[key] = sanitize.sql(value);
    } else {
      prepared[key] = value;
    }
  }
  
  return prepared;
}

// XSS 방지를 위한 응답 살균
export function sanitizeResponse<T extends Record<string, any>>(
  data: T,
  options: {
    excludeFields?: string[];
    htmlFields?: string[];
    strictFields?: string[];
  } = {}
): T {
  const {
    excludeFields = [],
    htmlFields = [],
    strictFields = [],
  } = options;
  
  const sanitized = { ...data };
  
  for (const [key, value] of Object.entries(sanitized)) {
    if (excludeFields.includes(key)) continue;
    
    if (typeof value === 'string') {
      if (htmlFields.includes(key)) {
        sanitized[key] = sanitize.html(value);
      } else if (strictFields.includes(key)) {
        sanitized[key] = sanitize.strict(value);
      } else {
        sanitized[key] = sanitize.text(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeResponse(value, options);
    }
  }
  
  return sanitized;
}
