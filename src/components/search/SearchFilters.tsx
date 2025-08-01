'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category, Tag } from '@/types/category';
import type { ResourceType, ResourceLevel } from '@/types/resource';

interface SearchFiltersProps {
  className?: string;
  onFiltersChange?: (filters: any) => void;
}

const resourceTypes: Array<{ value: ResourceType; label: string }> = [
  { value: 'article', label: '아티클' },
  { value: 'video', label: '비디오' },
  { value: 'course', label: '강의' },
  { value: 'tool', label: '도구' },
  { value: 'book', label: '책' },
  { value: 'tutorial', label: '튜토리얼' },
  { value: 'other', label: '기타' },
];

const resourceLevels: Array<{ value: ResourceLevel; label: string }> = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'all', label: '모든 수준' },
];

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'votes', label: '투표순' },
];

export function SearchFilters({ className = '', onFiltersChange }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [type, setType] = useState<ResourceType | ''>(
    searchParams.get('type') as ResourceType || ''
  );
  const [level, setLevel] = useState<ResourceLevel | ''>(
    searchParams.get('level') as ResourceLevel || ''
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );

  // Fetch categories and tags
  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/tags?popular=true').then(res => res.json()).then(setTags);
  }, []);

  const updateFilters = (updates: Record<string, any>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value);
        }
      } else {
        params.delete(key);
      }
    });

    if (onFiltersChange) {
      onFiltersChange(Object.fromEntries(params));
    } else {
      router.push(`/resources?${params.toString()}`);
    }
  };

  const clearFilters = () => {
    setType('');
    setLevel('');
    setSort('latest');
    setSelectedCategories([]);
    setSelectedTags([]);
    
    if (onFiltersChange) {
      onFiltersChange({});
    } else {
      const params = new URLSearchParams();
      const query = searchParams.get('q');
      if (query) params.set('q', query);
      router.push(`/resources?${params.toString()}`);
    }
  };

  const hasActiveFilters = type || level || sort !== 'latest' || 
    selectedCategories.length > 0 || selectedTags.length > 0;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Type Filter */}
      <Select 
        value={type} 
        onValueChange={(value) => {
          setType(value as ResourceType);
          updateFilters({ type: value });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="타입" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">모든 타입</SelectItem>
          {resourceTypes.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Level Filter */}
      <Select 
        value={level} 
        onValueChange={(value) => {
          setLevel(value as ResourceLevel);
          updateFilters({ level: value });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="난이도" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">모든 난이도</SelectItem>
          {resourceLevels.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between">
            카테고리
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCategories.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {flattenCategories(categories).map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      const newCategories = checked
                        ? [...selectedCategories, category.id]
                        : selectedCategories.filter(id => id !== category.id);
                      setSelectedCategories(newCategories);
                      updateFilters({ categories: newCategories });
                    }}
                  />
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-normal cursor-pointer"
                    style={{ paddingLeft: `${category.level * 16}px` }}
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Tag Filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between">
            태그
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedTags.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px]">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tag.id}
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(checked) => {
                      const newTags = checked
                        ? [...selectedTags, tag.id]
                        : selectedTags.filter(id => id !== tag.id);
                      setSelectedTags(newTags);
                      updateFilters({ tags: newTags });
                    }}
                  />
                  <Label
                    htmlFor={tag.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tag.name}
                    <span className="text-muted-foreground ml-1">
                      ({tag.resource_count})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Sort */}
      <Select 
        value={sort} 
        onValueChange={(value) => {
          setSort(value);
          updateFilters({ sort: value });
        }}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-1" />
          필터 초기화
        </Button>
      )}
    </div>
  );
}

// Helper function to flatten category tree
function flattenCategories(categories: Category[], level = 0): Array<Category & { level: number }> {
  const result: Array<Category & { level: number }> = [];
  
  categories.forEach(category => {
    result.push({ ...category, level });
    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, level + 1));
    }
  });
  
  return result;
}