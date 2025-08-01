'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResourceForm } from '@/components/resources/ResourceForm';
import { useAuth } from '@/contexts/AuthContext';

export default function NewResourcePage() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    router.push('/auth/login?redirect=/resources/new');
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
        
        <h1 className="text-3xl font-bold">새 리소스 추가</h1>
        <p className="text-muted-foreground mt-2">
          AI 학습에 도움이 되는 유용한 리소스를 공유해주세요.
        </p>
      </div>

      <ResourceForm />
    </div>
  );
}
