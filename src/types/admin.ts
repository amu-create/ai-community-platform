// Admin Dashboard Types

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalResources: number;
  totalPosts: number;
  totalComments: number;
  totalLearningPaths: number;
  enrolledUsers: number;
  completedPaths: number;
}

export interface UserActivity {
  date: string;
  newUsers: number;
  activeUsers: number;
  posts: number;
  comments: number;
  resources: number;
}

export interface ContentModeration {
  id: string;
  type: 'post' | 'comment' | 'resource';
  content: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  reportedAt: string;
  reportedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TopContent {
  id: string;
  title: string;
  type: 'resource' | 'post' | 'learning_path';
  author: string;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface UserGrowth {
  month: string;
  users: number;
  growth: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  lastSignIn: string;
  status: 'active' | 'suspended' | 'deleted';
  stats: {
    posts: number;
    comments: number;
    resources: number;
    learningPaths: number;
  };
}
