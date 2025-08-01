import { Suspense } from 'react';
import { SearchResults } from '@/components/search/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResourcesPage() {
  return (
    <div className="container py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">AI 학습 리소스</h1>
        
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full max-w-2xl" />
      
      {/* Filters skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}