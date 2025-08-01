'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  BookOpen, 
  Users, 
  Heart,
  Edit,
  Settings
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { profile, isLoadingProfile } = useUserStore()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (isLoadingProfile || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
  const experienceToNextLevel = (profile.level * 100) - profile.experience
  const experienceProgress = (profile.experience / (profile.level * 100)) * 100

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
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/profile/edit')}>
                <Edit className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Experience Progress</span>
              <span className="text-sm text-muted-foreground">
                {profile.experience} / {profile.level * 100} XP
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className={`${levelInfo.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${experienceProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {experienceToNextLevel} XP to level {profile.level + 1}
            </p>
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
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
        
        <TabsContent value="bookmarks" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                No bookmarks yet
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
