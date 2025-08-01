import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id: string
  email: string
  username: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  level: number
  experience: number
  skills: string[]
  interests: string[]
  socialLinks?: {
    github?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
  createdAt: string
  updatedAt: string
  // Stats
  totalResources: number
  totalBookmarks: number
  totalFollowers: number
  totalFollowing: number
  totalContributions: number
}

interface UserState {
  // Current user profile
  profile: UserProfile | null
  
  // Other users cache
  usersCache: Record<string, UserProfile>
  
  // Following/Followers
  following: string[]
  followers: string[]
  
  // Bookmarks
  bookmarkedResources: string[]
  
  // Loading states
  isLoadingProfile: boolean
  isLoadingFollowers: boolean
  isLoadingBookmarks: boolean
  
  // Actions
  setProfile: (profile: UserProfile | null) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  
  // Cache actions
  addUserToCache: (user: UserProfile) => void
  
  // Following actions
  setFollowing: (following: string[]) => void
  setFollowers: (followers: string[]) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  
  // Bookmark actions
  setBookmarks: (bookmarks: string[]) => void
  addBookmark: (resourceId: string) => void
  removeBookmark: (resourceId: string) => void
  
  // Loading actions
  setLoadingProfile: (loading: boolean) => void
  setLoadingFollowers: (loading: boolean) => void
  setLoadingBookmarks: (loading: boolean) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      profile: null,
      usersCache: {},
      following: [],
      followers: [],
      bookmarkedResources: [],
      isLoadingProfile: false,
      isLoadingFollowers: false,
      isLoadingBookmarks: false,
      
      // Profile actions
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      })),
      
      // Cache actions
      addUserToCache: (user) => set((state) => ({
        usersCache: { ...state.usersCache, [user.id]: user },
      })),
      
      // Following actions
      setFollowing: (following) => set({ following }),
      setFollowers: (followers) => set({ followers }),
      followUser: (userId) => set((state) => ({
        following: [...state.following, userId],
      })),
      unfollowUser: (userId) => set((state) => ({
        following: state.following.filter((id) => id !== userId),
      })),
      
      // Bookmark actions
      setBookmarks: (bookmarkedResources) => set({ bookmarkedResources }),
      addBookmark: (resourceId) => set((state) => ({
        bookmarkedResources: [...state.bookmarkedResources, resourceId],
      })),
      removeBookmark: (resourceId) => set((state) => ({
        bookmarkedResources: state.bookmarkedResources.filter(
          (id) => id !== resourceId
        ),
      })),
      
      // Loading actions
      setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),
      setLoadingFollowers: (isLoadingFollowers) => set({ isLoadingFollowers }),
      setLoadingBookmarks: (isLoadingBookmarks) => set({ isLoadingBookmarks }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        bookmarkedResources: state.bookmarkedResources,
      }),
    }
  )
)
