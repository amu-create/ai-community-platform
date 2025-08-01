// 검증 스키마 및 타입
export * from './schemas';

// 살균 및 검증 유틸리티
export { sanitize, validate } from './sanitize';

// API 미들웨어
export {
  validateBody,
  validateQuery,
  validateParams,
  validateFile,
  validateCSRFToken,
  checkRateLimit,
  prepareSQLParams,
  sanitizeResponse,
  validationErrorResponse,
} from './middleware';

// React 훅
export {
  useValidatedForm,
  useDebouncedInput,
  useRealtimeValidation,
  usePasswordStrength,
  useFileValidation,
} from './hooks';

// 공통 패턴 및 정규식
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  phone: /^[\d\s-+()]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;

// 보안 관련 상수
export const security = {
  // 비밀번호 정책
  password: {
    minLength: 8,
    maxLength: 100,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
  },
  
  // 세션 설정
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간
    cookieName: 'ai-community-session',
  },
  
  // CSRF 설정
  csrf: {
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
    paramName: '_csrf',
  },
  
  // Rate Limiting 기본값
  rateLimit: {
    defaultWindow: 60 * 1000, // 1분
    defaultMaxRequests: 100,
    errorMessage: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
} as const;

// 에러 메시지
export const errorMessages = {
  // 인증 관련
  auth: {
    unauthorized: '인증이 필요합니다',
    forbidden: '접근 권한이 없습니다',
    invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다',
    accountLocked: '계정이 잠겼습니다. 고객센터에 문의해주세요',
    emailNotVerified: '이메일 인증이 필요합니다',
  },
  
  // 검증 관련
  validation: {
    required: '필수 입력 항목입니다',
    invalidFormat: '올바른 형식이 아닙니다',
    tooShort: '너무 짧습니다',
    tooLong: '너무 깁니다',
    duplicate: '이미 사용 중입니다',
  },
  
  // 파일 관련
  file: {
    tooLarge: '파일 크기가 너무 큽니다',
    invalidType: '지원하지 않는 파일 형식입니다',
    uploadFailed: '파일 업로드에 실패했습니다',
  },
  
  // 일반 오류
  general: {
    serverError: '서버 오류가 발생했습니다',
    networkError: '네트워크 연결을 확인해주세요',
    unknownError: '알 수 없는 오류가 발생했습니다',
    tryAgain: '잠시 후 다시 시도해주세요',
  },
} as const;

// 헬퍼 함수
export const helpers = {
  // 안전한 JSON 파싱
  safeJsonParse: <T = any>(json: string, fallback: T | null = null): T | null => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },
  
  // 안전한 정수 파싱
  safeParseInt: (value: string | number, fallback: number = 0): number => {
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? fallback : parsed;
  },
  
  // 안전한 부동소수점 파싱
  safeParseFloat: (value: string | number, fallback: number = 0): number => {
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? fallback : parsed;
  },
  
  // 문자열 절단 (XSS 방지)
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },
  
  // 이메일 마스킹
  maskEmail: (email: string): string => {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***.***';
    
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(Math.min(local.length - 2, 5)) + local[local.length - 1]
      : '***';
    
    return `${maskedLocal}@${domain}`;
  },
  
  // 전화번호 마스킹
  maskPhone: (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return '*'.repeat(digits.length);
    
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-****-$3');
  },
} as const;
