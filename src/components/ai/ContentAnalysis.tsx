'use client';

import React from 'react';
import { useContentAnalysis } from '@/hooks/ai/useRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Users, Target, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface SimilarContentProps {
  contentId: string;
  limit?: number;
  className?: string;
}

export function SimilarContent({
  contentId,
  limit = 5,
  className = '',
}: SimilarContentProps) {
  const { similarContents, loadingSimilar, findSimilarContents } = useContentAnalysis(contentId);

  React.useEffect(() => {
    findSimilarContents(limit);
  }, [contentId, limit, findSimilarContents]);

  if (loadingSimilar) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Similar Content</h3>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!similarContents || similarContents.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Similar Content</h3>
      <div className="space-y-3">
        {similarContents.map((content) => (
          <Link key={content.id} href={`/content/${content.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm line-clamp-1">
                  {content.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {content.description}
                </CardDescription>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {Math.round(content.similarity * 100)}% match
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    by {content.profiles?.full_name}
                  </span>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 콘텐츠 분석 인사이트 컴포넌트
interface ContentInsightsProps {
  contentId: string;
  className?: string;
}

export function ContentInsights({
  contentId,
  className = '',
}: ContentInsightsProps) {
  const { analysis, analyzing } = useContentAnalysis(contentId);

  if (analyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Content Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Content Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 주제 */}
          {analysis.topics && analysis.topics.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Topics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic: string) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 대상 독자 & 난이도 */}
          <div className="grid grid-cols-2 gap-4">
            {analysis.target_audience && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Target Audience</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {analysis.target_audience}
                </p>
              </div>
            )}

            {analysis.difficulty_level && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Difficulty</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {analysis.difficulty_level}
                </Badge>
              </div>
            )}
          </div>

          {/* 요약 */}
          {analysis.summary && (
            <div>
              <h4 className="text-sm font-medium mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>
          )}

          {/* 핵심 포인트 */}
          {analysis.key_takeaways && analysis.key_takeaways.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Key Takeaways</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.key_takeaways.map((takeaway: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}