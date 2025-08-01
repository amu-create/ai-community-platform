import { notFound } from 'next/navigation';
import { getPost, getComments } from '@/app/actions/community';
import PostDetail from './PostDetail';
import CommentSection from './CommentSection';
import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  try {
    const post = await getPost(params.id);
    return {
      title: `${post.title} - AI Community Platform`,
      description: post.content.substring(0, 160),
    };
  } catch {
    return {
      title: 'Post Not Found - AI Community Platform',
    };
  }
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [post, comments] = await Promise.all([
      getPost(params.id),
      getComments(params.id),
    ]);

    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <PostDetail post={post} />
        <div id="comments" className="mt-8">
          <CommentSection 
            postId={params.id} 
            initialComments={comments}
            postAuthorId={post.author_id}
          />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
