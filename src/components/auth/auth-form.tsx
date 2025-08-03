'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Mail, Lock, User, Github, Chrome, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        // 회원가입
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (error) throw error

        toast({
          title: '회원가입 성공!',
          description: '이메일을 확인해주세요.',
        })
      } else {
        // 로그인
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: '로그인 성공!',
          description: '대시보드로 이동합니다.',
        })
        
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: '오류 발생',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: '오류 발생',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-300 opacity-10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Community
              </span>
            </Link>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? '회원가입' : '로그인'}
          </h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
            {isSignUp
              ? 'AI 학습 커뮤니티에 참여하세요'
              : '다시 만나서 반갑습니다!'}
          </p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-5 w-5" />
              GitHub으로 {isSignUp ? '가입' : '로그인'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Google로 {isSignUp ? '가입' : '로그인'}
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">또는</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="name" className="text-sm font-medium">
                  이름
                </Label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="홍길동"
                    required={isSignUp}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSignUp ? '가입하기' : '로그인'}
            </Button>
          </form>

          {/* Toggle auth mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              {isSignUp
                ? '이미 계정이 있으신가요? 로그인'
                : '처음이신가요? 회원가입'}
            </button>
          </div>

          {/* Terms */}
          {isSignUp && (
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              가입하면{' '}
              <Link href="/terms" className="text-purple-600 hover:underline dark:text-purple-400">
                이용약관
              </Link>
              {' '}및{' '}
              <Link href="/privacy" className="text-purple-600 hover:underline dark:text-purple-400">
                개인정보처리방침
              </Link>
              에 동의하게 됩니다.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
