'use client';

import React from 'react';
import { useRecommendations } from '@/hooks/ai/useRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Users, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RecommendationListProps {
  type?: 'personalized' | 'trending' | 'collaborative' | 'hybrid';
  limit?: number;
  contentTypes?: string[];
  className?: string;
}

export function RecommendationList({
  type = 'personalized',
  limit = 10,
  contentTypes,
  className = '',
}: RecommendationListProps) {
  const { recommendations, loading, error, refetch, trackClick } = useRecommendations({
    type,
    limit,
    contentTypes,
  });

  const getIcon = () => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-5 w-5" />;
      case 'collaborative':
        return <Users className="h-5 w-5" />;
      case 'hybrid':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'trending':
        return 'Trending Now';
      case 'collaborative':
        return 'Popular with Similar Users';
      case 'hybrid':
        return 'Discover';
      default:
        return 'Recommended for You';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground mb-4">Failed to load recommendations</p>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-muted-foreground">No recommendations available yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Interact with more content to get personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
        </div>
        <Button onClick={() => refetch()} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.contentId}
            href={`/content/${rec.contentId}`}
            onClick={() => trackClick(rec.contentId)}
          >
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base line-clamp-2">
                      {rec.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {rec.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {rec.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={rec.author.avatar} />
                      <AvatarFallback>
                        {rec.author.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {rec.author.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rec.metadata?.topics?.slice(0, 2).map((topic: string) => (
                      <Badge key={topic} variant="outline" className="ml-1 text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                {rec.reason && (
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    {rec.reason}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}