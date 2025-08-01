// SEO 설정
export const siteConfig = {
  name: 'AI Community Platform',
  description: 'Learn, share, and grow together in AI. Connect with fellow AI enthusiasts, share resources, and build your knowledge.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://ai-community.vercel.app',
  ogImage: '/og-image.png',
  author: {
    name: 'AI Community',
    twitter: '@AIcommunity',
  },
  keywords: [
    'AI learning',
    'Artificial Intelligence',
    'Machine Learning',
    'Deep Learning',
    'AI resources',
    'AI community',
    'AI tutorials',
    'AI courses',
    'AI development',
    'AI tools',
  ],
  creator: '@AIcommunity',
  twitterCard: 'summary_large_image',
}

// 동적 메타데이터 생성 함수
export function generateSEO({
  title,
  description,
  image,
  noIndex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  ...props
}: {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  [key: string]: any
}) {
  const siteTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const siteDescription = description || siteConfig.description
  const siteImage = image || siteConfig.ogImage
  const siteKeywords = keywords ? [...siteConfig.keywords, ...keywords] : siteConfig.keywords

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords.join(', '),
    authors: [{ name: author || siteConfig.author.name }],
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: 'website',
      siteName: siteConfig.name,
      url: siteConfig.url,
      images: [
        {
          url: siteImage.startsWith('http') ? siteImage : `${siteConfig.url}${siteImage}`,
          width: 1200,
          height: 630,
          alt: siteTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: siteConfig.twitterCard,
      title: siteTitle,
      description: siteDescription,
      images: [siteImage],
      creator: siteConfig.creator,
    },
    alternates: {
      canonical: siteConfig.url,
    },
    ...props,
  }
}

// JSON-LD 스키마 생성 함수
export function generateJsonLd(type: 'website' | 'article' | 'course' | 'person', data?: any) {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  switch (type) {
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data?.title,
        description: data?.description,
        author: {
          '@type': 'Person',
          name: data?.author || siteConfig.author.name,
        },
        datePublished: data?.publishedTime,
        dateModified: data?.modifiedTime || data?.publishedTime,
        image: data?.image,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data?.url || siteConfig.url,
        },
        publisher: {
          '@type': 'Organization',
          name: siteConfig.name,
          logo: {
            '@type': 'ImageObject',
            url: `${siteConfig.url}/logo.png`,
          },
        },
      }

    case 'course':
      return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: data?.title,
        description: data?.description,
        provider: {
          '@type': 'Organization',
          name: siteConfig.name,
          url: siteConfig.url,
        },
        educationalLevel: data?.level || 'Beginner',
        teaches: data?.topics || [],
        inLanguage: 'en',
        isAccessibleForFree: true,
      }

    case 'person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: data?.name,
        description: data?.bio,
        url: data?.profileUrl,
        memberOf: {
          '@type': 'Organization',
          name: siteConfig.name,
        },
        knowsAbout: data?.skills || [],
      }

    default:
      return baseSchema
  }
}
