'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GraduationCap, 
  Clock, 
  Users,
  Star,
  Plus,
  Filter,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import type { LearningPath } from '@/types/learning';
import { cn } from '@/lib/utils';

interface LearningPathsContentProps {
  initialPaths: LearningPath[];
  categories: any[];
  searchParams: {
    category?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

const difficultyConfig = {
  beginner: { color: 'text-green-600 bg-green-100', label: 'Beginner' },
  intermediate: { color: 'text-yellow-600 bg-yellow-100', label: 'Intermediate' },
  advanced: { color: 'text-red-600 bg-red-100', label: 'Advanced' },
};

export default function LearningPathsContent({
  initialPaths,
  categories,
  searchParams,
}: LearningPathsContentProps) {
  const router = useRouter();
  const [paths] = useState(initialPaths);

  const handleFilterChange = (type: 'category' | 'difficulty', value: string) => {
    const params = new URLSearchParams();
    
    if (type === 'category' && value !== 'all') {
      params.set('category', value);
    }
    if (type === 'difficulty' && value !== 'all') {
      params.set('difficulty', value);
    }
    
    // Preserve other filter
    if (type === 'category' && searchParams.difficulty) {
      params.set('difficulty', searchParams.difficulty);
    }
    if (type === 'difficulty' && searchParams.category) {
      params.set('category', searchParams.category);
    }
    
    router.push(`/learning-paths?${params.toString()}`);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
        </div>
        
        <Select
          value={searchParams.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.difficulty || 'all'}
          onValueChange={(value) => handleFilterChange('difficulty', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Link href="/learning-paths/create" className="ml-auto">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Path
          </Button>
        </Link>
      </div>

      {/* Featured Paths */}
      {paths.some(p => p.is_featured) && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Paths
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {paths.filter(p => p.is_featured).map((path) => (
              <FeaturedPathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      )}

      {/* All Paths */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          {searchParams.category || searchParams.difficulty ? 'Filtered' : 'All'} Learning Paths
        </h2>
        
        {paths.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No learning paths found matching your criteria.
            </p>
            <Link href="/learning-paths/create">
              <Button>Create the First Path</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.filter(p => !p.is_featured).map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  const difficulty = path.difficulty_level ? difficultyConfig[path.difficulty_level] : null;
  const completionRate = path.enrollment_count > 0 
    ? Math.round((path.completion_count / path.enrollment_count) * 100)
    : 0;

  return (
    <Link 
      href={`/learning-paths/${path.slug}`}
      className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="mb-4">
        {path.category && (
          <Badge
            variant="secondary"
            className="mb-2"
            style={{ 
              backgroundColor: `${path.category.color}20`,
              color: path.category.color,
            }}
          >
            {path.category.name}
          </Badge>
        )}
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {path.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
          {path.description}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {difficulty && (
            <Badge className={cn("text-xs", difficulty.color)}>
              {difficulty.label}
            </Badge>
          )}
          
          {path.estimated_hours && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{path.estimated_hours}h</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{path.enrollment_count}</span>
          </div>
        </div>

        {path.user_enrollment ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{Math.round(path.user_enrollment.progress)}%</span>
            </div>
            <Progress value={path.user_enrollment.progress} className="h-2" />
            
            <Button variant="outline" size="sm" className="w-full mt-2">
              Continue Learning
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            Start Learning
          </Button>
        )}
      </div>

      {completionRate > 0 && (
        <div className="mt-3 pt-3 border-t dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Target className="w-3 h-3" />
            <span>{completionRate}% completion rate</span>
          </div>
        </div>
      )}
    </Link>
  );
}

function FeaturedPathCard({ path }: { path: LearningPath }) {
  const difficulty = path.difficulty_level ? difficultyConfig[path.difficulty_level] : null;

  return (
    <Link 
      href={`/learning-paths/${path.slug}`}
      className="block bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-primary/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-primary">Featured</span>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">
            {path.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {path.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {difficulty && (
          <Badge className={cn("text-xs", difficulty.color)}>
            {difficulty.label}
          </Badge>
        )}
        
        {path.estimated_hours && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{path.estimated_hours} hours</span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{path.enrollment_count} enrolled</span>
        </div>
        
        {path.rating && (
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{path.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <img 
          src={path.author?.avatar_url || '/default-avatar.png'} 
          alt={path.author?.username}
          className="w-8 h-8 rounded-full"
        />
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">by </span>
          <span className="font-medium">{path.author?.username}</span>
        </div>
      </div>

      {path.user_enrollment ? (
        <div className="mt-4 space-y-2">
          <Progress value={path.user_enrollment.progress} className="h-2" />
          <Button className="w-full">
            Continue Learning ({Math.round(path.user_enrollment.progress)}%)
          </Button>
        </div>
      ) : (
        <Button className="w-full mt-4">
          <BookOpen className="w-4 h-4 mr-2" />
          Start This Path
        </Button>
      )}
    </Link>
  );
}
