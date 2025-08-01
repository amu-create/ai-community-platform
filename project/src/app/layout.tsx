import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Community Hub - AI 학습자를 위한 종합 커뮤니티',
  description: 'AI 활용법을 배우고 공유하는 커뮤니티 플랫폼. 초보자부터 전문가까지 함께 성장하세요.',
  keywords: 'AI, 인공지능, 머신러닝, ChatGPT, 프롬프트, AI 도구, AI 학습',
  authors: [{ name: 'AI Community Hub' }],
  openGraph: {
    title: 'AI Community Hub',
    description: 'AI 활용법을 배우고 공유하는 커뮤니티 플랫폼',
    url: 'https://ai-community-hub.vercel.app',
    siteName: 'AI Community Hub',
    images: [
      {
        url: 'https://ai-community-hub.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Community Hub',
    description: 'AI 활용법을 배우고 공유하는 커뮤니티 플랫폼',
    images: ['https://ai-community-hub.vercel.app/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}