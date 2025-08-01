// AI Services
export { contentAnalysisService } from './content-analysis';
export { userProfileAnalysisService } from './user-profile-analysis';
export { recommendationEngine } from './recommendation-engine';

// Types
export type { 
  ContentAnalysis, 
  ContentMetadata 
} from './content-analysis';

export type { 
  UserInterests, 
  UserActivity 
} from './user-profile-analysis';

export type { 
  Recommendation, 
  RecommendationContext 
} from './recommendation-engine';

// Config
export { 
  openai, 
  AI_MODELS, 
  PROMPTS, 
  AI_CONFIG 
} from './config';