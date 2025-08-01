import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { FollowList } from '@/components/FollowList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface FollowingPageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: FollowingPageProps) {
  return {
    title: `@${params.username}의 팔로잉 - AI Community`,
  }
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // 사용자 정보 가져오기
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, following_count')
    .eq('username', params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link href={`/profile/${params.username}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로필로 돌아가기
          </Button>
        </Link>
        
        <h1 className="text-2xl font-bold">
          @{profile.username}의 팔로잉
        </h1>
        <p className="text-muted-foreground">
          {profile.following_count}명을 팔로우 중
        </p>
      </div>

      <FollowList userId={profile.id} type="following" />
    </div>
  )
}