import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateSEO, generateJsonLd } from '@/lib/seo/config'
import { JsonLd } from '@/components/seo/JsonLd'
import ResourceDetailClient from './ResourceDetailClient'

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  
  const { data: resource } = await supabase
    .from('resources')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url),
      categories:resource_categories(category:categories(*)),
      tags:resource_tags(tag:tags(*))
    `)
    .eq('id', params.id)
    .single()

  if (!resource) {
    return generateSEO({ title: '리소스를 찾을 수 없습니다' })
  }

  const keywords = [
    ...(resource.categories?.map((c: any) => c.category.name) || []),
    ...(resource.tags?.map((t: any) => t.tag.name) || []),
    resource.type,
    resource.level,
  ]

  return generateSEO({
    title: resource.title,
    description: resource.description || `${resource.author?.full_name || resource.author?.username}님이 공유한 ${resource.type} 리소스입니다.`,
    keywords,
    author: resource.author?.full_name || resource.author?.username,
    publishedTime: resource.created_at,
    modifiedTime: resource.updated_at,
  })
}

export default async function ResourceDetailPage({ params }: Props) {
  const supabase = createClient()
  
  const { data: resource } = await supabase
    .from('resources')
    .select(`
      *,
      author:profiles(username, full_name, avatar_url)
    `)
    .eq('id', params.id)
    .single()

  if (!resource) {
    notFound()
  }

  const jsonLd = generateJsonLd('article', {
    title: resource.title,
    description: resource.description,
    author: resource.author?.full_name || resource.author?.username,
    publishedTime: resource.created_at,
    modifiedTime: resource.updated_at,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/resources/${resource.id}`,
    image: resource.image_url,
  })

  return (
    <>
      <JsonLd data={jsonLd} />
      <ResourceDetailClient resourceId={params.id} />
    </>
  )
}
