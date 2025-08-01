'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  Bookmark, 
  Eye, 
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  Video,
  BookOpen,
  Wrench,
  BookOpenCheck,
  GraduationCap,
  HelpCircle,
  Loader2,
  Tag,
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { resourceService } from '@/services/resource.service';
import { CategoryService, TagService } from '@/services/category.service';
import type { Resource, ResourceType } from '@/types/resource';
import type { Category, Tag as TagType } from '@/types/category';

const resourceTypeIcons: Record<ResourceType, React.ReactNode> = {
  article: <FileText className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  course: <GraduationCap className="h-5 w-5" />,
  tool: <Wrench className="h-5 w-5" />,
  book: <BookOpen className="h-5 w-5" />,
  tutorial: <BookOpenCheck className="h-5 w-5" />,
  other: <HelpCircle className="h-5 w-5" />
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

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadResource();
  }, [params.id]);

  const loadResource = async () => {
    try {
      setIsLoading(true);
      const data = await resourceService.getResource(params.id as string);
      setResource(data);
      
      // Load categories and tags
      const [cats, tgs] = await Promise.all([
        CategoryService.getResourceCategories(params.id as string),
        TagService.getResourceTags(params.id as string)
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (error) {
      toast({
        title: '오류',
        description: '리소스를 불러올 수 없습니다.',
        variant: 'destructive'
      });
      router.push('/resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (vote: -1 | 1) => {
    if (!user || !resource || isVoting) return;
    
    try {
      setIsVoting(true);
      
      if (resource.user_vote === vote) {
        await resourceService.removeVote(resource.id);
        setResource({
          ...resource,
          user_vote: 0,
          vote_count: resource.vote_count - vote
        });
      } else {
        await resourceService.voteResource(resource.id, vote);
        const previousVote = resource.user_vote || 0;
        setResource({
          ...resource,
          user_vote: vote,
          vote_count: resource.vote_count - previousVote + vote
        });
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
  };

  const handleBookmark = async () => {
    if (!user || !resource || isBookmarking) return;
    
    try {
      setIsBookmarking(true);
      const newBookmarkState = await resourceService.toggleBookmark(resource.id);
      setResource({
        ...resource,
        is_bookmarked: newBookmarkState
      });
      
      toast({
        title: newBookmarkState ? '북마크 추가' : '북마크 제거',
        description: newBookmarkState ? '북마크에 추가되었습니다.' : '북마크가 제거되었습니다.'
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '북마크 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    
    try {
      setIsDeleting(true);
      await resourceService.deleteResource(resource.id);
      toast({
        title: '삭제 완료',
        description: '리소스가 삭제되었습니다.'
      });
      router.push('/resources');
    } catch (error) {
      toast({
        title: '오류',
        description: '리소스 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  const isAuthor = user?.id === resource.author_id;

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로가기
      </Button>

      <Card className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold">{resource.title}</h1>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  원본 보기
                </Button>
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              {resourceTypeIcons[resource.type]}
              <span className="ml-1">{resourceTypeLabels[resource.type]}</span>
            </Badge>
            <Badge className={cn('text-sm', levelColors[resource.level])}>
              {levelLabels[resource.level]}
            </Badge>
          </div>

          {/* 카테고리와 태그 */}
          {(categories.length > 0 || tags.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/resources?category=${category.slug}`}
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    <Folder className="h-3 w-3 mr-1" />
                    {category.name}
                  </Badge>
                </Link>
              ))}
              {tags.map(tag => (
                <Link
                  key={tag.id}
                  href={`/resources?tag=${tag.slug}`}
                >
                  <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* 작성자 정보 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/users/${resource.author?.username}`}>
                <Avatar>
                  <AvatarImage src={resource.author?.avatar_url} />
                  <AvatarFallback>
                    {resource.author?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link 
                  href={`/users/${resource.author?.username}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {resource.author?.full_name || resource.author?.username}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(resource.created_at), {
                    addSuffix: true,
                    locale: ko
                  })}
                </p>
              </div>
            </div>

            {isAuthor && (
              <div className="flex gap-2">
                <Link href={`/resources/${resource.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* 설명 */}
        {resource.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">설명</h2>
            <p className="text-muted-foreground">{resource.description}</p>
          </div>
        )}

        {/* 상세 내용 */}
        {resource.content && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">상세 내용</h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap">{resource.content}</pre>
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* 투표 */}
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 px-3',
                  resource.user_vote === 1 && 'text-primary'
                )}
                onClick={() => handleVote(1)}
                disabled={!user || isVoting}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="px-3 font-medium">
                {resource.vote_count}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-9 px-3',
                  resource.user_vote === -1 && 'text-red-500'
                )}
                onClick={() => handleVote(-1)}
                disabled={!user || isVoting}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* 북마크 */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                resource.is_bookmarked && 'text-yellow-500'
              )}
              onClick={handleBookmark}
              disabled={!user || isBookmarking}
            >
              <Bookmark 
                className={cn(
                  'h-4 w-4',
                  resource.is_bookmarked && 'fill-current'
                )} 
              />
              <span className="ml-2">
                {resource.is_bookmarked ? '북마크됨' : '북마크'}
              </span>
            </Button>
          </div>

          {/* 조회수 */}
          <div className="flex items-center text-muted-foreground">
            <Eye className="h-4 w-4 mr-1" />
            {resource.view_count} 조회
          </div>
        </div>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리소스를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 리소스와 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
