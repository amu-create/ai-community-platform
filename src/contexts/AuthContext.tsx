'use client'

import { createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { setUser, setLoading, logout } = useAuthStore()
  const { setProfile } = useUserStore()

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch user profile
        fetchUserProfile(session.user.id)
      }
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, setProfile])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      if (data) {
        setProfile({
          ...data,
          level: data.level || 1,
          experience: data.experience || 0,
          skills: data.skills || [],
          interests: data.interests || [],
          totalResources: data.total_resources || 0,
          totalBookmarks: data.total_bookmarks || 0,
          totalFollowers: data.total_followers || 0,
          totalFollowing: data.total_following || 0,
          totalContributions: data.total_contributions || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    router.push('/dashboard')
  }

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    
    if (error) throw error
    
    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username,
          email,
        })
      
      if (profileError) throw profileError
    }
    
    router.push('/dashboard')
  }

  const signOut = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    logout()
    setProfile(null)
    router.push('/')
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
  }

  const signInWithGithub = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
  }

  const value = {
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithGithub,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
