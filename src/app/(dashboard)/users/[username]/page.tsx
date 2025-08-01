'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUserStore, UserProfile } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Users, 
  Heart,
  UserPlus,
  UserMinus,
  Github,
  Twitter,
  Linkedin,
  Globe
} from 'lucide-react'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const username = params.username as string
  
  const { user } = useAuthStore()
  const { 
    profile: currentUserProfile, 
    following, 
    followUser, 
    unfollowUser,
    addUserToCache,
    usersCache
  } = useUserStore()
  const { addToast } = useUIStore()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (username) {
      // Check if viewing own profile
      if (currentUserProfile?.username === username) {
        router.push('/profile')
        return
      }
      
      // Check cache first
      const cachedUser = Object.values(usersCache).find(u => u.username === username)
      if (cachedUser) {
        setProfile(cachedUser)
        setIsLoading(false)
        checkFollowStatus(cachedUser.id)
      } else {
        fetchUserProfile()
      }
    }
  }, [username, currentUserProfile, usersCache])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error

      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          email: data.email,
          username: data.username,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          bio: data.bio,
          level: data.level || 1,
          experience: data.experience || 0,
          skills: data.skills || [],
          interests: data.interests || [],
          socialLinks: data.social_links || {},
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          totalResources: data.total_resources || 0,
          totalBookmarks: data.total_bookmarks || 0,
          totalFollowers: data.total_followers || 0,
          totalFollowing: data.total_following || 0,
          totalContributions: data.total_contributions || 0,
        }
        
        setProfile(userProfile)
        addUserToCache(userProfile)
        checkFollowStatus(data.id)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      addToast({
        title: 'Error',
        description: 'Failed to load user profile',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkFollowStatus = async (userId: string) => {
    if (!user) return
    
    setIsFollowing(following.includes(userId))
  }

  const handleFollowToggle = async () => {
    if (!user || !profile) {
      addToast({
        title: 'Sign in required',
        description: 'Please sign in to follow users',
        type: 'warning',
      })
      return
    }

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)

        if (error) throw error

        unfollowUser(profile.id)
        setIsFollowing(false)
        
        addToast({
          title: 'Unfollowed',
          description: `You unfollowed @${profile.username}`,
          type: 'success',
        })
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          })

        if (error) throw error

        followUser(profile.id)
        setIsFollowing(true)
        
        addToast({
          title: 'Following',
          description: `You are now following @${profile.username}`,
          type: 'success',
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update follow status',
        type: 'error',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p className="text-muted-foreground">The user @{username} does not exist.</p>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  const getLevelInfo = (level: number) => {
    const levels = [
      { min: 1, max: 5, name: 'Beginner', color: 'bg-gray-500' },
      { min: 6, max: 15, name: 'Intermediate', color: 'bg-blue-500' },
      { min: 16, max: 30, name: 'Advanced', color: 'bg-purple-500' },
      { min: 31, max: 50, name: 'Expert', color: 'bg-orange-500' },
      { min: 51, max: 100, name: 'Master', color: 'bg-red-500' },
    ]
    
    return levels.find(l => level >= l.min && level <= l.max) || levels[0]
  }

  const levelInfo = getLevelInfo(profile.level)

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={profile.avatarUrl} alt={profile.username} />
              <AvatarFallback className="text-2xl">
                {profile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.fullName || profile.username}</h1>
                <Badge className={`${levelInfo.color} text-white`}>
                  Level {profile.level} - {levelInfo.name}
                </Badge>
              </div>
              
              {profile.username && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}
              
              {profile.bio && (
                <p className="text-lg mb-4">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Social Links */}
              {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                <div className="flex gap-3">
                  {profile.socialLinks.github && (
                    <a 
                      href={profile.socialLinks.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {profile.socialLinks.twitter && (
                    <a 
                      href={profile.socialLinks.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {profile.socialLinks.linkedin && (
                    <a 
                      href={profile.socialLinks.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {profile.socialLinks.website && (
                    <a 
                      href={profile.socialLinks.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {user && (
              <Button 
                onClick={handleFollowToggle}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.totalResources}</div>
            <p className="text-sm text-muted-foreground">Resources</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.totalBookmarks}</div>
            <p className="text-sm text-muted-foreground">Bookmarks</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.totalFollowers}</div>
            <p className="text-sm text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{profile.totalContributions}</div>
            <p className="text-sm text-muted-foreground">Contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                No resources shared yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                No recent activity
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
