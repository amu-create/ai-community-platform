// 기본 애플리케이션 에러 클래스
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// 인증 에러
export class AuthenticationError extends AppError {
  constructor(message: string = '인증이 필요합니다', details?: any) {
    super(message, 401, true, 'AUTHENTICATION_ERROR', details);
  }
}

// 권한 에러
export class AuthorizationError extends AppError {
  constructor(message: string = '접근 권한이 없습니다', details?: any) {
    super(message, 403, true, 'AUTHORIZATION_ERROR', details);
  }
}

// 검증 에러
export class ValidationError extends AppError {
  constructor(
    message: string = '입력값이 올바르지 않습니다',
    details?: Record<string, string[]>
  ) {
    super(message, 400, true, 'VALIDATION_ERROR', details);
  }
}

// 리소스 찾기 실패 에러
export class NotFoundError extends AppError {
  constructor(
    resource: string = '리소스',
    message?: string,
    details?: any
  ) {
    const defaultMessage = `${resource}를 찾을 수 없습니다`;
    super(message || defaultMessage, 404, true, 'NOT_FOUND_ERROR', details);
  }
}

// 중복 에러
export class DuplicateError extends AppError {
  constructor(
    resource: string = '리소스',
    field?: string,
    message?: string,
    details?: any
  ) {
    const defaultMessage = field
      ? `이미 사용 중인 ${field}입니다`
      : `이미 존재하는 ${resource}입니다`;
    super(message || defaultMessage, 409, true, 'DUPLICATE_ERROR', details);
  }
}

// Rate Limit 에러
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(
    retryAfter: number,
    message: string = '요청이 너무 많습니다',
    details?: any
  ) {
    super(message, 429, true, 'RATE_LIMIT_ERROR', details);
    this.retryAfter = retryAfter;
  }
}

// 외부 서비스 에러
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(
    service: string,
    message: string = '외부 서비스 오류가 발생했습니다',
    statusCode: number = 503,
    details?: any
  ) {
    super(message, statusCode, false, 'EXTERNAL_SERVICE_ERROR', details);
    this.service = service;
  }
}

// 데이터베이스 에러
export class DatabaseError extends AppError {
  constructor(
    message: string = '데이터베이스 오류가 발생했습니다',
    details?: any
  ) {
    super(message, 500, false, 'DATABASE_ERROR', details);
  }
}

// 파일 업로드 에러
export class FileUploadError extends AppError {
  constructor(
    message: string = '파일 업로드에 실패했습니다',
    details?: any
  ) {
    super(message, 400, true, 'FILE_UPLOAD_ERROR', details);
  }
}

// 비즈니스 로직 에러
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    statusCode: number = 400,
    code?: string,
    details?: any
  ) {
    super(message, statusCode, true, code || 'BUSINESS_LOGIC_ERROR', details);
  }
}

// 에러 타입 가드
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isOperationalError = (error: any): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Supabase 에러를 AppError로 변환
export function fromSupabaseError(error: any): AppError {
  const message = error.message || '데이터베이스 오류가 발생했습니다';
  const code = error.code;

  // Supabase 에러 코드에 따른 처리
  switch (code) {
    case '23505': // unique_violation
      return new DuplicateError('데이터', undefined, message);
    case '23503': // foreign_key_violation
      return new ValidationError('참조하는 데이터가 존재하지 않습니다');
    case '23502': // not_null_violation
      return new ValidationError('필수 입력 항목이 누락되었습니다');
    case '22P02': // invalid_text_representation
      return new ValidationError('잘못된 데이터 형식입니다');
    case '42P01': // undefined_table
      return new DatabaseError('테이블을 찾을 수 없습니다');
    case '42703': // undefined_column
      return new DatabaseError('컬럼을 찾을 수 없습니다');
    case 'PGRST301': // JWT 에러
      return new AuthenticationError('인증 토큰이 유효하지 않습니다');
    default:
      return new DatabaseError(message, { code });
  }
}

// HTTP 상태 코드에 따른 에러 생성
export function fromStatusCode(
  statusCode: number,
  message?: string,
  details?: any
): AppError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message, details);
    case 403:
      return new AuthorizationError(message, details);
    case 404:
      return new NotFoundError(undefined, message, details);
    case 409:
      return new DuplicateError(undefined, undefined, message, details);
    case 429:
      return new RateLimitError(60, message, details);
    default:
      return new AppError(
        message || '서버 오류가 발생했습니다',
        statusCode,
        statusCode < 500,
        undefined,
        details
      );
  }
}
