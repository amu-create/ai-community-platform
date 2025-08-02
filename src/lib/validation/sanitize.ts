import DOMPurify from 'dompurify';

// 기본 HTML 살균 설정
const defaultConfig: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre', 'a', 'em', 'strong', 'del', 'b', 'i', 'u',
    'ul', 'ol', 'li', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'sup', 'sub', 'details', 'summary'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'alt', 'src', 'width', 'height',
    'class', 'id', 'style', 'data-*', 'aria-*', 'role'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: true,
  ADD_ATTR: ['target'], // target="_blank" 허용
  ADD_TAGS: ['iframe'], // YouTube 등 임베드를 위해
  FORBID_TAGS: ['script', 'style'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
};

// 엄격한 설정 (댓글 등)
const strictConfig: DOMPurify.Config = {
  ALLOWED_TAGS: ['p', 'br', 'a', 'em', 'strong', 'code', 'pre', 'blockquote'],
  ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input'],
};

// 마크다운 렌더링용 설정
const markdownConfig: DOMPurify.Config = {
  ...defaultConfig,
  ADD_TAGS: ['iframe', 'video', 'audio', 'source'],
  ADD_ATTR: ['allowfullscreen', 'frameborder', 'autoplay', 'controls'],
};

export const sanitize = {
  // 기본 HTML 살균
  html: (dirty: string): string => {
    if (typeof window === 'undefined') return dirty; // SSR 대응
    return (DOMPurify.sanitize(dirty, defaultConfig as any) as unknown) as string;
  },

  // 엄격한 HTML 살균
  strict: (dirty: string): string => {
    if (typeof window === 'undefined') return dirty;
    return (DOMPurify.sanitize(dirty, strictConfig as any) as unknown) as string;
  },

  // 마크다운 렌더링용 살균
  markdown: (dirty: string): string => {
    if (typeof window === 'undefined') return dirty;
    return (DOMPurify.sanitize(dirty, markdownConfig as any) as unknown) as string;
  },

  // 텍스트만 추출 (HTML 태그 모두 제거)
  text: (dirty: string): string => {
    if (typeof window === 'undefined') return dirty;
    return (DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) as unknown) as string;
  },

  // URL 살균
  url: (dirty: string): string => {
    try {
      const url = new URL(dirty);
      // 허용된 프로토콜만
      if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
        return '#';
      }
      return url.toString();
    } catch {
      return '#';
    }
  },

  // 파일명 살균
  filename: (dirty: string): string => {
    return dirty
      .replace(/[^a-zA-Z0-9._-]/g, '_') // 특수문자를 _로 변경
      .replace(/_{2,}/g, '_') // 연속된 _를 하나로
      .slice(0, 255); // 최대 길이 제한
  },

  // SQL Injection 방지를 위한 이스케이프
  sql: (dirty: string): string => {
    return dirty
      .replace(/'/g, "''") // 작은따옴표 이스케이프
      .replace(/\\/g, '\\\\') // 백슬래시 이스케이프
      .replace(/\0/g, '\\0') // NULL 문자 이스케이프
      .replace(/\n/g, '\\n') // 개행 이스케이프
      .replace(/\r/g, '\\r'); // 캐리지 리턴 이스케이프
  },

  // XSS 방지를 위한 속성값 이스케이프
  attr: (dirty: string): string => {
    return dirty
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  // JSON 안전 파싱
  json: <T = any>(dirty: string): T | null => {
    try {
      return JSON.parse(dirty);
    } catch {
      return null;
    }
  },

  // 이메일 주소 마스킹
  email: (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!domain) return '***@***.***';
    
    const maskedLocal = localPart.length > 2
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
      : '***';
    
    return `${maskedLocal}@${domain}`;
  },

  // 전화번호 마스킹
  phone: (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return '*'.repeat(digits.length);
    
    return digits.replace(/(\d{3})(\d{4})(\d+)/, '$1-****-$3');
  },
};

// 입력 검증 헬퍼
export const validate = {
  // 이메일 검증
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // URL 검증
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // 전화번호 검증
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s-+()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  // 신용카드 번호 검증 (Luhn 알고리즘)
  creditCard: (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  // 비밀번호 강도 검증
  passwordStrength: (password: string): {
    score: number;
    feedback: string[];
  } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (password.length < 8) feedback.push('비밀번호는 8자 이상이어야 합니다');
    if (!/[a-z]/.test(password)) feedback.push('소문자를 포함해야 합니다');
    if (!/[A-Z]/.test(password)) feedback.push('대문자를 포함해야 합니다');
    if (!/[0-9]/.test(password)) feedback.push('숫자를 포함해야 합니다');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('특수문자를 포함하면 더 안전합니다');

    return { score, feedback };
  },
};
