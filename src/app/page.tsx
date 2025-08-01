import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowRight, Brain, Code, Users, Zap, BookOpen, Trophy } from 'lucide-react'
import { generateJsonLd } from '@/lib/seo/config'
import { JsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function Home() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const jsonLd = generateJsonLd('website')

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">AI Community</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth">
              <Button>로그인</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              AI 학습의 모든 것을 한 곳에서
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              최신 AI 기술을 배우고, 지식을 공유하며, 함께 성장하는 커뮤니티입니다.
              초보자부터 전문가까지 모두를 위한 맞춤형 학습 경로를 제공합니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth">
                <Button size="lg" className="group">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="ghost" size="lg">
                  리소스 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">더 빠른 학습</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            AI 학습에 필요한 모든 기능
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            체계적인 학습 경로부터 실시간 커뮤니티 지원까지, 
            효과적인 AI 학습을 위한 완벽한 환경을 제공합니다.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                큐레이션된 학습 리소스
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                전문가가 선별한 최고 품질의 학습 자료를 한 곳에서 만나보세요. 
                아티클, 비디오, 강좌, 도구까지 모든 형태의 리소스를 제공합니다.
              </dd>
            </div>
            
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Users className="h-6 w-6 text-white" />
                </div>
                활발한 커뮤니티
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                질문하고, 답변하고, 지식을 공유하세요. 
                같은 목표를 가진 사람들과 함께 성장할 수 있습니다.
              </dd>
            </div>
            
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Code className="h-6 w-6 text-white" />
                </div>
                맞춤형 학습 경로
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                초급부터 고급까지, 당신의 수준에 맞는 체계적인 학습 경로를 제공합니다. 
                단계별로 실력을 향상시켜보세요.
              </dd>
            </div>
            
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                성취도 추적
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                학습 진행 상황을 시각화하고, 목표를 설정하며, 
                성취감을 느낄 수 있는 레벨 시스템을 제공합니다.
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 dark:bg-primary/10">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              무료로 가입하고 AI 학습 여정을 시작하세요. 
              신용카드 없이 모든 기능을 체험할 수 있습니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/auth">
                <Button size="lg">
                  무료 가입하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/about" className="text-gray-400 hover:text-gray-500">
            소개
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-500">
            이용약관
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-gray-500">
            개인정보처리방침
          </Link>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2025 AI Community Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}
