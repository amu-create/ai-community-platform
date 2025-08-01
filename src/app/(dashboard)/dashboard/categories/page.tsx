'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { categoryService } from '@/services/categories';
import type { Category, CategoryFormData, CategoryTreeNode } from '@/types/category';

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parent_id: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const tree = await categoryService.getTree();
      setCategories(tree);
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리를 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await categoryService.create(formData);
      toast({
        title: '성공',
        description: '카테고리가 생성되었습니다.',
      });
      setDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리 생성에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    try {
      await categoryService.update(editingCategory.id, formData);
      toast({
        title: '성공',
        description: '카테고리가 수정되었습니다.',
      });
      setDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리 수정에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await categoryService.delete(deletingCategory.id);
      toast({
        title: '성공',
        description: '카테고리가 삭제되었습니다.',
      });
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      loadCategories();
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  const openCreateDialog = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: parentId || '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || '',
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: '',
    });
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (nodes: CategoryTreeNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedCategories.has(node.id);

      return (
        <div key={node.id}>
          <div 
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
            style={{ paddingLeft: `${level * 24 + 8}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpand(node.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasChildren && <div className="w-6" />}
              
              <div>
                <div className="font-medium">{node.name}</div>
                {node.description && (
                  <div className="text-sm text-muted-foreground">{node.description}</div>
                )}
                <div className="text-xs text-muted-foreground">
                  {node.resource_count}개의 리소스
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openCreateDialog(node.id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(node)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog(node)}
                disabled={hasChildren || node.resource_count > 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div>{renderCategoryTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">카테고리 관리</h1>
        <Button onClick={() => openCreateDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          카테고리 추가
        </Button>
      </div>

      <div className="bg-background border rounded-lg">
        {categories.length > 0 ? (
          renderCategoryTree(categories)
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            카테고리가 없습니다. 첫 번째 카테고리를 추가해보세요.
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '카테고리 수정' : '카테고리 추가'}
            </DialogTitle>
            <DialogDescription>
              카테고리 정보를 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="카테고리 이름"
              />
            </div>

            <div>
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="카테고리 설명"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={editingCategory ? handleUpdate : handleCreate}>
              {editingCategory ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingCategory?.name}" 카테고리를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}