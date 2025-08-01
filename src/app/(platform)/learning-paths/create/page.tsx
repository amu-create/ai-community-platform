import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCategories } from '@/app/actions/resources';
import CreatePathForm from './CreatePathForm';

export const metadata = {
  title: 'Create Learning Path - AI Community Platform',
  description: 'Design a structured learning path to help others master AI skills',
};

export default async function CreateLearningPathPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/learning-paths/create');
  }

  const categories = await getCategories();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create Learning Path</h1>
      <CreatePathForm categories={categories} />
    </div>
  );
}
