'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { resourceService } from '@/services/resources';
import { categoryService } from '@/services/categories';
import { tagService } from '@/services/tags';
import { CategorySelector } from '@/components/categories/CategorySelector';
import { TagSelector } from '@/components/categories/TagSelector';
import type { Resource, ResourceFormData } from '@/types/resource';
import type { Category, Tag } from '@/types/category';

const resourceFormSchema = z.object({
  title: z.string().min(5, '제목은 최소 5자 이상이어야 합니다.').max(255),
  description: z.string().min(10, '설명은 최소 10자 이상이어야 합니다.'),
  content: z.string().optional(),
  url: z.string().url('올바른 URL을 입력해주세요.').optional().or(z.literal('')),
  type: z.enum(['article', 'video', 'course', 'tool', 'book', 'tutorial', 'other']),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  status: z.enum(['draft', 'published']).optional()
});

interface ResourceFormProps {
  resource?: Resource;
  onSuccess?: (resource: Resource) => void;
}

export function ResourceForm({ resource, onSuccess }: ResourceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Load existing categories and tags if editing
  useEffect(() => {
    if (resource) {
      loadResourceCategoriesAndTags();
    }
  }, [resource]);

  const loadResourceCategoriesAndTags = async () => {
    if (!resource) return;
    
    try {
      const [categories, tags] = await Promise.all([
        categoryService.getResourceCategories(resource.id),
        tagService.getResourceTags(resource.id)
      ]);
      
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
      setSelectedTags(tags);
    } catch (error) {
      console.error('Failed to load categories and tags:', error);
    }
  };

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: resource?.title || '',
      description: resource?.description || '',
      content: resource?.content || '',
      url: resource?.url || '',
      type: resource?.type || 'article',
      level: resource?.level || 'all',
      status: resource?.status || 'published'
    }
  });

  const onSubmit = async (data: ResourceFormData) => {
    try {
      setIsSubmitting(true);
      
      let result: Resource;
      if (resource) {
        result = await resourceService.updateResource(resource.id, data);
        
        // Update categories and tags
        await Promise.all([
          categoryService.setResourceCategories(resource.id, selectedCategory ? [selectedCategory] : []),
          tagService.setResourceTags(resource.id, selectedTags.map(t => t.id))
        ]);
        
        toast({
          title: '리소스 수정 완료',
          description: '리소스가 성공적으로 수정되었습니다.'
        });
      } else {
        result = await resourceService.createResource(data);
        
        // Add categories and tags to new resource
        await Promise.all([
          categoryService.setResourceCategories(result.id, selectedCategory ? [selectedCategory] : []),
          tagService.setResourceTags(result.id, selectedTags.map(t => t.id))
        ]);
        
        toast({
          title: '리소스 생성 완료',
          description: '리소스가 성공적으로 생성되었습니다.'
        });
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(`/resources/${result.id}`);
      }
    } catch (error) {
      toast({
        title: '오류',
        description: '리소스 처리 중 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 제목 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input 
                  placeholder="AI 학습을 위한 유용한 리소스 제목" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 설명 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="리소스에 대한 간단한 설명을 작성해주세요."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* URL */}
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (선택사항)</FormLabel>
              <FormControl>
                <Input 
                  type="url"
                  placeholder="https://example.com" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                외부 리소스 링크가 있다면 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 콘텐츠 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>상세 내용 (선택사항)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="리소스에 대한 상세한 설명이나 내용을 작성해주세요."
                  rows={10}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                마크다운 형식을 지원합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 타입 */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>리소스 타입</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="타입을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="article">아티클</SelectItem>
                    <SelectItem value="video">비디오</SelectItem>
                    <SelectItem value="course">강좌</SelectItem>
                    <SelectItem value="tool">도구</SelectItem>
                    <SelectItem value="book">도서</SelectItem>
                    <SelectItem value="tutorial">튜토리얼</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 레벨 */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>난이도</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="난이도를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">초급</SelectItem>
                    <SelectItem value="intermediate">중급</SelectItem>
                    <SelectItem value="advanced">고급</SelectItem>
                    <SelectItem value="all">전체</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 상태 */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>공개 상태</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="published" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      공개 - 모든 사용자가 볼 수 있습니다.
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="draft" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      임시저장 - 나만 볼 수 있습니다.
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 카테고리 */}
        <CategorySelector
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          label="카테고리"
          placeholder="카테고리를 선택하세요"
          className="w-full"
        />

        {/* 태그 */}
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          placeholder="태그 추가..."
          className="w-full"
        />

        {/* 제출 버튼 */}
        <div className="flex gap-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                {form.watch('status') === 'draft' ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    임시저장
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {resource ? '수정하기' : '게시하기'}
                  </>
                )}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
