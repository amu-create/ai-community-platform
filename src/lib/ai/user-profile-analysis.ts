import { BaseAIService } from './base-service';
import { PROMPTS } from './config';
import { logger } from '@/lib/error/logger';
import { supabase } from '@/lib/supabase/client';

export interface UserInterests {
  primary: string[];
  secondary: string[];
  skills: Record<string, 'beginner' | 'intermediate' | 'advanced'>;
  contentPreferences: {
    types: ('post' | 'resource' | 'event' | 'project')[];
    formats: string[];
    lengthPreference: 'short' | 'medium' | 'long';
  };
  learningGoals: string[];
}

export interface UserActivity {
  type: 'view' | 'like' | 'comment' | 'share' | 'bookmark' | 'create';
  contentId: string;
  contentType: 'post' | 'resource' | 'event' | 'project';
  timestamp: Date;
  duration?: number; // 체류 시간 (초)
  metadata?: Record<string, any>;
}

export class UserProfileAnalysisService extends BaseAIService {
  constructor() {
    super('UserProfileAnalysisService');
  }

  /**
   * 사용자 활동 기반 관심사 분석
   */
  async analyzeUserInterests(
    userId: string,
    activities: UserActivity[]
  ): Promise<UserInterests> {
    try {
      logger.info('Analyzing user interests', { userId, activityCount: activities.length });

      // 활동 데이터 준비
      const activitySummary = this.summarizeActivities(activities);
      
      // AI 분석 프롬프트 생성
      const prompt = this.fillPromptTemplate(PROMPTS.USER_INTEREST_EXTRACTION, {
        activities: activitySummary,
      });

      // AI 분석 실행
      const response = await this.complete(prompt, {
        responseFormat: 'json',
        temperature: 0.5,
      });

      const analysis = JSON.parse(response);

      const interests: UserInterests = {
        primary: analysis.primaryInterests || [],
        secondary: analysis.secondaryInterests || [],
        skills: analysis.skills || {},
        contentPreferences: {
          types: analysis.contentTypes || ['post', 'resource'],
          formats: analysis.formats || [],
          lengthPreference: analysis.lengthPreference || 'medium',
        },
        learningGoals: analysis.learningGoals || [],
      };

      // 분석 결과 저장
      await this.saveUserInterests(userId, interests);

      return interests;
    } catch (error) {
      logger.error('User interest analysis failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * 활동 데이터 요약
   */
  private summarizeActivities(activities: UserActivity[]): string {
    const summary: any = {
      totalActivities: activities.length,
      activityTypes: {},
      contentTypes: {},
      recentTopics: [],
      engagementPattern: {},
    };

    // 활동 유형별 집계
    activities.forEach(activity => {
      summary.activityTypes[activity.type] = 
        (summary.activityTypes[activity.type] || 0) + 1;
      summary.contentTypes[activity.contentType] = 
        (summary.contentTypes[activity.contentType] || 0) + 1;
    });

    // 최근 활동 시간대 분석
    const recentActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    // 체류 시간 분석
    const viewActivities = activities.filter(a => a.type === 'view' && a.duration);
    if (viewActivities.length > 0) {
      const avgDuration = viewActivities.reduce((sum, a) => sum + (a.duration || 0), 0) / viewActivities.length;
      summary.avgViewDuration = Math.round(avgDuration);
    }

    return JSON.stringify(summary, null, 2);
  }

  /**
   * 사용자 관심사 저장
   */
  private async saveUserInterests(userId: string, interests: UserInterests): Promise<void> {
    const { error } = await supabase
      .from('user_interests')
      .upsert({
        user_id: userId,
        primary_interests: interests.primary,
        secondary_interests: interests.secondary,
        skills: interests.skills,
        content_preferences: interests.contentPreferences,
        learning_goals: interests.learningGoals,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Failed to save user interests', { userId, error });
      throw error;
    }
  }

  /**
   * 사용자 활동 기록
   */
  async trackUserActivity(activity: UserActivity): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: activity.metadata?.userId,
          activity_type: activity.type,
          content_id: activity.contentId,
          content_type: activity.contentType,
          duration: activity.duration,
          metadata: activity.metadata,
          created_at: activity.timestamp.toISOString(),
        });

      if (error) {
        logger.error('Failed to track user activity', { activity, error });
        throw error;
      }

      // 실시간으로 관심사 업데이트 (배치 처리 권장)
      if (activity.metadata?.userId) {
        this.scheduleInterestUpdate(activity.metadata.userId);
      }
    } catch (error) {
      logger.error('Activity tracking failed', { error });
    }
  }

  /**
   * 관심사 업데이트 스케줄링 (디바운싱)
   */
  private updateSchedule = new Map<string, NodeJS.Timeout>();

  private scheduleInterestUpdate(userId: string): void {
    // 기존 스케줄 취소
    const existing = this.updateSchedule.get(userId);
    if (existing) {
      clearTimeout(existing);
    }

    // 5분 후 업데이트
    const timeout = setTimeout(async () => {
      try {
        const activities = await this.getUserActivities(userId, 100);
        await this.analyzeUserInterests(userId, activities);
      } catch (error) {
        logger.error('Scheduled interest update failed', { userId, error });
      }
      this.updateSchedule.delete(userId);
    }, 5 * 60 * 1000);

    this.updateSchedule.set(userId, timeout);
  }

  /**
   * 사용자 활동 가져오기
   */
  private async getUserActivities(userId: string, limit: number): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to get user activities', { userId, error });
      return [];
    }

    return data.map(activity => ({
      type: activity.activity_type,
      contentId: activity.content_id,
      contentType: activity.content_type,
      timestamp: new Date(activity.created_at),
      duration: activity.duration,
      metadata: activity.metadata,
    }));
  }

  /**
   * 사용자 세그먼트 분석
   */
  async analyzeUserSegment(userId: string): Promise<{
    segment: string;
    characteristics: string[];
    recommendations: string[];
  }> {
    const interests = await this.getUserInterests(userId);
    const activities = await this.getUserActivities(userId, 50);

    const prompt = `
      Based on the user's interests and activities, determine their segment:
      
      Interests: ${JSON.stringify(interests)}
      Recent Activities: ${this.summarizeActivities(activities)}
      
      Identify:
      1. User segment (e.g., "Active Learner", "Content Creator", "Community Builder")
      2. Key characteristics
      3. Recommendations for engagement
      
      Format as JSON.
    `;

    const response = await this.complete(prompt, {
      responseFormat: 'json',
      temperature: 0.6,
    });

    return JSON.parse(response);
  }

  /**
   * 사용자 관심사 가져오기
   */
  private async getUserInterests(userId: string): Promise<UserInterests | null> {
    const { data, error } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      primary: data.primary_interests || [],
      secondary: data.secondary_interests || [],
      skills: data.skills || {},
      contentPreferences: data.content_preferences || {
        types: ['post', 'resource'],
        formats: [],
        lengthPreference: 'medium',
      },
      learningGoals: data.learning_goals || [],
    };
  }
}

// 싱글톤 인스턴스
export const userProfileAnalysisService = new UserProfileAnalysisService();
