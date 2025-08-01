'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResourceForm } from '@/components/resources/ResourceForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { resourceService } from '@/services/resource.service';
import type { Resource } from '@/types/resource';

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResource();
  }, [params.id]);

  const loadResource = async () => {
    try {
      setIsLoading(true);
      const data = await resourceService.getResource(params.id as string);
      
      // 작성자 확인
      if (data.author_id !== user?.id) {
        toast({
          title: '권한 없음',
          description: '이 리소스를 수정할 권한이 없습니다.',
          variant: 'destructive'
        });
        router.push(`/resources/${params.id}`);
        return;
      }
      
      setResource(data);
    } catch (error) {
      toast({
        title: '오류',
        description: '리소스를 불러올 수 없습니다.',
        variant: 'destructive'
      });
      router.push('/resources');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!resource) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>
        
        <h1 className="text-3xl font-bold">리소스 수정</h1>
        <p className="text-muted-foreground mt-2">
          리소스 정보를 수정하세요.
        </p>
      </div>

      <ResourceForm 
        resource={resource}
        onSuccess={(updatedResource) => {
          router.push(`/resources/${updatedResource.id}`);
        }}
      />
    </div>
  );
}
