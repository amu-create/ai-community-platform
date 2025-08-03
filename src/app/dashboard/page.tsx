import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { SiteHeader } from '@/components/layout/site-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '대시보드 | AI Community Platform',
  description: '학습 진행 상황과 커뮤니티 활동을 확인하세요.',
}

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader user={user} />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DashboardContent />
      </main>
    </div>
  )
}
