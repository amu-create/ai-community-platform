import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { resourceIds } = await request.json()

    if (!resourceIds || !Array.isArray(resourceIds)) {
      return NextResponse.json(
        { error: 'Resource IDs array is required' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: bookmarks, error } = await supabase
      .from('resource_bookmarks')
      .select('resource_id')
      .eq('user_id', user.id)
      .in('resource_id', resourceIds)

    if (error) throw error

    // Create a set of bookmarked resource IDs for O(1) lookup
    const bookmarkedIds = new Set(bookmarks.map(b => b.resource_id))
    
    // Return an object mapping resource IDs to bookmark status
    const bookmarkStatus = resourceIds.reduce((acc, id) => {
      acc[id] = bookmarkedIds.has(id)
      return acc
    }, {} as Record<string, boolean>)

    return NextResponse.json(bookmarkStatus)
  } catch (error) {
    console.error('Error checking bookmark status:', error)
    return NextResponse.json(
      { error: 'Failed to check bookmark status' },
      { status: 500 }
    )
  }
}
