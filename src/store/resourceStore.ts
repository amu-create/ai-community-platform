import { create } from 'zustand'

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: string
  tags: string[]
  authorId: string
  authorName?: string
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  bookmarkCount: number
  isBookmarked?: boolean
  isLiked?: boolean
}

interface ResourceState {
  resources: Resource[]
  isLoading: boolean
  error: string | null
  filters: {
    category: string | null
    tags: string[]
    searchQuery: string
    sortBy: 'latest' | 'popular' | 'trending'
  }
  
  // Actions
  setResources: (resources: Resource[]) => void
  addResource: (resource: Resource) => void
  updateResource: (id: string, updates: Partial<Resource>) => void
  deleteResource: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Bookmark actions
  toggleBookmark: (id: string) => void
  setBookmarked: (id: string, isBookmarked: boolean) => void
  
  // Filter actions
  setCategory: (category: string | null) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: 'latest' | 'popular' | 'trending') => void
  resetFilters: () => void
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    tags: [],
    searchQuery: '',
    sortBy: 'latest',
  },
  
  // Actions
  setResources: (resources) => set({ resources }),
  addResource: (resource) => set((state) => ({ 
    resources: [resource, ...state.resources] 
  })),
  updateResource: (id, updates) => set((state) => ({
    resources: state.resources.map((r) => 
      r.id === id ? { ...r, ...updates } : r
    ),
  })),
  deleteResource: (id) => set((state) => ({
    resources: state.resources.filter((r) => r.id !== id),
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Bookmark actions
  toggleBookmark: (id) => set((state) => ({
    resources: state.resources.map((r) =>
      r.id === id
        ? {
            ...r,
            isBookmarked: !r.isBookmarked,
            bookmarkCount: r.isBookmarked
              ? Math.max(0, r.bookmarkCount - 1)
              : r.bookmarkCount + 1,
          }
        : r
    ),
  })),
  setBookmarked: (id, isBookmarked) => set((state) => ({
    resources: state.resources.map((r) =>
      r.id === id ? { ...r, isBookmarked } : r
    ),
  })),
  
  // Filter actions
  setCategory: (category) => set((state) => ({
    filters: { ...state.filters, category },
  })),
  addTag: (tag) => set((state) => ({
    filters: { 
      ...state.filters, 
      tags: [...state.filters.tags, tag] 
    },
  })),
  removeTag: (tag) => set((state) => ({
    filters: { 
      ...state.filters, 
      tags: state.filters.tags.filter((t) => t !== tag) 
    },
  })),
  setSearchQuery: (searchQuery) => set((state) => ({
    filters: { ...state.filters, searchQuery },
  })),
  setSortBy: (sortBy) => set((state) => ({
    filters: { ...state.filters, sortBy },
  })),
  resetFilters: () => set((state) => ({
    filters: {
      category: null,
      tags: [],
      searchQuery: '',
      sortBy: 'latest',
    },
  })),
}))
