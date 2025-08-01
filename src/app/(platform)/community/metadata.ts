import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo/config'

export const metadata: Metadata = generateSEO({
  title: 'AI 커뮤니티',
  description: 'AI 학습자들과 함께 질문하고, 답변하고, 지식을 공유하세요. 활발한 토론과 네트워킹의 장입니다.',
  keywords: ['AI 커뮤니티', 'AI 질문답변', 'AI 토론', '머신러닝 커뮤니티', '딥러닝 포럼'],
})
