'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Target,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { AIRecommendations } from './ai-recommendations';

export function AIInsightsWidget() {
  const [activeTab, setActiveTab] = useState('recommendations');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Learning Assistant
            </CardTitle>
            <CardDescription>
              Personalized insights and recommendations
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">For You</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="mt-4">
            <AIRecommendations type="mixed" limit={5} />
          </TabsContent>
          
          <TabsContent value="trending" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending in Your Areas
              </h4>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">Next.js 14 App Router</p>
                      <p className="text-xs text-muted-foreground">
                        85% of users in your skill level are learning this
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">AI Integration Patterns</p>
                      <p className="text-xs text-muted-foreground">
                        Trending topic with 120% growth this week
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Suggested Learning Goals
              </h4>
              <div className="space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">Master React Hooks</p>
                    <Badge variant="outline" className="text-xs">
                      7 days
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Based on your current progress, you can achieve this by completing 3 resources
                  </p>
                  <Button size="sm" className="w-full">
                    Start Goal
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">Build Full-Stack App</p>
                    <Badge variant="outline" className="text-xs">
                      30 days
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Complete learning path with hands-on project
                  </p>
                  <Button size="sm" className="w-full" variant="outline">
                    View Path
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t">
          <Link href="/ai-assistant">
            <Button className="w-full" variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Open AI Assistant
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
