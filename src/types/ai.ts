// AI 관련 타입 정의

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'resource' | 'learning_path' | 'post';
  itemId: string;
  score: number;
  reason: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AIAnalysis {
  userId: string;
  interests: string[];
  skillLevel: string;
  learningStyle: string;
  preferredContentTypes: string[];
  activityPatterns: {
    mostActiveTime: string;
    averageSessionDuration: number;
    contentCompletionRate: number;
  };
}

export interface AIChat {
  id: string;
  userId: string;
  messages: AIMessage[];
  context?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    functionCalls?: any[];
  };
}

export interface ContentEmbedding {
  id: string;
  contentType: 'resource' | 'learning_path' | 'post';
  contentId: string;
  embedding: number[];
  metadata: {
    title: string;
    description: string;
    tags: string[];
  };
  createdAt: string;
}

export interface AIPrompt {
  type: 'recommendation' | 'analysis' | 'chat' | 'summary';
  context: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
