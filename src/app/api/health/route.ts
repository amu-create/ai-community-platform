import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const startTime = Date.now();
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {
        database: false,
        auth: false,
        storage: false,
      },
      responseTime: 0,
    };

    // 데이터베이스 연결 확인
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();
      
      checks.checks.database = !error;
    } catch (error) {
      checks.checks.database = false;
      console.error('Database health check failed:', error);
    }

    // Auth 서비스 확인
    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      checks.checks.auth = true; // 세션 조회가 가능하면 auth 서비스는 정상
    } catch (error) {
      checks.checks.auth = false;
      console.error('Auth health check failed:', error);
    }

    // Storage 서비스 확인
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.storage.listBuckets();
      checks.checks.storage = !error && Array.isArray(data);
    } catch (error) {
      checks.checks.storage = false;
      console.error('Storage health check failed:', error);
    }

    // 전체 상태 결정
    const allHealthy = Object.values(checks.checks).every(check => check === true);
    checks.status = allHealthy ? 'healthy' : 'degraded';
    
    // 응답 시간 계산
    checks.responseTime = Date.now() - startTime;

    // 상태 코드 설정
    const statusCode = allHealthy ? 200 : 503;

    return NextResponse.json(checks, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

// OPTIONS 메서드 지원 (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
