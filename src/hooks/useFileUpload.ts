'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/use-toast';

interface UploadOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  bucket?: string;
}

export function useFileUpload(roomId: string, options?: UploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClientComponentClient();
  const user = useAuthStore((state) => state.user);

  const defaultOptions: UploadOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    bucket: 'chat-files',
    ...options,
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!user) {
      toast({
        title: '업로드 실패',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      });
      return null;
    }

    // 파일 크기 검증
    if (file.size > defaultOptions.maxSize!) {
      toast({
        title: '파일 크기 초과',
        description: `파일 크기는 ${defaultOptions.maxSize! / 1024 / 1024}MB를 초과할 수 없습니다.`,
        variant: 'destructive',
      });
      return null;
    }

    // 파일 타입 검증
    if (!defaultOptions.allowedTypes!.includes(file.type)) {
      toast({
        title: '지원하지 않는 파일 형식',
        description: '이미지(JPG, PNG, GIF, WebP) 또는 PDF 파일만 업로드할 수 있습니다.',
        variant: 'destructive',
      });
      return null;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 파일명 생성 (timestamp + user_id + original_name)
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomId}/${user.id}/${timestamp}.${fileExt}`;

      // Supabase Storage에 파일 업로드
      const { data, error } = await supabase.storage
        .from(defaultOptions.bucket!)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          // 진행률 추적
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setProgress(Math.round(percentage));
          },
        });

      if (error) throw error;

      // 공개 URL 가져오기
      const { data: publicUrl } = supabase.storage
        .from(defaultOptions.bucket!)
        .getPublicUrl(data.path);

      // 파일 메타데이터
      const fileMetadata = {
        url: publicUrl.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        path: data.path,
      };

      toast({
        title: '업로드 완료',
        description: '파일이 성공적으로 업로드되었습니다.',
      });

      return fileMetadata;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      toast({
        title: '업로드 실패',
        description: '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user, roomId, supabase, defaultOptions]);

  const deleteFile = useCallback(async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from(defaultOptions.bucket!)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: '파일 삭제 완료',
        description: '파일이 성공적으로 삭제되었습니다.',
      });

      return true;
    } catch (error) {
      console.error('파일 삭제 실패:', error);
      toast({
        title: '삭제 실패',
        description: '파일 삭제 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      return false;
    }
  }, [supabase, defaultOptions]);

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  };
}
