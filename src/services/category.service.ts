import { supabase } from '@/lib/supabase';
import type { 
  Category, 
  Tag, 
  CategoryFormData, 
  TagFormData,
  CategoryTreeNode,
  ResourceCategory,
  ResourceTag 
} from '@/types/category';

export class CategoryService {
  // Get all categories with hierarchical structure
  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  // Get categories as tree structure
  static async getCategoryTree(): Promise<CategoryTreeNode[]> {
    const categories = await this.getCategories();
    return this.buildCategoryTree(categories);
  }

  // Build tree from flat array
  private static buildCategoryTree(
    categories: Category[], 
    parentId: string | null = null,
    level: number = 0
  ): CategoryTreeNode[] {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        level,
        children: this.buildCategoryTree(categories, cat.id, level + 1)
      }));
  }

  // Get single category
  static async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Create category
  static async createCategory(formData: CategoryFormData): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(formData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update category
  static async updateCategory(id: string, formData: Partial<CategoryFormData>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete category
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get categories for a resource
  static async getResourceCategories(resourceId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('resource_categories')
      .select('categories(*)')
      .eq('resource_id', resourceId);

    if (error) throw error;
    return data?.map(item => item.categories).filter(Boolean) || [];
  }

  // Add category to resource
  static async addResourceCategory(resourceId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('resource_categories')
      .insert({ resource_id: resourceId, category_id: categoryId });

    if (error) throw error;
  }

  // Remove category from resource
  static async removeResourceCategory(resourceId: string, categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('resource_categories')
      .delete()
      .match({ resource_id: resourceId, category_id: categoryId });

    if (error) throw error;
  }

  // Set resource categories (replace all)
  static async setResourceCategories(resourceId: string, categoryIds: string[]): Promise<void> {
    // Delete existing
    await supabase
      .from('resource_categories')
      .delete()
      .eq('resource_id', resourceId);

    // Insert new
    if (categoryIds.length > 0) {
      const { error } = await supabase
        .from('resource_categories')
        .insert(
          categoryIds.map(categoryId => ({
            resource_id: resourceId,
            category_id: categoryId
          }))
        );

      if (error) throw error;
    }
  }
}

export class TagService {
  // Get all tags
  static async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('resource_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get popular tags
  static async getPopularTags(limit: number = 20): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('resource_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get single tag
  static async getTag(id: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Get tag by slug
  static async getTagBySlug(slug: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Create tag
  static async createTag(formData: TagFormData): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert(formData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update tag
  static async updateTag(id: string, formData: Partial<TagFormData>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete tag
  static async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get tags for a resource
  static async getResourceTags(resourceId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('resource_tags')
      .select('tags(*)')
      .eq('resource_id', resourceId);

    if (error) throw error;
    return data?.map(item => item.tags).filter(Boolean) || [];
  }

  // Add tag to resource
  static async addResourceTag(resourceId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('resource_tags')
      .insert({ resource_id: resourceId, tag_id: tagId });

    if (error) throw error;
  }

  // Remove tag from resource
  static async removeResourceTag(resourceId: string, tagId: string): Promise<void> {
    const { error } = await supabase
      .from('resource_tags')
      .delete()
      .match({ resource_id: resourceId, tag_id: tagId });

    if (error) throw error;
  }

  // Set resource tags (replace all)
  static async setResourceTags(resourceId: string, tagIds: string[]): Promise<void> {
    // Delete existing
    await supabase
      .from('resource_tags')
      .delete()
      .eq('resource_id', resourceId);

    // Insert new
    if (tagIds.length > 0) {
      const { error } = await supabase
        .from('resource_tags')
        .insert(
          tagIds.map(tagId => ({
            resource_id: resourceId,
            tag_id: tagId
          }))
        );

      if (error) throw error;
    }
  }

  // Find or create tag by name
  static async findOrCreateTag(name: string): Promise<Tag> {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    // Try to find existing
    const existing = await this.getTagBySlug(slug);
    if (existing) return existing;

    // Create new
    return this.createTag({ name, slug });
  }
}
