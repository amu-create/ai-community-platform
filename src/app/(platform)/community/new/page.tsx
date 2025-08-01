import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getCategories } from '@/app/actions/resources';
import NewPostForm from './NewPostForm';

export const metadata = {
  title: 'Create New Post - AI Community Platform',
  description: 'Share your thoughts and start a discussion in the community',
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/community/new');
  }

  const categories = await getCategories();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <NewPostForm categories={categories} />
    </div>
  );
}
