import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-community.vercel.app'

  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learning-paths`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/explore/users`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // 동적 페이지들 - 리소스
  const { data: resources } = await supabase
    .from('resources')
    .select('id, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(1000)

  const resourcePages: MetadataRoute.Sitemap = resources?.map((resource) => ({
    url: `${baseUrl}/resources/${resource.id}`,
    lastModified: new Date(resource.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) || []

  // 동적 페이지들 - 커뮤니티 포스트
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1000)

  const postPages: MetadataRoute.Sitemap = posts?.map((post) => ({
    url: `${baseUrl}/community/posts/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  })) || []

  // 동적 페이지들 - 학습 경로
  const { data: paths } = await supabase
    .from('learning_paths')
    .select('id, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(500)

  const pathPages: MetadataRoute.Sitemap = paths?.map((path) => ({
    url: `${baseUrl}/learning-paths/${path.id}`,
    lastModified: new Date(path.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) || []

  // 동적 페이지들 - 사용자 프로필
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, updated_at')
    .order('points', { ascending: false })
    .limit(500)

  const profilePages: MetadataRoute.Sitemap = profiles?.map((profile) => ({
    url: `${baseUrl}/profile/${profile.id}`,
    lastModified: new Date(profile.updated_at),
    changeFrequency: 'weekly',
    priority: 0.5,
  })) || []

  return [...staticPages, ...resourcePages, ...postPages, ...pathPages, ...profilePages]
}
