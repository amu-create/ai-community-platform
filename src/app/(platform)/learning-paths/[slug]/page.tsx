import { notFound } from 'next/navigation';
import { getLearningPath } from '@/app/actions/learning';
import PathDetailContent from './PathDetailContent';
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    const path = await getLearningPath(params.slug);
    return {
      title: `${path.title} - Learning Path | AI Community Platform`,
      description: path.description || `Master ${path.title} with this structured learning path`,
    };
  } catch {
    return {
      title: 'Learning Path Not Found - AI Community Platform',
    };
  }
}

export default async function LearningPathPage({
  params,
}: {
  params: { slug: string };
}) {
  try {
    const path = await getLearningPath(params.slug);

    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <PathDetailContent path={path} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
