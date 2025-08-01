'use client';

import React, { useEffect } from 'react';
import { useActivityTracking } from '@/hooks/ai/useRecommendations';

interface ContentViewTrackerProps {
  contentId: string;
  contentType: 'post' | 'resource' | 'event' | 'project';
  children: React.ReactNode;
}

export function ContentViewTracker({
  contentId,
  contentType,
  children,
}: ContentViewTrackerProps) {
  const { trackViewDuration } = useActivityTracking();

  useEffect(() => {
    // 체류 시간 추적 시작
    const stopTracking = trackViewDuration(contentId, contentType);

    // 컴포넌트 언마운트 시 추적 종료
    return stopTracking;
  }, [contentId, contentType, trackViewDuration]);

  return <>{children}</>;
}

// 활동 추적 버튼 컴포넌트
interface ActivityButtonProps {
  contentId: string;
  contentType: 'post' | 'resource' | 'event' | 'project';
  activityType: 'like' | 'bookmark' | 'share';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ActivityButton({
  contentId,
  contentType,
  activityType,
  children,
  onClick,
  className,
}: ActivityButtonProps) {
  const { trackActivity } = useActivityTracking();

  const handleClick = async () => {
    // 활동 추적
    await trackActivity(activityType, contentId, contentType);
    
    // 원래 클릭 핸들러 실행
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}