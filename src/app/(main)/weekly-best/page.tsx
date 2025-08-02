import { WeeklyBestContent } from '@/components/weekly-best/WeeklyBestContent';
import { Card } from '@/components/ui/card';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function WeeklyBestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">주간 베스트 콘텐츠</h1>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          이번 주 가장 인기 있는 리소스와 포스트를 확인하세요
        </p>
      </div>

      <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
            <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">선정 기준</h2>
            <p className="text-sm text-muted-foreground">
              매주 월요일, 지난 한 주간의 조회수, 추천수, 북마크수, 댓글수를 종합하여 
              가장 인기 있었던 콘텐츠를 선정합니다.
            </p>
          </div>
        </div>
      </Card>

      <WeeklyBestContent />
    </div>
  );
}
