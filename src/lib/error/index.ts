// 에러 클래스
export * from './errors';

// 로거
export * from './logger';

// 핸들러
export * from './handlers';

// React 훅
export * from './hooks';

// 타입 정의
export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  stack?: string;
}

// 에러 보고 설정
export const errorReporting = {
  // Sentry DSN (환경 변수에서 가져옴)
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 에러 보고 활성화 여부
  enabled: process.env.NODE_ENV === 'production',
  
  // 무시할 에러 패턴
  ignorePatterns: [
    /ResizeObserver loop limit exceeded/,
    /Non-Error promise rejection captured/,
    /Network request failed/,
  ],
  
  // 사용자 컨텍스트 포함 여부
  includeUserContext: true,
  
  // 환경 정보
  environment: process.env.NODE_ENV,
};

// 에러 메시지 템플릿
export const errorMessages = {
  // 네트워크 에러
  network: {
    offline: '인터넷 연결을 확인해주세요',
    timeout: '요청 시간이 초과되었습니다',
    serverError: '서버에 연결할 수 없습니다',
  },
  
  // 인증 에러
  auth: {
    required: '로그인이 필요합니다',
    expired: '세션이 만료되었습니다. 다시 로그인해주세요',
    forbidden: '접근 권한이 없습니다',
  },
  
  // 검증 에러
  validation: {
    required: '필수 입력 항목입니다',
    invalid: '올바른 값을 입력해주세요',
    tooShort: '최소 {min}자 이상 입력해주세요',
    tooLong: '최대 {max}자까지 입력 가능합니다',
  },
  
  // 일반 에러
  general: {
    unknown: '알 수 없는 오류가 발생했습니다',
    tryAgain: '잠시 후 다시 시도해주세요',
    contactSupport: '문제가 지속되면 고객센터에 문의해주세요',
  },
};

// 에러 복구 전략
export const recoveryStrategies = {
  // 네트워크 에러 복구
  network: {
    retry: true,
    retryCount: 3,
    retryDelay: 1000,
    backoff: true,
  },
  
  // 인증 에러 복구
  auth: {
    redirectToLogin: true,
    refreshToken: true,
    clearCache: true,
  },
  
  // 일반 에러 복구
  general: {
    reload: false,
    clearStorage: false,
    reportToSentry: true,
  },
};

// 디버깅 유틸리티
export const debug = {
  // 에러 스택 추적 포맷
  formatStackTrace: (stack?: string): string[] => {
    if (!stack) return [];
    
    return stack
      .split('\n')
      .filter(line => !line.includes('node_modules'))
      .map(line => line.trim())
      .slice(0, 10); // 최대 10줄
  },
  
  // 에러 컨텍스트 수집
  collectContext: (): Record<string, any> => {
    if (typeof window === 'undefined') return {};
    
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: {
        width: screen.width,
        height: screen.height,
      },
    };
  },
  
  // 에러 로그 다운로드
  downloadErrorLog: (errors: ErrorInfo[]) => {
    const content = JSON.stringify(errors, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
