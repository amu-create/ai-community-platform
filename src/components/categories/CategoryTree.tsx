'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryTreeNode } from '@/types/category';
import { CategoryService } from '@/services/category.service';

interface CategoryTreeProps {
  selectedCategories?: string[];
  onCategorySelect?: (categoryId: string) => void;
  onCategoryDeselect?: (categoryId: string) => void;
  multiSelect?: boolean;
  showCounts?: boolean;
}

export function CategoryTree({
  selectedCategories = [],
  onCategorySelect,
  onCategoryDeselect,
  multiSelect = false,
  showCounts = true
}: CategoryTreeProps) {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const tree = await CategoryService.getCategoryTree();
      setCategories(tree);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCategoryClick = (category: CategoryTreeNode) => {
    const isSelected = selectedCategories.includes(category.id);
    
    if (!multiSelect && !isSelected) {
      // Single select mode - deselect all others
      selectedCategories.forEach(id => {
        if (onCategoryDeselect) onCategoryDeselect(id);
      });
    }

    if (isSelected) {
      if (onCategoryDeselect) onCategoryDeselect(category.id);
    } else {
      if (onCategorySelect) onCategorySelect(category.id);
    }
  };

  const renderCategory = (category: CategoryTreeNode) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const isSelected = selectedCategories.includes(category.id);

    return (
      <div key={category.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isSelected && "bg-primary/10 text-primary font-medium"
          )}
          style={{ paddingLeft: `${category.level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="p-0.5 hover:bg-background/50 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-5" />}
          
          <div
            onClick={() => handleCategoryClick(category)}
            className="flex-1 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {category.icon && (
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-xs"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.icon.charAt(0)}
                </span>
              )}
              {category.name}
            </span>
            
            {showCounts && category.resource_count > 0 && (
              <span className="text-xs text-muted-foreground">
                {category.resource_count}
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children.map(child => renderCategory(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map(category => renderCategory(category))}
    </div>
  );
}
