'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  LearningPath,
  LearningPathStep,
  UserEnrollment,
  UserProgress,
  CreateLearningPathInput,
  CreateLearningPathStepInput,
  UpdateProgressInput
} from '@/types/learning';

// Learning Paths
export async function getLearningPaths(params?: {
  category_id?: string;
  difficulty_level?: string;
  is_featured?: boolean;
  author_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('learning_paths')
    .select(`
      *,
      author:profiles!learning_paths_author_id_fkey(
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
  
  if (params?.difficulty_level) {
    query = query.eq('difficulty_level', params.difficulty_level);
  }
  
  if (params?.is_featured !== undefined) {
    query = query.eq('is_featured', params.is_featured);
  }
  
  if (params?.author_id) {
    query = query.eq('author_id', params.author_id);
  }
  
  // Sorting - featured first, then by enrollment count
  query = query.order('is_featured', { ascending: false })
    .order('enrollment_count', { ascending: false });
  
  // Pagination
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;
  query = query.range(offset, offset + limit - 1);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Get user enrollments if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const pathIds = data.map(path => path.id);
    const { data: enrollments } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .in('learning_path_id', pathIds);
    
    if (enrollments) {
      const enrollmentMap = new Map(enrollments.map(e => [e.learning_path_id, e]));
      data.forEach(path => {
        path.user_enrollment = enrollmentMap.get(path.id);
      });
    }
  }
  
  return data as LearningPath[];
}

export async function getLearningPath(idOrSlug: string) {
  const supabase = await createClient();
  
  // Try to get by ID first, then by slug
  let { data, error } = await supabase
    .from('learning_paths')
    .select(`
      *,
      author:profiles!learning_paths_author_id_fkey(
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
      ),
      steps:learning_path_steps(
        *,
        resource:resources(
          id,
          title,
          type,
          url,
          description,
          level
        )
      )
    `)
    .eq('id', idOrSlug)
    .single();
  
  if (error) {
    // Try by slug
    const { data: slugData, error: slugError } = await supabase
      .from('learning_paths')
      .select(`
        *,
        author:profiles!learning_paths_author_id_fkey(
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
        ),
        steps:learning_path_steps(
          *,
          resource:resources(
            id,
            title,
            type,
            url,
            description,
            level
          )
        )
      `)
      .eq('slug', idOrSlug)
      .single();
    
    if (slugError) throw slugError;
    data = slugData;
  }
  
  // Sort steps by position
  if (data?.steps) {
    data.steps.sort((a, b) => a.position - b.position);
  }
  
  // Get user enrollment and progress if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const { data: enrollment } = await supabase
      .from('user_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('learning_path_id', data.id)
      .single();
    
    if (enrollment) {
      data.user_enrollment = enrollment;
      
      // Get progress for each step
      const stepIds = data.steps.map(step => step.id);
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id)
        .in('step_id', stepIds);
      
      if (progress) {
        const progressMap = new Map(progress.map(p => [p.step_id, p]));
        data.steps.forEach(step => {
          step.user_progress = progressMap.get(step.id);
        });
      }
    }
  }
  
  return data as LearningPath;
}

export async function createLearningPath(input: CreateLearningPathInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('learning_paths')
    .insert({
      ...input,
      author_id: user.id,
      published_at: input.status === 'published' ? new Date().toISOString() : null
    })
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
  return data as LearningPath;
}

export async function updateLearningPath(id: string, input: Partial<CreateLearningPathInput>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const updates: any = { ...input };
  if (input.status === 'published' && !updates.published_at) {
    updates.published_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('learning_paths')
    .update(updates)
    .eq('id', id)
    .eq('author_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
  revalidatePath(`/learning-paths/${id}`);
  return data as LearningPath;
}

// Learning Path Steps
export async function addLearningPathStep(
  learningPathId: string, 
  input: CreateLearningPathStepInput
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  // Verify ownership
  const { data: path } = await supabase
    .from('learning_paths')
    .select('author_id')
    .eq('id', learningPathId)
    .single();
  
  if (!path || path.author_id !== user.id) {
    throw new Error('Not authorized');
  }
  
  const { data, error } = await supabase
    .from('learning_path_steps')
    .insert({
      learning_path_id: learningPathId,
      ...input
    })
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath(`/learning-paths/${learningPathId}`);
  return data as LearningPathStep;
}

export async function updateLearningPathStep(
  stepId: string,
  input: Partial<CreateLearningPathStepInput>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('learning_path_steps')
    .update(input)
    .eq('id', stepId)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
  return data as LearningPathStep;
}

export async function deleteLearningPathStep(stepId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('learning_path_steps')
    .delete()
    .eq('id', stepId);
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
}

// User Enrollments
export async function enrollInLearningPath(learningPathId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('user_enrollments')
    .insert({
      user_id: user.id,
      learning_path_id: learningPathId
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Update enrollment count
  await supabase.rpc('increment', {
    table_name: 'learning_paths',
    column_name: 'enrollment_count',
    row_id: learningPathId
  });
  
  revalidatePath(`/learning-paths/${learningPathId}`);
  return data as UserEnrollment;
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: 'active' | 'completed' | 'paused' | 'dropped'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const updates: any = { status };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('user_enrollments')
    .update(updates)
    .eq('id', enrollmentId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
  return data as UserEnrollment;
}

// User Progress
export async function updateStepProgress(
  stepId: string,
  enrollmentId: string,
  input: UpdateProgressInput
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const updates: any = {
    user_id: user.id,
    enrollment_id: enrollmentId,
    step_id: stepId,
    ...input
  };
  
  if (input.completed) {
    updates.completed_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(updates)
    .select()
    .single();
  
  if (error) throw error;
  
  revalidatePath('/learning-paths');
  return data as UserProgress;
}

export async function getUserEnrollments(userId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const targetUserId = userId || user?.id;
  if (!targetUserId) throw new Error('User ID required');
  
  const { data, error } = await supabase
    .from('user_enrollments')
    .select(`
      *,
      learning_path:learning_paths(
        id,
        title,
        slug,
        description,
        difficulty_level,
        estimated_hours,
        author:profiles!learning_paths_author_id_fkey(
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
      )
    `)
    .eq('user_id', targetUserId)
    .order('enrolled_at', { ascending: false });
  
  if (error) throw error;
  
  return data;
}
