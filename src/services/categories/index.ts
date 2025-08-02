import { supabase } from '@/lib/supabase/client';
import type { Category, CategoryFormData, CategoryTreeNode } from '@/types/category';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.getAll();
    return this.buildTree(categories);
  },

  buildTree(categories: Category[]): CategoryTreeNode[] {
    const map = new Map<string, CategoryTreeNode>();
    const roots: CategoryTreeNode[] = [];

    // First pass: create all nodes
    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [], level: 0 });
    });

    // Second pass: build tree structure
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id) {
        const parent = map.get(cat.parent_id);
        if (parent) {
          parent.children.push(node);
          node.level = parent.level + 1;
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  },

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(formData: CategoryFormData): Promise<Category> {
    const slug = formData.slug || this.generateSlug(formData.name);
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...formData,
        slug,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<CategoryFormData>): Promise<Category> {
    const updateData: any = { ...formData, updated_at: new Date().toISOString() };
    
    if (formData.name && !formData.slug) {
      updateData.slug = this.generateSlug(formData.name);
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getResourceCategories(resourceId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('resource_categories')
      .select('category:categories(*)')
      .eq('resource_id', resourceId);

    if (error) throw error;
    return data?.map((item: any) => item.category).filter(Boolean) as Category[] || [];
  },

  async setResourceCategories(resourceId: string, categoryIds: string[]): Promise<void> {
    // First, remove existing categories
    await supabase
      .from('resource_categories')
      .delete()
      .eq('resource_id', resourceId);

    // Then add new ones
    if (categoryIds.length > 0) {
      const { error } = await supabase
        .from('resource_categories')
        .insert(
          categoryIds.map(categoryId => ({
            resource_id: resourceId,
            category_id: categoryId,
          }))
        );

      if (error) throw error;
    }
  },

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};