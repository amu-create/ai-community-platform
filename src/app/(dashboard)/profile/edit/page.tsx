'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { 
  Camera, 
  X, 
  Plus,
  Github,
  Twitter,
  Linkedin,
  Globe
} from 'lucide-react'

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).max(10, 'Maximum 10 skills allowed'),
  interests: z.array(z.string()).max(10, 'Maximum 10 interests allowed'),
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { profile, updateProfile } = useUserStore()
  const { addToast } = useUIStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      fullName: profile?.fullName || '',
      bio: profile?.bio || '',
      skills: profile?.skills || [],
      interests: profile?.interests || [],
      socialLinks: {
        github: profile?.socialLinks?.github || '',
        twitter: profile?.socialLinks?.twitter || '',
        linkedin: profile?.socialLinks?.linkedin || '',
        website: profile?.socialLinks?.website || '',
      },
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        skills: profile.skills || [],
        interests: profile.interests || [],
        socialLinks: {
          github: profile.socialLinks?.github || '',
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          website: profile.socialLinks?.website || '',
        },
      })
    }
  }, [profile, form])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null

    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsLoading(true)
    try {
      let avatarUrl = profile?.avatarUrl

      // Upload avatar if changed
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar()
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.fullName,
          bio: data.bio,
          avatar_url: avatarUrl,
          skills: data.skills,
          interests: data.interests,
          social_links: data.socialLinks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local store
      updateProfile({
        username: data.username,
        fullName: data.fullName,
        bio: data.bio,
        avatarUrl,
        skills: data.skills,
        interests: data.interests,
        socialLinks: data.socialLinks,
      })

      addToast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
        type: 'success',
      })

      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      addToast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && form.getValues('skills').length < 10) {
      form.setValue('skills', [...form.getValues('skills'), newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    const skills = form.getValues('skills')
    form.setValue('skills', skills.filter((_, i) => i !== index))
  }

  const addInterest = () => {
    if (newInterest.trim() && form.getValues('interests').length < 10) {
      form.setValue('interests', [...form.getValues('interests'), newInterest.trim()])
      setNewInterest('')
    }
  }

  const removeInterest = (index: number) => {
    const interests = form.getValues('interests')
    form.setValue('interests', interests.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={previewUrl || profile?.avatarUrl} 
                    alt={profile?.username} 
                  />
                  <AvatarFallback>
                    {profile?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                      <Camera className="h-4 w-4" />
                      Change avatar
                    </div>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={4}
                          placeholder="Tell us about yourself..."
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description for your profile. Max 500 characters.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill()
                      }
                    }}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('skills').map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest()
                      }
                    }}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch('interests').map((interest, index) => (
                    <Badge key={index} variant="outline">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label>Social Links</Label>
                
                <FormField
                  control={form.control}
                  name="socialLinks.github"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Github className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input {...field} placeholder="https://github.com/username" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input {...field} placeholder="https://twitter.com/username" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input {...field} placeholder="https://linkedin.com/in/username" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.website"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input {...field} placeholder="https://example.com" />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/profile')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
