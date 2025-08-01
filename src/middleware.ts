import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보안 헤더 설정
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
    "frame-src 'self' https://youtube.com https://www.youtube.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

// 보호된 라우트 패턴
const protectedRoutes = [
  '/dashboard',
  '/profile/edit',
  '/resources/create',
  '/posts/create',
  '/api/resources',
  '/api/posts',
  '/api/comments',
  '/api/ratings',
];

// 관리자 전용 라우트
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Rate limiting 맵
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// IP 추출 함수
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // 보안 헤더 적용
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // CSRF 토큰 생성 및 검증
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // API 라우트에 대한 CSRF 검증
    if (pathname.startsWith('/api/')) {
      const csrfToken = request.cookies.get('csrf-token')?.value;
      const headerToken = request.headers.get('X-CSRF-Token');
      
      // 인증이 필요한 API만 CSRF 검증
      const requiresCsrf = !['/api/auth/signin', '/api/auth/signup'].includes(pathname);
      
      if (requiresCsrf && (!csrfToken || csrfToken !== headerToken)) {
        return NextResponse.json(
          { success: false, error: 'CSRF 토큰이 유효하지 않습니다' },
          { status: 403 }
        );
      }
    }
  }
  
  // Rate Limiting (API 라우트)
  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIp(request);
    const rateLimitKey = `${clientIp}:${pathname}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1분
    const maxRequests = 100; // 분당 100회
    
    const record = rateLimitMap.get(rateLimitKey);
    
    if (!record || record.resetTime < now) {
      rateLimitMap.set(rateLimitKey, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, error: '요청이 너무 많습니다' },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
          },
        }
      );
    } else {
      record.count++;
    }
  }
  
  // 보호된 라우트 접근 제어
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtectedRoute || isAdminRoute) {
    // 쿠키에서 Supabase 토큰 확인
    const hasAuthCookie = request.cookies.has('sb-rxwchcvgzhuokpqsjatf-auth-token');
    
    if (!hasAuthCookie) {
      // API 라우트는 401 반환
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, error: '인증이 필요합니다' },
          { status: 401 }
        );
      }
      
      // 웹 페이지는 로그인 페이지로 리디렉션
      const url = request.nextUrl.clone();
      url.pathname = '/auth/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    
    // 관리자 권한 확인 (실제로는 Supabase에서 역할 확인 필요)
    if (isAdminRoute) {
      // TODO: Supabase에서 사용자 역할 확인
      // 임시로 관리자 검증 로직 추가 필요
    }
  }
  
  // 요청 크기 제한 (10MB)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, error: '요청 크기가 너무 큽니다' },
      { status: 413 }
    );
  }
  
  // SQL Injection 방지를 위한 쿼리 파라미터 검증
  const searchParams = request.nextUrl.searchParams;
  const suspiciousPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
    /(--|\/\*|\*\/|xp_|sp_)/i,
    /(\bor\b\s*\d+\s*=\s*\d+|\band\b\s*\d+\s*=\s*\d+)/i,
  ];
  
  for (const [key, value] of searchParams.entries()) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(value)) {
        return NextResponse.json(
          { success: false, error: '잘못된 요청입니다' },
          { status: 400 }
        );
      }
    }
  }
  
  // XSS 방지를 위한 Referer 검증
  const referer = request.headers.get('referer');
  if (referer && pathname.startsWith('/api/')) {
    try {
      const refererUrl = new URL(referer);
      const currentUrl = new URL(request.url);
      
      // 같은 도메인에서의 요청만 허용
      if (refererUrl.origin !== currentUrl.origin) {
        // CORS 요청이 아닌 경우 차단
        const origin = request.headers.get('origin');
        if (!origin || origin !== currentUrl.origin) {
          return NextResponse.json(
            { success: false, error: '잘못된 요청 출처입니다' },
            { status: 403 }
          );
        }
      }
    } catch (error) {
      // 잘못된 Referer 헤더
    }
  }
  
  // CSRF 토큰 쿠키 설정 (없는 경우)
  if (!request.cookies.has('csrf-token')) {
    const csrfToken = crypto.randomUUID();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  
  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// Rate limit 맵 주기적 정리 (메모리 누수 방지)
if (typeof global !== 'undefined' && !global.rateLimitCleanupInterval) {
  global.rateLimitCleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }, 60 * 1000); // 1분마다 정리
}
