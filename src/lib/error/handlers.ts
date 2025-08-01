import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { 
  AppError, 
  ValidationError, 
  fromSupabaseError,
  fromStatusCode,
  isOperationalError 
} from './errors';
import { logger } from './logger';

// 에러 응답 타입
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    details?: any;
  };
  requestId?: string;
}

// 요청 ID 생성
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 에러를 ErrorResponse로 변환
function formatErrorResponse(
  error: AppError,
  requestId?: string
): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
    },
  };

  if (error.code) {
    response.error.code = error.code;
  }

  // 개발 환경에서는 상세 정보 포함
  if (process.env.NODE_ENV === 'development' && error.details) {
    response.error.details = error.details;
  }

  if (requestId) {
    response.requestId = requestId;
  }

  return response;
}

// API 에러 핸들러
export async function handleApiError(
  error: unknown,
  request: NextRequest
): Promise<NextResponse<ErrorResponse>> {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // 로깅 컨텍스트
  const context = {
    requestId,
    url: request.url,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: request.headers.get('x-forwarded-for') || undefined,
  };

  let appError: AppError;

  // 에러 타입별 처리
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(err.message);
    });
    appError = new ValidationError('입력값이 올바르지 않습니다', errors);
  } else if (error && typeof error === 'object' && 'code' in error) {
    // Supabase 에러 처리
    appError = fromSupabaseError(error);
  } else if (error instanceof Error) {
    // 일반 에러
    appError = new AppError(
      error.message || '서버 오류가 발생했습니다',
      500,
      false
    );
  } else {
    // 알 수 없는 에러
    appError = new AppError('알 수 없는 오류가 발생했습니다', 500, false);
  }

  // 에러 로깅
  const duration = Date.now() - startTime;
  if (isOperationalError(appError)) {
    logger.warn(`Operational Error: ${appError.message}`, {
      ...context,
      statusCode: appError.statusCode,
      code: appError.code,
      duration,
    });
  } else {
    logger.error('System Error', error as Error, {
      ...context,
      statusCode: appError.statusCode,
      duration,
    });
  }

  // 응답 생성
  const response = formatErrorResponse(appError, requestId);
  
  // Rate Limit 에러의 경우 추가 헤더
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
  };

  if (appError.code === 'RATE_LIMIT_ERROR') {
    headers['Retry-After'] = (appError as any).retryAfter?.toString() || '60';
  }

  return NextResponse.json(response, {
    status: appError.statusCode,
    headers,
  });
}

// try-catch 래퍼
export function asyncHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (args[0] && typeof args[0] === 'object' && 'url' in args[0]) {
        return handleApiError(error, args[0] as NextRequest);
      }
      throw error;
    }
  };
}

// 클라이언트 에러 핸들러
export function handleClientError(error: unknown): {
  title: string;
  message: string;
  action?: string;
} {
  let title = '오류가 발생했습니다';
  let message = '잠시 후 다시 시도해주세요.';
  let action: string | undefined;

  if (error instanceof AppError) {
    switch (error.code) {
      case 'AUTHENTICATION_ERROR':
        title = '인증 필요';
        message = '이 기능을 사용하려면 로그인이 필요합니다.';
        action = '로그인하기';
        break;
      case 'AUTHORIZATION_ERROR':
        title = '권한 없음';
        message = '이 작업을 수행할 권한이 없습니다.';
        break;
      case 'VALIDATION_ERROR':
        title = '입력 오류';
        message = error.message;
        break;
      case 'NOT_FOUND_ERROR':
        title = '찾을 수 없음';
        message = error.message;
        action = '목록으로 돌아가기';
        break;
      case 'RATE_LIMIT_ERROR':
        title = '요청 제한';
        message = '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        message = error.message;
    }
  } else if (error instanceof Error) {
    // 네트워크 에러 처리
    if (error.message.includes('fetch')) {
      title = '네트워크 오류';
      message = '인터넷 연결을 확인해주세요.';
    } else {
      message = error.message;
    }
  }

  // 클라이언트 로깅
  logger.error(`Client Error: ${title}`, error as Error);

  return { title, message, action };
}

// 전역 에러 바운더리용 에러 처리
export function getErrorMessage(error: Error): string {
  if (error instanceof AppError) {
    return error.message;
  }
  
  // 개발 환경에서는 상세 에러 메시지
  if (process.env.NODE_ENV === 'development') {
    return error.message || '알 수 없는 오류가 발생했습니다';
  }
  
  // 프로덕션에서는 일반적인 메시지
  return '문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
}

// 에러 복구 제안
export function getErrorRecoveryAction(error: Error): {
  label: string;
  action: () => void;
} | null {
  if (error instanceof AppError) {
    switch (error.code) {
      case 'AUTHENTICATION_ERROR':
        return {
          label: '로그인하기',
          action: () => window.location.href = '/auth/signin',
        };
      case 'NOT_FOUND_ERROR':
        return {
          label: '홈으로 가기',
          action: () => window.location.href = '/',
        };
      default:
        return null;
    }
  }
  
  return null;
}

// API 에러 응답 파싱
export function parseApiError(response: any): AppError {
  if (response?.error) {
    const { message, code, statusCode, details } = response.error;
    return new AppError(
      message || '서버 오류가 발생했습니다',
      statusCode || 500,
      true,
      code,
      details
    );
  }
  
  return new AppError('알 수 없는 오류가 발생했습니다', 500);
}
