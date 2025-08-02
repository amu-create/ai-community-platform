import { Metadata } from 'next';
import { WeeklyBest } from '@/components/weekly-best/WeeklyBest';

export const metadata: Metadata = {
  title: '주간 베스트 | AI Community Platform',
  description: '이번 주 가장 인기 있는 리소스, 포스트, 그리고 활발한 기여자들을 만나보세요.',
};

export default function WeeklyBestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <WeeklyBest />
    </div>
  );
}
