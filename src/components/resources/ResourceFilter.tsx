'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CategoryTree } from '@/components/categories/CategoryTree';
import { TagSelector } from '@/components/categories/TagSelector';
import type { ResourceFilters, ResourceType, ResourceLevel } from '@/types/resource';
import type { Category, Tag } from '@/types/category';
import { CategoryService, TagService } from '@/services/category.service';

interface ResourceFilterProps {
  filters: ResourceFilters;
  onFiltersChange: (filters: ResourceFilters) => void;
}

const resourceTypes: { value: ResourceType; label: string }[] = [
  { value: 'article', label: '아티클' },
  { value: 'video', label: '비디오' },
  { value: 'course', label: '강좌' },
  { value: 'tool', label: '도구' },
  { value: 'book', label: '도서' },
  { value: 'tutorial', label: '튜토리얼' },
  { value: 'other', label: '기타' }
];

const resourceLevels: { value: ResourceLevel; label: string }[] = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'all', label: '전체' }
];

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'votes', label: '추천순' }
];

export function ResourceFilter({ filters, onFiltersChange }: ResourceFilterProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadCategoriesAndTags();
  }, []);

  const loadCategoriesAndTags = async () => {
    try {
      const [cats, tgs] = await Promise.all([
        CategoryService.getCategories(),
        TagService.getTags()
      ]);
      setCategories(cats);
      setTags(tgs);
    } catch (error) {
      console.error('Failed to load categories and tags:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search });
  };

  const handleFilterChange = (key: keyof ResourceFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCategoryChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    onFiltersChange({ ...filters, categoryIds });
  };

  const handleTagChange = (tags: Tag[]) => {
    setSelectedTags(tags);
    onFiltersChange({ ...filters, tagIds: tags.map(t => t.id) });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedTags([]);
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="리소스 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      {/* 필터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카테고리 필터 */}
        <div className="space-y-2">
          <Label>카테고리</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {selectedCategories.length > 0 ? (
                  <span className="truncate">
                    {selectedCategories.length}개 선택됨
                  </span>
                ) : (
                  <span className="text-muted-foreground">카테고리 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">카테고리 선택</h4>
                <div className="max-h-64 overflow-y-auto">
                  <CategoryTree
                    selectedCategories={selectedCategories}
                    onCategorySelect={(id) => {
                      const newCategories = [...selectedCategories, id];
                      handleCategoryChange(newCategories);
                    }}
                    onCategoryDeselect={(id) => {
                      const newCategories = selectedCategories.filter(c => c !== id);
                      handleCategoryChange(newCategories);
                    }}
                    multiSelect={true}
                    showCounts={true}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 타입 필터 */}
        <div className="space-y-2">
          <Label>타입</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={(value) => 
              handleFilterChange('type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 레벨 필터 */}
        <div className="space-y-2">
          <Label>난이도</Label>
          <Select
            value={filters.level || 'all'}
            onValueChange={(value) => 
              handleFilterChange('level', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {resourceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 정렬 */}
        <div className="space-y-2">
          <Label>정렬</Label>
          <Select
            value={filters.sort || 'latest'}
            onValueChange={(value) => handleFilterChange('sort', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 리셋 버튼 */}
        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full"
          >
            <Filter className="mr-2 h-4 w-4" />
            필터 초기화
          </Button>
        </div>
      </div>

      {/* 태그 필터 */}
      <div className="space-y-2">
        <Label>태그 필터</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {selectedTags.length > 0 ? (
                <span className="truncate">
                  {selectedTags.length}개 태그 선택됨
                </span>
              ) : (
                <span className="text-muted-foreground">태그로 필터링</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">태그 선택</h4>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={handleTagChange}
                placeholder="태그 검색..."
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 선택된 필터 표시 */}
      {(selectedCategories.length > 0 || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCategories.map(catId => {
            const category = categories.find(c => c.id === catId);
            return category ? (
              <Badge
                key={catId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  const newCategories = selectedCategories.filter(c => c !== catId);
                  handleCategoryChange(newCategories);
                }}
              >
                {category.name} ×
              </Badge>
            ) : null;
          })}
          {selectedTags.map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                const newTags = selectedTags.filter(t => t.id !== tag.id);
                handleTagChange(newTags);
              }}
            >
              #{tag.name} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
