'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { SearchBar } from './SearchBar';
import { SearchFilters } from './SearchFilters';
import { InfiniteScroll } from '@/components/performance/InfiniteScroll';
import { useDebounce } from '@/lib/performance';
import type { Resource } from '@/types/resource';

interface SearchResult {
  resources: Resource[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function SearchResults() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search params to avoid too many API calls
  const debouncedSearchParams = useDebounce(searchParams.toString(), 300);

  // Fetch search results
  const fetchResults = useCallback(async (pageNum: number, append = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams(debouncedSearchParams);
      params.set('page', pageNum.toString());
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      
      if (append && results) {
        // Append to existing results for pagination
        setResults({
          ...data,
          resources: [...results.resources, ...data.resources],
        });
      } else {
        setResults(data);
      }
      
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchParams, loading, results]);

  // Initial fetch
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchResults(1, false);
  }, [debouncedSearchParams]);

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && results) {
      fetchResults(page + 1, true);
    }
  }, [loading, hasMore, page, results, fetchResults]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <SearchBar className="max-w-2xl" />

      {/* Filters */}
      <SearchFilters />

      {/* Results Info */}
      {results && (
        <div className="text-sm text-muted-foreground">
          {results.totalCount}개의 리소스를 찾았습니다
        </div>
      )}

      {/* Results Grid with Infinite Scroll */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : results && results.resources.length > 0 ? (
        <InfiniteScroll
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={loading}
          endMessage={
            <div className="text-center py-8 text-muted-foreground">
              모든 리소스를 불러왔습니다
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
        </div>
      )}
    </div>
  );
}
