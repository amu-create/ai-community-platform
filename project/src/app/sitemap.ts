export default function sitemap() {
  return [
    {
      url: 'https://ai-community-hub.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://ai-community-hub.vercel.app/resources',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://ai-community-hub.vercel.app/learning-paths',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://ai-community-hub.vercel.app/community',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.7,
    },
  ]
}