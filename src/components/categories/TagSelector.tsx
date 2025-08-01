'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Tag } from '@/types/category';

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = '태그 추가...',
  className = '',
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  // Search tags
  useEffect(() => {
    const searchTags = async () => {
      if (!search) {
        setTags([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/tags?q=${encodeURIComponent(search)}`);
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error searching tags:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchTags, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setOpen(false);
    setSearch('');
  };

  const handleRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreate = async () => {
    if (!search.trim()) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: search.trim() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        handleSelect(newTag);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  return (
    <div className={className}>
      <Label>태그</Label>
      <div className="space-y-2">
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => handleRemove(tag.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between"
            >
              {placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput
                placeholder="태그 검색 또는 생성..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandEmpty>
                {search && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleCreate}
                  >
                    "{search}" 태그 생성
                  </Button>
                )}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {tags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag)}
                      disabled={selectedTags.some(t => t.id === tag.id)}
                    >
                      {tag.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {tag.resource_count}
                      </span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}