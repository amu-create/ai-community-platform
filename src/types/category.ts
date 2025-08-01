// Category and Tag type definitions

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  resource_count: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  resource_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceCategory {
  resource_id: string;
  category_id: string;
  created_at: string;
}

export interface ResourceTag {
  resource_id: string;
  tag_id: string;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
}

export interface TagFormData {
  name: string;
  slug?: string;
  description?: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  level: number;
}
