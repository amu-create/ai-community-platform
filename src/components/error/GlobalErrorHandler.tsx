'use client';

import { useEffect } from 'react';
import { useGlobalErrorHandler } from '@/lib/error/hooks';

export function GlobalErrorHandler() {
  // 전역 에러 핸들러 설정
  useGlobalErrorHandler();
  
  useEffect(() => {
    // 개발 환경에서 콘솔 에러 스타일링
    if (process.env.NODE_ENV === 'development') {
      const originalError = console.error;
      console.error = (...args) => {
        console.log('%c❌ ERROR', 'color: red; font-weight: bold;', ...args);
        originalError.apply(console, args);
      };
    }
  }, []);
  
  return null;
}
