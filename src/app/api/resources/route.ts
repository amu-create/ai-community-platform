import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  createResourceSchema, 
  paginationSchema,
  searchSchema 
} from '@/lib/validation/schemas';
import { 
  validateBody, 
  validateQuery, 
  checkRateLimit,
  sanitizeResponse 
} from '@/lib/validation/middleware';
import { asyncHandler } from '@/lib/error-handler';
import { 
  AuthenticationError, 
  DuplicateError, 
  DatabaseError 
} from '@/lib/errors';
import { logger, PerformanceLogger } from '@/lib/error/logger';

// GET: 리소스 목록 조회
export const GET = asyncHandler(async (request: NextRequest) => {
  // 성능 측정 시작
  PerformanceLogger.start('api.resources.get');
  
  const { searchParams } = new URL(request.url);
  
  // 쿼리 파라미터 검증
  const queryValidation = validateQuery(searchParams, searchSchema.merge(paginationSchema));
  if (!queryValidation.success) {
    return (queryValidation as any).response;
  }
  
  const { query, category, tags, sort = 'recent', page = 1, limit = 20 } = queryValidation.data;
  
  // Supabase 클라이언트 생성
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  // 쿼리 빌드
  let dbQuery = supabase
    .from('resources')
    .select(`
      *,
      user:profiles!user_id(id, username, avatar_url),
      ratings(rating),
      _count:ratings(count)
    `, { count: 'exact' });
  
  // 검색 필터
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  // 카테고리 필터
  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }
  
  // 태그 필터
  if (tags && tags.length > 0) {
    dbQuery = dbQuery.contains('tags', tags);
  }
  
  // 정렬
  switch (sort) {
    case 'popular':
      dbQuery = dbQuery.order('view_count', { ascending: false });
      break;
    case 'relevant':
      // 관련성 정렬은 복잡한 로직이 필요하므로 기본적으로 최신순
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
  }
  
  // 페이지네이션
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  dbQuery = dbQuery.range(from, to);
  
  const { data, error, count } = await dbQuery;
  
  if (error) {
    logger.error('Database error in resources.GET', error);
    throw new DatabaseError('리소스를 불러오는데 실패했습니다');
  }
  
  // 평균 평점 계산
  const resources = data?.map((resource) => {
    const ratings = resource.ratings || [];
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length
      : 0;
    
    return {
      ...resource,
      avg_rating: avgRating,
      rating_count: resource._count?.[0]?.count || 0,
      ratings: undefined,
      _count: undefined,
    };
  }) || [];
  
  // 응답 살균
  const sanitizedResources = resources.map((resource) =>
    sanitizeResponse(resource, {
      htmlFields: ['description'],
      excludeFields: ['user_id'],
    })
  );
  
  // 성능 측정 종료
  const duration = PerformanceLogger.end('api.resources.get');
  
  logger.info('Resources fetched successfully', {
    count: resources.length,
    totalCount: count,
    page,
    duration,
  });
  
  return NextResponse.json({
    success: true,
    data: {
      resources: sanitizedResources,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    },
  });
});

// POST: 새 리소스 생성
export const POST = asyncHandler(async (request: NextRequest) => {
  PerformanceLogger.start('api.resources.post');
  
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = checkRateLimit(`resources:create:${clientIp}`, {
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 10, // 시간당 10개
  });
  
  if (!rateLimitResult.success) {
    return (rateLimitResult as any).response;
  }
  
  // 요청 본문 검증
  const bodyValidation = await validateBody(request, createResourceSchema);
  if (!bodyValidation.success) {
    return (bodyValidation as any).response;
  }
  
  const { title, description, url, category, tags = [] } = bodyValidation.data;
  
  // 인증 확인
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new AuthenticationError('Unauthorized');
  }
  
  // 중복 URL 확인
  const { data: existingResource } = await supabase
    .from('resources')
    .select('id')
    .eq('url', url)
    .single();
  
  if (existingResource) {
    throw new DuplicateError('리소스 URL이 이미 존재합니다');
  }
  
  // 리소스 생성
  const { data: newResource, error: createError } = await supabase
    .from('resources')
    .insert({
      title,
      description,
      url,
      category,
      tags,
      user_id: user.id,
      view_count: 0,
    })
    .select(`
      *,
      user:profiles!user_id(id, username, avatar_url)
    `)
    .single();
  
  if (createError) {
    logger.error('Failed to create resource', createError);
    throw new DatabaseError('리소스 생성에 실패했습니다');
  }
  
  // 응답 살균
  const sanitizedResource = sanitizeResponse(newResource, {
    htmlFields: ['description'],
    excludeFields: ['user_id'],
  });
  
  const duration = PerformanceLogger.end('api.resources.post');
  
  logger.info('Resource created successfully', {
    resourceId: newResource.id,
    userId: user.id,
    duration,
  });
  
  return NextResponse.json(
    {
      success: true,
      data: sanitizedResource,
    },
    { status: 201 }
  );
});
