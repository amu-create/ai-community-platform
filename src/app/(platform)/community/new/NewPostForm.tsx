'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { createPost } from '@/app/actions/community';
import { Loader2 } from 'lucide-react';

interface NewPostFormProps {
  categories: any[];
}

export default function NewPostForm({ categories }: NewPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const post = await createPost({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id || undefined,
        status: isDraft ? 'draft' : 'published',
      });

      toast({
        title: 'Success',
        description: isDraft ? 'Post saved as draft' : 'Post published successfully',
      });

      router.push(`/community/posts/${post.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title for your post"
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category (optional)" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts, questions, or insights..."
              className="mt-1 min-h-[300px]"
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              Markdown formatting is supported
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="draft"
              checked={isDraft}
              onCheckedChange={setIsDraft}
              disabled={isSubmitting}
            />
            <Label htmlFor="draft">Save as draft</Label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : isDraft ? (
            'Save Draft'
          ) : (
            'Publish Post'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
