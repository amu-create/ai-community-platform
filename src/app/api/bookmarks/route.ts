import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total count
    const { count } = await supabase
      .from('resource_bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get bookmarked resources with details
    const { data: bookmarks, error } = await supabase
      .from('resource_bookmarks')
      .select(`
        id,
        created_at,
        resource:resources!inner(
          id,
          title,
          description,
          url,
          type,
          level,
          author_id,
          view_count,
          vote_count,
          bookmark_count,
          status,
          created_at,
          updated_at,
          profiles!resources_author_id_fkey(
            username,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Transform the data
    const resources = bookmarks.map(bookmark => ({
      ...bookmark.resource,
      isBookmarked: true,
      bookmarkedAt: bookmark.created_at,
      author: bookmark.resource.profiles
    }))

    return NextResponse.json({
      resources,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { resourceId } = await request.json()

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if bookmark already exists
    const { data: existing } = await supabase
      .from('resource_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_id', resourceId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Resource already bookmarked' },
        { status: 400 }
      )
    }

    // Create bookmark
    const { data, error } = await supabase
      .from('resource_bookmarks')
      .insert([
        {
          user_id: user.id,
          resource_id: resourceId
        }
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('resource_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('resource_id', resourceId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
}
