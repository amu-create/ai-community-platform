import { NextRequest, NextResponse } from 'next/server';
import { searchService } from '@/services/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const suggestions = await searchService.getSuggestions(query);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}