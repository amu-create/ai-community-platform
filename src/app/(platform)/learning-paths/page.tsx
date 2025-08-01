import { Suspense } from 'react';
import { getLearningPaths } from '@/app/actions/learning';
import { getCategories } from '@/app/actions/resources';
import LearningPathsContent from './LearningPathsContent';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Learning Paths - AI Community Platform',
  description: 'Structured learning paths to master AI skills step by step',
};

function LearningPathsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      ))}
    </div>
  );
}

export default async function LearningPathsPage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}) {
  const [initialPaths, categories] = await Promise.all([
    getLearningPaths({
      category_id: searchParams.category,
      difficulty_level: searchParams.difficulty,
      limit: 20,
    }),
    getCategories(),
  ]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learning Paths</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow structured paths to master AI skills step by step
        </p>
      </div>

      <Suspense fallback={<LearningPathsSkeleton />}>
        <LearningPathsContent 
          initialPaths={initialPaths}
          categories={categories}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}
