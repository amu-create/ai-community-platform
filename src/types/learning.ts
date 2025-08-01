// Learning path types
export interface LearningPath {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  author_id: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  estimated_hours: number | null;
  category_id: string | null;
  prerequisites: string[];
  outcomes: string[];
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  enrollment_count: number;
  completion_count: number;
  rating: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  
  // Relations
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  steps?: LearningPathStep[];
  user_enrollment?: UserEnrollment;
}

export interface LearningPathStep {
  id: string;
  learning_path_id: string;
  resource_id: string;
  position: number;
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  resource?: {
    id: string;
    title: string;
    type: string;
    url: string;
  };
  user_progress?: UserProgress;
}

export interface UserEnrollment {
  id: string;
  user_id: string;
  learning_path_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'dropped';
}

export interface UserProgress {
  id: string;
  user_id: string;
  enrollment_id: string;
  step_id: string;
  started_at: string;
  completed_at: string | null;
  time_spent_minutes: number;
  notes: string | null;
}

// API types
export interface CreateLearningPathInput {
  title: string;
  description?: string;
  slug: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours?: number;
  category_id?: string;
  prerequisites?: string[];
  outcomes?: string[];
  status?: 'draft' | 'published';
}

export interface CreateLearningPathStepInput {
  resource_id: string;
  position: number;
  title: string;
  description?: string;
  estimated_minutes?: number;
  is_required?: boolean;
}

export interface UpdateProgressInput {
  completed: boolean;
  time_spent_minutes?: number;
  notes?: string;
}
