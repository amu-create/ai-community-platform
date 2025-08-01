import { Suspense } from 'react';
import { getPosts } from '@/app/actions/community';
import { getCategories } from '@/app/actions/resources';
import CommunityContent from './CommunityContent';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Community - AI Community Platform',
  description: 'Join discussions, share experiences, and learn from the AI community',
};

function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    sort?: 'recent' | 'popular' | 'commented';
  };
}) {
  const [initialPosts, categories] = await Promise.all([
    getPosts({
      category_id: searchParams.category,
      sort: searchParams.sort || 'recent',
      limit: 20,
    }),
    getCategories(),
  ]);

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Community</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Join discussions, share experiences, and learn from the AI community
        </p>
      </div>

      <Suspense fallback={<PostsSkeleton />}>
        <CommunityContent 
          initialPosts={initialPosts}
          categories={categories}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  );
}
