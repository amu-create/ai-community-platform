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
import { createLearningPath } from '@/app/actions/learning';
import { Loader2, Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatePathFormProps {
  categories: any[];
}

export default function CreatePathForm({ categories }: CreatePathFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    difficulty_level: '',
    estimated_hours: '',
    category_id: '',
    prerequisites: [''],
    outcomes: [''],
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const addItem = (field: 'prerequisites' | 'outcomes') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const removeItem = (field: 'prerequisites' | 'outcomes', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const updateItem = (field: 'prerequisites' | 'outcomes', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({
      ...formData,
      [field]: updated,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const path = await createLearningPath({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        slug: formData.slug.trim(),
        difficulty_level: formData.difficulty_level as any || undefined,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
        category_id: formData.category_id || undefined,
        prerequisites: formData.prerequisites.filter(p => p.trim()),
        outcomes: formData.outcomes.filter(o => o.trim()),
        status: isDraft ? 'draft' : 'published',
      });

      toast({
        title: 'Success',
        description: isDraft ? 'Learning path saved as draft' : 'Learning path published successfully',
      });

      router.push(`/learning-paths/${path.slug}/edit?tab=steps`);
    } catch (error) {
      console.error('Error creating learning path:', error);
      toast({
        title: 'Error',
        description: 'Failed to create learning path. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., Complete Machine Learning Roadmap"
            className="mt-1"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="slug">URL Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="complete-machine-learning-roadmap"
            className="mt-1"
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500 mt-1">
            This will be used in the URL: /learning-paths/{formData.slug || 'your-slug'}
          </p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what learners will achieve by following this path..."
            className="mt-1"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🌱 Beginner</SelectItem>
                <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                <SelectItem value="advanced">🔥 Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hours">Estimated Hours</Label>
            <Input
              id="hours"
              type="number"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
              placeholder="e.g., 40"
              className="mt-1"
              min="1"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Prerequisites</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('prerequisites')}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.prerequisites.map((prereq, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <Input
                value={prereq}
                onChange={(e) => updateItem('prerequisites', index, e.target.value)}
                placeholder="e.g., Basic Python programming knowledge"
                disabled={isSubmitting}
              />
              {formData.prerequisites.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem('prerequisites', index)}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Learning Outcomes</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addItem('outcomes')}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.outcomes.map((outcome, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <Input
                value={outcome}
                onChange={(e) => updateItem('outcomes', index, e.target.value)}
                placeholder="e.g., Build and deploy machine learning models"
                disabled={isSubmitting}
              />
              {formData.outcomes.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem('outcomes', index)}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Publish Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Publish Settings</h2>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="draft"
            checked={isDraft}
            onCheckedChange={setIsDraft}
            disabled={isSubmitting}
          />
          <Label htmlFor="draft">Save as draft</Label>
        </div>
        
        <p className="text-sm text-gray-500">
          {isDraft 
            ? 'Your learning path will be saved but not visible to others until you publish it.' 
            : 'Your learning path will be immediately visible to everyone.'}
        </p>
      </div>

      {/* Submit Buttons */}
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
            'Create & Add Steps'
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
