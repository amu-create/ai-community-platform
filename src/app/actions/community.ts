'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { 
  Post, 
  Comment, 
  CreatePostInput, 
  UpdatePostInput,
  CreateCommentInput 
} from '@/types/community';

// Posts
export async function getPosts(params?: {
  category_id?: string;
  author_id?: string;
  status?: string;
  sort?: 'recent' | 'popular' | 'commented';
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug,
        color
      )
    `)
    .eq('status', 'published');
  
  if (params?.category_id) {
    query = query.eq('category_id', params.category_id);
  }
  
  if (params?.author_id) {
    query = query.eq('author_id', params.author_id);
  }
  
  // Sorting
  switch (params?.sort) {
    case 'popular':
      query = query.order('vote_count', { ascending: false });
      break;
    case 'commented':
      query = query.order('comment_count', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }
  
  // Pagination
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Get user votes if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const postIds = data.map(post => post.id);
    const { data: votes } = await supabase
      .from('post_votes')
      .select('post_id, vote')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    
    if (votes) {
      const voteMap = new Map(votes.map(v => [v.post_id, v.vote]));
      data.forEach(post => {
        post.user_vote = voteMap.get(post.id) || 0;
      });
    }
  }
  
  return data as Post[];
}

export async function getPost(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      ),
      category:categories(
        id,
        name,
        slug,
        color
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  // Get user vote if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const { data: vote } = await supabase
      .from('post_votes')
      .select('vote')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single();
    
    data.user_vote = vote?.vote || 0;
  }
  
  // Increment view count
  await supabase.rpc('increment', {
    table_name: 'posts',
    column_name: 'view_count',
    row_id: id
  }).catch(() => {}); // Ignore errors
  
  return data as Post;
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...input,
      author_id: user.id,
      published_at: input.status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/community');
  return data as Post;
}

export async function updatePost(id: string, input: UpdatePostInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const updates: any = { ...input };
  if (input.status === 'published' && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .eq('author_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/community');
  revalidatePath(`/community/posts/${id}`);
  return data as Post;
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);
  
  if (error) throw error;
  
  revalidatePath('/community');
}

export async function votePost(postId: string, vote: -1 | 0 | 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  if (vote === 0) {
    // Remove vote
    const { error } = await supabase
      .from('post_votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  } else {
    // Upsert vote
    const { error } = await supabase
      .from('post_votes')
      .upsert({
        post_id: postId,
        user_id: user.id,
        vote
      });
    
    if (error) throw error;
  }
  
  revalidatePath('/community');
  revalidatePath(`/community/posts/${postId}`);
}

// Comments
export async function getComments(postId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!comments_author_id_fkey(
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  // Get user votes if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const commentIds = data.map(comment => comment.id);
    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, vote')
      .eq('user_id', user.id)
      .in('comment_id', commentIds);
    
    if (votes) {
      const voteMap = new Map(votes.map(v => [v.comment_id, v.vote]));
      data.forEach(comment => {
        comment.user_vote = voteMap.get(comment.id) || 0;
      });
    }
  }
  
  // Organize comments into tree structure
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];
  
  data.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });
  
  data.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies!.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });
  
  return rootComments;
}

export async function createComment(input: CreateCommentInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('comments')
    .insert({
      ...input,
      author_id: user.id
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Create notification for post author
  const { data: post } = await supabase
    .from('posts')
    .select('author_id, title')
    .eq('id', input.post_id)
    .single();
  
  if (post && post.author_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        user_id: post.author_id,
        type: 'new_comment',
        title: 'New comment on your post',
        message: `Someone commented on "${post.title}"`,
        metadata: {
          post_id: input.post_id,
          comment_id: data.id
        }
      });
  }
  
  revalidatePath(`/community/posts/${input.post_id}`);
  return data as Comment;
}

export async function voteComment(commentId: string, vote: -1 | 0 | 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  if (vote === 0) {
    // Remove vote
    const { error } = await supabase
      .from('comment_votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);
    
    if (error) throw error;
  } else {
    // Upsert vote
    const { error } = await supabase
      .from('comment_votes')
      .upsert({
        comment_id: commentId,
        user_id: user.id,
        vote
      });
    
    if (error) throw error;
  }
}

// RPC function for incrementing counters
export async function createIncrementFunction() {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('create_increment_function', {
    function_sql: `
      CREATE OR REPLACE FUNCTION increment(table_name text, column_name text, row_id uuid)
      RETURNS void AS $$
      BEGIN
        EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE id = $1', table_name, column_name, column_name)
        USING row_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  
  if (error && !error.message.includes('already exists')) {
    console.error('Error creating increment function:', error);
  }
}
