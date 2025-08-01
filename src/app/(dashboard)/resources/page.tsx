'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Button } from '@/components/ui/button';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFilter } from '@/components/resources/ResourceFilter';
import { useAuth } from '@/contexts/AuthContext';
import { resourceService } from '@/services/resource.service';
import { CategoryService, TagService } from '@/services/category.service';
import type { Resource, ResourceFilters } from '@/types/resource';

export default function ResourcesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // URL 파라미터에서 초기 필터 설정
  useEffect(() => {
    const initializeFilters = async () => {
      const newFilters: ResourceFilters = {};
      
      // 카테고리 슬러그 처리
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        const category = await CategoryService.getCategoryBySlug(categorySlug);
        if (category) {
          newFilters.categoryIds = [category.id];
        }
      }
      
      // 태그 슬러그 처리
      const tagSlug = searchParams.get('tag');
      if (tagSlug) {
        const tag = await TagService.getTagBySlug(tagSlug);
        if (tag) {
          newFilters.tagIds = [tag.id];
        }
      }
      
      setFilters(newFilters);
    };
    
    initializeFilters();
  }, [searchParams]);

  // 초기 로드 및 필터 변경시 리셋
  useEffect(() => {
    setPage(1);
    setResources([]);
    setHasMore(true);
    loadResources(1, true);
  }, [filters, user]);

  const loadResources = async (pageNum: number = page, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      }
      
      const { resources: newResources, count } = await resourceService.getResources(
        filters, 
        pageNum, 
        limit
      );
      
      // 로그인한 사용자의 경우 북마크 상태 확인
      let processedResources = newResources;
      if (user && newResources.length > 0) {
        const resourceIds = newResources.map(r => r.id);
        const response = await fetch('/api/bookmarks/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resourceIds })
        });
        
        if (response.ok) {
          const bookmarkStatus = await response.json();
          processedResources = newResources.map(resource => ({
            ...resource,
            is_bookmarked: bookmarkStatus[resource.id] || false
          }));
        }
      }
      
      if (reset) {
        setResources(processedResources);
      } else {
        setResources(prev => [...prev, ...processedResources]);
      }
      
      // 더 이상 로드할 것이 없으면 hasMore를 false로
      const currentTotal = reset ? processedResources.length : resources.length + processedResources.length;
      setHasMore(currentTotal < (count || 0));
      
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreData = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadResources(nextPage);
  }, [page, filters]);

  const handleFiltersChange = (newFilters: ResourceFilters) => {
    setFilters(newFilters);
  };

  const handleResourceUpdate = () => {
    // 리소스가 업데이트되면 전체 리로드
    setPage(1);
    setResources([]);
    setHasMore(true);
    loadResources(1, true);
  };

  return (
    <div className="container mx-auto py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">AI 학습 리소스</h1>
            <p className="text-muted-foreground mt-2">
              커뮤니티가 추천하는 AI 학습 자료를 찾아보세요
            </p>
          </div>
          {user && (
            <Link href="/resources/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                리소스 추가
              </Button>
            </Link>
          )}
        </div>

        {/* 필터 */}
        <ResourceFilter 
          filters={filters} 
          onFiltersChange={handleFiltersChange} 
        />
      </div>

      {/* 리소스 목록 */}
      {isLoading && resources.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            조건에 맞는 리소스가 없습니다.
          </p>
          {user && (
            <Link href="/resources/new">
              <Button className="mt-4">
                첫 번째 리소스 추가하기
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={resources.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          endMessage={
            <p className="text-center text-muted-foreground py-4">
              모든 리소스를 불러왔습니다.
            </p>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource}
                onVote={handleResourceUpdate}
                onBookmark={() => {}}
              />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
}
