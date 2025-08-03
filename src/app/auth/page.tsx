import { AuthForm } from '@/components/auth/auth-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 | AI Community Platform',
  description: 'AI 학습 커뮤니티에 로그인하거나 회원가입하세요.',
}

export default function AuthPage() {
  return <AuthForm />
}
