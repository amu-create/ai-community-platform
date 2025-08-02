import { supabase } from '@/lib/supabase/client';
import type { Tag, TagFormData } from '@/types/category';

export const tagService = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getPopular(limit = 20): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('resource_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getBySlug(slug: string): Promise<Tag | null> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(formData: TagFormData): Promise<Tag> {
    const slug = formData.slug || this.generateSlug(formData.name);
    
    const { data, error } = await supabase
      .from('tags')
      .insert({
        ...formData,
        slug,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, formData: Partial<TagFormData>): Promise<Tag> {
    const updateData: any = { ...formData, updated_at: new Date().toISOString() };
    
    if (formData.name && !formData.slug) {
      updateData.slug = this.generateSlug(formData.name);
    }

    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getResourceTags(resourceId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('resource_tags')
      .select('tag:tags(*)')
      .eq('resource_id', resourceId);

    if (error) throw error;
    return data?.map((item: any) => item.tag).filter(Boolean) as Tag[] || [];
  },

  async setResourceTags(resourceId: string, tagIds: string[]): Promise<void> {
    // First, remove existing tags
    await supabase
      .from('resource_tags')
      .delete()
      .eq('resource_id', resourceId);

    // Then add new ones
    if (tagIds.length > 0) {
      const { error } = await supabase
        .from('resource_tags')
        .insert(
          tagIds.map(tagId => ({
            resource_id: resourceId,
            tag_id: tagId,
          }))
        );

      if (error) throw error;
    }
  },

  async searchTags(query: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('resource_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};