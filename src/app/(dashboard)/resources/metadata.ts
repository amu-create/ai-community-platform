import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo/config'

export const metadata: Metadata = generateSEO({
  title: 'AI 학습 리소스',
  description: '최고의 AI 학습 자료를 찾아보세요. 아티클, 튜토리얼, 강좌, 도구 등 다양한 형태의 리소스를 수준별로 제공합니다.',
  keywords: ['AI 학습 자료', 'AI 튜토리얼', 'AI 강좌', '머신러닝 자료', '딥러닝 튜토리얼'],
})
