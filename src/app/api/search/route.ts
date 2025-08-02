import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/services/search';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ResourceFilters } from '@/types/resource';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query params
    const filters: ResourceFilters = {
      search: searchParams.get('q') || undefined,
      type: searchParams.get('type') as any || undefined,
      level: searchParams.get('level') as any || undefined,
      author_id: searchParams.get('author_id') || undefined,
      categoryIds: searchParams.get('categories')?.split(',').filter(Boolean),
      tagIds: searchParams.get('tags')?.split(',').filter(Boolean),
      sort: searchParams.get('sort') as any || 'latest',
    };

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Get current user if authenticated
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const result = await searchService.searchResources({
      filters,
      page,
      pageSize,
      userId: user?.id,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error searching resources:', error);
    return NextResponse.json(
      { error: 'Failed to search resources' },
      { status: 500 }
    );
  }
}