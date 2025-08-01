'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Category, CategoryTreeNode } from '@/types/category';
import { categoryService } from '@/services/categories';

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function CategorySelector({
  value,
  onValueChange,
  label = '카테고리',
  placeholder = '카테고리 선택...',
  className = '',
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await categoryService.getTree();
        setCategories(tree);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderCategoryOptions = (nodes: CategoryTreeNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <div key={node.id}>
        <SelectItem value={node.id} className={`pl-${level * 4}`}>
          <span style={{ paddingLeft: `${level * 16}px` }}>
            {node.name}
          </span>
        </SelectItem>
        {node.children && node.children.length > 0 && 
          renderCategoryOptions(node.children, level + 1)
        }
      </div>
    ));
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-[300px]">
            {renderCategoryOptions(categories)}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}