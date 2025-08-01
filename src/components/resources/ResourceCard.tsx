'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  ExternalLink,
  FileText,
  Video,
  BookOpen,
  Wrench,
  BookOpenCheck,
  GraduationCap,
  HelpCircle,
  Tag,
  Folder
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookmarkButton } from '@/components/resources/BookmarkButton';
import { OptimizedAvatar } from '@/components/performance/OptimizedImage';
import { cn } from '@/lib/utils';
import type { Resource, ResourceType } from '@/types/resource';
import type { Category as CategoryType, Tag as TagType } from '@/types/category';
import { resourceService } from '@/services/resource.service';
import { CategoryService, TagService } from '@/services/category.service';
import { useToast } from '@/hooks/use-toast';

interface ResourceCardProps {
  resource: Resource;
  onVote?: (resourceId: string, vote: -1 | 1 | 0) => void;
  onBookmark?: (resourceId: string, isBookmarked: boolean) => void;
}

const resourceTypeIcons: Record<ResourceType, React.ReactNode> = {
  article: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  course: <GraduationCap className="h-4 w-4" />,
  tool: <Wrench className="h-4 w-4" />,
  book: <BookOpen className="h-4 w-4" />,
  tutorial: <BookOpenCheck className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />
};

const resourceTypeLabels: Record<ResourceType, string> = {
  article: '아티클',
  video: '비디오',
  course: '강좌',
  tool: '도구',
  book: '도서',
  tutorial: '튜토리얼',
  other: '기타'
};

const levelColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  all: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
};

const levelLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
  all: '전체'
};

export const ResourceCard = memo(function ResourceCard({ 
  resource, 
  onVote, 
  onBookmark 
}: ResourceCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState(resource.user_vote || 0);
  const [voteCount, setVoteCount] = useState(resource.vote_count);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // 카테고리와 태그를 lazy load
    const timer = setTimeout(() => {
      loadCategoriesAndTags();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [resource.id]);

  const loadCategoriesAndTags = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        CategoryService.getResourceCategories(resource.id),
        TagService.getResourceTags(resource.id)
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (error) {
      console.error('Failed to load categories and tags:', error);
    }
  };

  const handleVote = useCallback(async (vote: -1 | 1) => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      if (userVote === vote) {
        // 같은 투표 클릭 시 취소
        await resourceService.removeVote(resource.id);
        setUserVote(0);
        setVoteCount(prev => prev - vote);
        onVote?.(resource.id, 0);
      } else {
        // 새로운 투표 또는 변경
        await resourceService.voteResource(resource.id, vote);
        const previousVote = userVote;
        setUserVote(vote);
        setVoteCount(prev => prev - previousVote + vote);
        onVote?.(resource.id, vote);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '투표 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsVoting(false);
    }
  }, [isVoting, userVote, resource.id, onVote, toast]);

  const formattedDate = formatDistanceToNow(new Date(resource.created_at), {
    addSuffix: true,
    locale: ko
  });

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/resources/${resource.id}`} prefetch={false}>
              <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                {resource.title}
              </h3>
            </Link>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {resourceTypeIcons[resource.type]}
                <span className="ml-1">{resourceTypeLabels[resource.type]}</span>
              </Badge>
              <Badge className={cn('text-xs', levelColors[resource.level])}>
                {levelLabels[resource.level]}
              </Badge>
            </div>
          </div>
          
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          )}
        </div>

        {/* 설명 */}
        {resource.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* 카테고리와 태그 - lazy loaded */}
        {(categories.length > 0 || tags.length > 0) && (
          <div className="flex flex-wrap gap-2 min-h-[1.5rem]">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/resources?category=${category.slug}`}
                prefetch={false}
              >
                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
                  <Folder className="h-3 w-3 mr-1" />
                  {category.name}
                </Badge>
              </Link>
            ))}
            {tags.map(tag => (
              <Link
                key={tag.id}
                href={`/resources?tag=${tag.slug}`}
                prefetch={false}
              >
                <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-accent">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* 작성자 정보 */}
        <div className="flex items-center space-x-2">
          <Link href={`/users/${resource.author?.username}`} prefetch={false}>
            <OptimizedAvatar
              src={resource.author?.avatar_url}
              alt={resource.author?.username || 'User'}
              size={24}
            />
          </Link>
          <div className="flex items-center text-sm text-muted-foreground">
            <Link 
              href={`/users/${resource.author?.username}`}
              className="hover:text-primary transition-colors"
              prefetch={false}
            >
              {resource.author?.full_name || resource.author?.username}
            </Link>
            <span className="mx-1">·</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {/* 투표 */}
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2',
                  userVote === 1 && 'text-primary'
                )}
                onClick={() => handleVote(1)}
                disabled={isVoting}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm font-medium">
                {voteCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2',
                  userVote === -1 && 'text-red-500'
                )}
                onClick={() => handleVote(-1)}
                disabled={isVoting}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* 북마크 */}
            <BookmarkButton
              resourceId={resource.id}
              isBookmarked={resource.is_bookmarked}
              bookmarkCount={resource.bookmark_count || 0}
              showCount={false}
              size="sm"
              variant="ghost"
              onBookmarkToggle={(isBookmarked) => onBookmark?.(resource.id, isBookmarked)}
            />
          </div>

          {/* 조회수 */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Eye className="h-4 w-4 mr-1" />
            {resource.view_count}
          </div>
        </div>
      </div>
    </Card>
  );
});
