import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, bio')
    .eq('username', params.username)
    .single()

  if (!profile) {
    return {
      title: '프로필을 찾을 수 없습니다',
    }
  }

  return {
    title: `@${profile.username} - AI Community`,
    description: profile.bio || `${profile.username}님의 프로필`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // 프로필 정보 가져오기
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      bio,
      website,
      location,
      followers_count,
      following_count,
      created_at
    `)
    .eq('username', params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // 현재 로그인한 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // 팔로우 상태 확인
  let isFollowing = false
  if (user && !isOwnProfile) {
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()
    
    isFollowing = !!data
  }

  // 게시물 수 가져오기
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', profile.id)

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        postsCount={postsCount || 0}
      />
      <ProfileTabs
        userId={profile.id}
        username={profile.username}
      />
    </div>
  )
}