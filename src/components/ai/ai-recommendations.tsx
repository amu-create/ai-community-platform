'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Brain, Sparkles, ThumbsUp, ThumbsDown, Bookmark, X } from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  id: string;
  type: 'resource' | 'learning_path';
  resource?: any;
  learning_path?: any;
  score: number;
  reason: string;
}

interface AIRecommendationsProps {
  type?: 'resource' | 'learning_path' | 'mixed';
  limit?: number;
}

export function AIRecommendations({ type = 'mixed', limit = 5 }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, [type, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, limit })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (recommendationId: string, feedbackType: string) => {
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, feedbackType })
      });

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }

      toast({
        title: 'Thank you!',
        description: 'Your feedback helps improve our recommendations',
      });

      // 피드백 후 해당 추천 제거
      if (feedbackType === 'dismiss') {
        setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save feedback',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {error || 'No recommendations available at the moment'}
          </p>
          <Button onClick={fetchRecommendations} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions based on your learning journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <Badge variant={recommendation.type === 'resource' ? 'default' : 'secondary'}>
                    {recommendation.type === 'resource' ? 'Resource' : 'Learning Path'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(recommendation.score * 100)}% match
                  </span>
                </div>
                
                <Link
                  href={
                    recommendation.type === 'resource'
                      ? `/resources/${recommendation.resource?.id}`
                      : `/learning-paths/${recommendation.learning_path?.slug}`
                  }
                  className="hover:underline"
                >
                  <h4 className="font-semibold text-sm mb-1">
                    {recommendation.type === 'resource'
                      ? recommendation.resource?.title
                      : recommendation.learning_path?.title}
                  </h4>
                </Link>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {recommendation.type === 'resource'
                    ? recommendation.resource?.description
                    : recommendation.learning_path?.description}
                </p>
                
                <p className="text-xs text-primary italic">
                  {recommendation.reason}
                </p>
              </div>
              
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleFeedback(recommendation.id, 'helpful')}
                  title="This was helpful"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleFeedback(recommendation.id, 'not_helpful')}
                  title="Not helpful"
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleFeedback(recommendation.id, 'save')}
                  title="Save for later"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleFeedback(recommendation.id, 'dismiss')}
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
