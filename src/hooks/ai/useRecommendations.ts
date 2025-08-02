import { useState, useEffect, useCallback } from 'react';
import { useApiError } from '@/lib/error/hooks';

export interface Recommendation {
  contentId: string;
  score: number;
  reason: string;
  type: 'post' | 'resource' | 'event' | 'project';
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface UseRecommendationsOptions {
  type?: 'personalized' | 'trending' | 'collaborative' | 'hybrid' | 'similar';
  limit?: number;
  contentTypes?: string[];
  excludeIds?: string[];
  contentId?: string; // For similar recommendations
  timeWindow?: '24h' | '7d' | '30d'; // For trending
  autoLoad?: boolean;
}

export function useRecommendations(options: UseRecommendationsOptions = {}) {
  const {
    type = 'personalized',
    limit = 10,
    contentTypes,
    excludeIds,
    contentId,
    timeWindow = '7d',
    autoLoad = true,
  } = options;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      });

      if (contentTypes?.length) {
        params.append('contentTypes', contentTypes.join(','));
      }

      if (excludeIds?.length) {
        params.append('excludeIds', excludeIds.join(','));
      }

      if (type === 'similar' && contentId) {
        params.append('contentId', contentId);
      }

      if (type === 'trending') {
        params.append('timeWindow', timeWindow);
      }

      const response = await fetch(`/api/ai/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [type, limit, contentTypes, excludeIds, contentId, timeWindow, clearError, handleError]);

  // 추천 클릭 추적
  const trackClick = useCallback(async (clickedContentId: string) => {
    try {
      await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: clickedContentId,
          action: 'click',
        }),
      });
    } catch (err) {
      console.error('Failed to track recommendation click:', err);
    }
  }, []);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      fetchRecommendations();
    }
  }, [autoLoad, fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
    trackClick,
  };
}

// 사용자 활동 추적 훅
interface TrackActivityOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useActivityTracking(options: TrackActivityOptions = {}) {
  const { error, handleError, clearError } = useApiError();
  const [tracking, setTracking] = useState(false);

  const trackActivity = useCallback(async (
    type: 'view' | 'like' | 'comment' | 'share' | 'bookmark' | 'create',
    contentId: string,
    contentType: 'post' | 'resource' | 'event' | 'project',
    metadata?: Record<string, any>
  ) => {
    setTracking(true);
    clearError();

    try {
      const response = await fetch('/api/ai/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          contentId,
          contentType,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track activity');
      }

      options.onSuccess?.();
    } catch (err) {
      const error = err as Error;
      handleError(error);
      options.onError?.(error);
    } finally {
      setTracking(false);
    }
  }, [clearError, handleError, options]);

  // 체류 시간 추적
  const trackViewDuration = useCallback((
    contentId: string,
    contentType: 'post' | 'resource' | 'event' | 'project'
  ) => {
    const startTime = Date.now();

    return () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      if (duration > 3) { // 3초 이상 체류한 경우만 추적
        trackActivity('view', contentId, contentType, { duration });
      }
    };
  }, [trackActivity]);

  return {
    trackActivity,
    trackViewDuration,
    tracking,
    error,
  };
}

// 콘텐츠 분석 훅
interface UseContentAnalysisOptions {
  autoAnalyze?: boolean;
  forceReanalyze?: boolean;
}

export function useContentAnalysis(
  contentId: string | null,
  options: UseContentAnalysisOptions = {}
) {
  const { autoAnalyze = true, forceReanalyze = false } = options;
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const analyzeContent = useCallback(async () => {
    if (!contentId) return;

    setAnalyzing(true);
    clearError();

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          forceReanalyze,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze content');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      handleError(err);
    } finally {
      setAnalyzing(false);
    }
  }, [contentId, forceReanalyze, clearError, handleError]);

  // 유사 콘텐츠 찾기
  const [similarContents, setSimilarContents] = useState<any[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const findSimilarContents = useCallback(async (limit = 5) => {
    if (!contentId) return;

    setLoadingSimilar(true);

    try {
      const response = await fetch(
        `/api/ai/analyze?contentId=${contentId}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to find similar contents');
      }

      const data = await response.json();
      setSimilarContents(data.similarContents);
    } catch (err) {
      console.error('Failed to find similar contents:', err);
    } finally {
      setLoadingSimilar(false);
    }
  }, [contentId]);

  // 자동 분석
  useEffect(() => {
    if (autoAnalyze && contentId) {
      analyzeContent();
    }
  }, [autoAnalyze, contentId, analyzeContent]);

  return {
    analysis,
    analyzing,
    error,
    analyzeContent,
    similarContents,
    loadingSimilar,
    findSimilarContents,
  };
}

// 사용자 관심사 훅
export function useUserInterests() {
  const [interests, setInterests] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const fetchInterests = useCallback(async (forceUpdate = false) => {
    setLoading(true);
    clearError();

    try {
      const params = new URLSearchParams();
      if (forceUpdate) {
        params.append('forceUpdate', 'true');
      }

      const response = await fetch(`/api/ai/activity?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user interests');
      }

      const data = await response.json();
      setInterests(data.interests);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  return {
    interests,
    loading,
    error,
    refetch: fetchInterests,
  };
}