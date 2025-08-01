'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  type: 'resource' | 'learning_path' | 'post';
  title: string;
  description?: string;
  similarity_score?: number;
  recommendation_reason?: string;
  category?: {
    name: string;
    slug: string;
  };
  author?: {
    username: string;
    avatar_url?: string;
  };
  level?: string;
  rating?: number;
  view_count?: number;
}

interface RecommendationsProps {
  contentType?: 'resource' | 'learning_path' | 'post';
  limit?: number;
  title?: string;
  description?: string;
}

export function AIRecommendations({
  contentType,
  limit = 5,
  title = 'AI 추천 콘텐츠',
  description = 'AI가 당신의 관심사를 분석하여 추천하는 콘텐츠입니다',
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const params = new URLSearchParams();
      if (contentType) params.append('type', contentType);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/ai/recommendations?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: '추천 콘텐츠를 불러올 수 없습니다',
        description: '잠시 후 다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [contentType, limit]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'resource':
        return '리소스';
      case 'learning_path':
        return '학습 경로';
      case 'post':
        return '포스트';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resource':
        return 'default';
      case 'learning_path':
        return 'secondary';
      case 'post':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getDetailUrl = (item: Recommendation) => {
    switch (item.type) {
      case 'resource':
        return `/resources/${item.id}`;
      case 'learning_path':
        return `/learning-paths/${item.id}`;
      case 'post':
        return `/community/posts/${item.id}`;
      default:
        return '#';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            아직 추천할 콘텐츠가 없습니다. 더 많은 활동을 하면 AI가 더 정확한 추천을 제공합니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchRecommendations(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={getDetailUrl(item)}
            className="block group"
          >
            <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={getTypeColor(item.type)}>
                      {getTypeLabel(item.type)}
                    </Badge>
                    {item.category && (
                      <Badge variant="outline">{item.category.name}</Badge>
                    )}
                    {item.level && (
                      <Badge variant="secondary">{item.level}</Badge>
                    )}
                    {item.similarity_score && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{Math.round(item.similarity_score * 100)}% 일치</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
