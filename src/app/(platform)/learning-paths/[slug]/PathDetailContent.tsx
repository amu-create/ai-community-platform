'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  GraduationCap,
  Clock,
  Users,
  Target,
  BookOpen,
  CheckCircle2,
  Circle,
  PlayCircle,
  Lock,
  Share2,
  Edit,
  ChevronRight,
  Trophy,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  enrollInLearningPath, 
  updateEnrollmentStatus,
  updateStepProgress 
} from '@/app/actions/learning';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import type { LearningPath, LearningPathStep } from '@/types/learning';
import { useAuth } from '@/hooks/useAuth';

interface PathDetailContentProps {
  path: LearningPath;
}

const difficultyConfig = {
  beginner: { color: 'text-green-600 bg-green-100', label: 'Beginner', icon: '🌱' },
  intermediate: { color: 'text-yellow-600 bg-yellow-100', label: 'Intermediate', icon: '🚀' },
  advanced: { color: 'text-red-600 bg-red-100', label: 'Advanced', icon: '🔥' },
};

export default function PathDetailContent({ path: initialPath }: PathDetailContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [path, setPath] = useState(initialPath);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showDropDialog, setShowDropDialog] = useState(false);
  const [isDroppingCourse, setIsDroppingCourse] = useState(false);

  const isAuthor = user?.id === path.author_id;
  const isEnrolled = !!path.user_enrollment;
  const difficulty = path.difficulty_level ? difficultyConfig[path.difficulty_level] : null;
  
  // Calculate progress
  const totalSteps = path.steps?.length || 0;
  const completedSteps = path.steps?.filter(
    step => step.user_progress?.completed_at
  ).length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in this learning path',
        variant: 'destructive',
      });
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsEnrolling(true);
    try {
      const enrollment = await enrollInLearningPath(path.id);
      setPath({
        ...path,
        user_enrollment: enrollment,
        enrollment_count: path.enrollment_count + 1,
      });
      
      toast({
        title: 'Success!',
        description: 'You have enrolled in this learning path',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enroll. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDropCourse = async () => {
    if (!path.user_enrollment) return;

    setIsDroppingCourse(true);
    try {
      await updateEnrollmentStatus(path.user_enrollment.id, 'dropped');
      setPath({
        ...path,
        user_enrollment: undefined,
        enrollment_count: Math.max(0, path.enrollment_count - 1),
      });
      
      toast({
        title: 'Course Dropped',
        description: 'You have left this learning path',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to drop course. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDroppingCourse(false);
      setShowDropDialog(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: path.title,
        text: path.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Learning path link copied to clipboard',
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {path.category && (
                <Badge
                  variant="secondary"
                  style={{ 
                    backgroundColor: `${path.category.color}20`,
                    color: path.category.color,
                  }}
                >
                  {path.category.name}
                </Badge>
              )}
              
              {difficulty && (
                <Badge className={cn("text-sm", difficulty.color)}>
                  {difficulty.icon} {difficulty.label}
                </Badge>
              )}
              
              {path.is_featured && (
                <Badge variant="default" className="bg-yellow-500">
                  ⭐ Featured
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{path.title}</h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {path.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link 
                href={`/profile/${path.author?.username}`}
                className="flex items-center gap-2 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <img 
                  src={path.author?.avatar_url || '/default-avatar.png'} 
                  alt={path.author?.username}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="block font-medium text-gray-900 dark:text-white">
                    {path.author?.username}
                  </span>
                  <span className="text-xs">Author</span>
                </div>
              </Link>

              {path.estimated_hours && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{path.estimated_hours} hours</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{path.enrollment_count} enrolled</span>
              </div>

              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{path.completion_count} completed</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{totalSteps} lessons</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {isAuthor && (
              <Link href={`/learning-paths/${path.slug}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Enrollment Status & Actions */}
        {isEnrolled ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Your Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {completedSteps} of {totalSteps} lessons completed
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              
              {progress === 100 && (
                <div className="flex items-center gap-2 mt-3 text-green-600">
                  <Trophy className="w-5 h-5" />
                  <span className="font-medium">Congratulations! You've completed this path!</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1">
                <PlayCircle className="w-5 h-5 mr-2" />
                Continue Learning
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowDropDialog(true)}
              >
                Drop Course
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            size="lg" 
            onClick={handleEnroll}
            disabled={isEnrolling}
            className="w-full sm:w-auto"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <GraduationCap className="w-5 h-5 mr-2" />
                Enroll in this Path
              </>
            )}
          </Button>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Course Curriculum</h2>
          
          {path.steps && path.steps.length > 0 ? (
            <div className="space-y-4">
              {path.steps.map((step, index) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  index={index}
                  isEnrolled={isEnrolled}
                  enrollmentId={path.user_enrollment?.id}
                  onProgressUpdate={() => {
                    // Refresh the page to update progress
                    router.refresh();
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No lessons added yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
            
            {path.outcomes && path.outcomes.length > 0 ? (
              <ul className="space-y-3">
                {path.outcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Learning outcomes not specified</p>
            )}
          </div>

          {path.prerequisites && path.prerequisites.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
              <ul className="space-y-3">
                {path.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <span>{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm text-center">
            <p className="text-gray-500">Reviews coming soon</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drop Course Dialog */}
      <AlertDialog open={showDropDialog} onOpenChange={setShowDropDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Drop This Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to drop this learning path? Your progress will be saved and you can re-enroll anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDropCourse}
              disabled={isDroppingCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDroppingCourse ? 'Dropping...' : 'Drop Course'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface StepCardProps {
  step: LearningPathStep;
  index: number;
  isEnrolled: boolean;
  enrollmentId?: string;
  onProgressUpdate: () => void;
}

function StepCard({ 
  step, 
  index, 
  isEnrolled, 
  enrollmentId,
  onProgressUpdate 
}: StepCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const isCompleted = !!step.user_progress?.completed_at;
  const isLocked = !isEnrolled;

  const handleToggleComplete = async () => {
    if (!isEnrolled || !enrollmentId) return;

    setIsUpdating(true);
    try {
      await updateStepProgress(step.id, enrollmentId, {
        completed: !isCompleted,
      });
      
      toast({
        title: isCompleted ? 'Marked as incomplete' : 'Marked as complete',
        description: isCompleted 
          ? 'You can revisit this lesson anytime'
          : 'Great job! Keep up the good work!',
      });
      
      onProgressUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={cn(
      "p-6 transition-all",
      isLocked && "opacity-60",
      isCompleted && "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
    )}>
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          disabled={isLocked || isUpdating}
          className={cn(
            "mt-1 transition-colors",
            isLocked && "cursor-not-allowed",
            !isLocked && "hover:text-primary"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold mb-1">
                {index + 1}. {step.title}
              </h3>
              
              {step.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {step.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {step.estimated_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.estimated_minutes} min
                  </span>
                )}
                
                {step.resource?.type && (
                  <Badge variant="secondary" className="text-xs">
                    {step.resource.type}
                  </Badge>
                )}
                
                {!step.is_required && (
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>
            </div>

            {step.resource?.url && !isLocked && (
              <Link 
                href={step.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4"
              >
                <Button size="sm" variant="ghost">
                  Open
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {isCompleted && step.user_progress && (
            <div className="mt-3 text-xs text-gray-500">
              Completed {formatDistanceToNow(new Date(step.user_progress.completed_at), { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
