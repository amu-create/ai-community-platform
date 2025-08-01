import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FollowList } from '@/components/FollowList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface FollowersPageProps {
  params: Promise<{
    username: string
  }>
}

export async function generateMetadata({ params }: FollowersPageProps) {
  const resolvedParams = await params;
  const { username } = await params
  return {
    title: `@${username}의 팔로워 - AI Community`,
  }
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const resolvedParams = await params;
  const { username } = await params
  const supabase = createServerComponentClient({ cookies })
  
  // 사용자 정보 가져오기
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, followers_count')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link href={`/profile/${username}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로필로 돌아가기
          </Button>
        </Link>
        
        <h1 className="text-2xl font-bold">
          @{profile.username}의 팔로워
        </h1>
        <p className="text-muted-foreground">
          {profile.followers_count}명의 팔로워
        </p>
      </div>

      <FollowList userId={profile.id} type="followers" />
    </div>
  )
}