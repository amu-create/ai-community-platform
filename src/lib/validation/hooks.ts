'use client';

import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { useCallback, useEffect, useState } from 'react';
import { sanitize, validate } from './sanitize';
import { ZodError } from 'zod';
import { validateFile as validateFileUtil } from './middleware';

// 검증된 폼 훅 옵션
interface UseValidatedFormOptions<T extends FieldValues> extends UseFormProps<T> {
  schema: ZodSchema<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (error: any) => void;
  sanitizeFields?: {
    html?: (keyof T)[];
    strict?: (keyof T)[];
    url?: (keyof T)[];
  };
}

// 검증된 폼 훅
export function useValidatedForm<T extends FieldValues>({
  schema,
  onSuccess,
  onError,
  sanitizeFields = {},
  ...formOptions
}: UseValidatedFormOptions<T>): any {
  const form = useForm<T>({
    ...formOptions,
    // @ts-ignore - Zod type compatibility issue with react-hook-form
    resolver: zodResolver(schema),
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  // 폼 제출 핸들러
  const submitHandler = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault();
      
      try {
        await handleSubmit(async (data) => {
          // 필드 살균
          const sanitizedData = { ...data };
          
          // HTML 필드 살균
          sanitizeFields.html?.forEach((field) => {
            if (typeof (sanitizedData as any)[field] === 'string') {
              (sanitizedData as any)[field] = sanitize.html((sanitizedData as any)[field] as string);
            }
          });
          
          // 엄격한 필드 살균
          sanitizeFields.strict?.forEach((field) => {
            if (typeof (sanitizedData as any)[field] === 'string') {
              (sanitizedData as any)[field] = sanitize.strict((sanitizedData as any)[field] as string);
            }
          });
          
          // URL 필드 살균
          sanitizeFields.url?.forEach((field) => {
            if (typeof (sanitizedData as any)[field] === 'string') {
              (sanitizedData as any)[field] = sanitize.url((sanitizedData as any)[field] as string);
            }
          });
          
          // 성공 콜백 실행
          if (onSuccess) {
            await onSuccess(sanitizedData as unknown as T);
          }
        })(e);
      } catch (error) {
        if (onError) {
          onError(error);
        }
        console.error('Form submission error:', error);
      }
    },
    [handleSubmit, onSuccess, onError, sanitizeFields]
  );

  return {
    ...form,
    submitHandler,
    isSubmitting,
  };
}

// 디바운스된 입력 훅
export function useDebouncedInput(
  value: string,
  delay: number = 500,
  onDebounce?: (value: string) => void
): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      if (onDebounce) {
        onDebounce(value);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, onDebounce]);

  return debouncedValue;
}

// 실시간 검증 훅
export function useRealtimeValidation<T>(
  value: T,
  schema: ZodSchema<T>
): {
  isValid: boolean;
  errors: string[];
} {
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    try {
      schema.parse(value);
      setIsValid(true);
      setErrors([]);
    } catch (error) {
      setIsValid(false);
      if (error instanceof ZodError) {
        setErrors((error as any).errors.map((e: any) => e.message));
      }
    }
  }, [value, schema]);

  return { isValid, errors };
}

// 비밀번호 강도 측정 훅
export function usePasswordStrength(password: string): {
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  color: string;
} {
  const [strength, setStrength] = useState<{
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
    color: string;
  }>({
    score: 0,
    strength: 'weak',
    feedback: [],
    color: '#ef4444',
  });

  useEffect(() => {
    const result = validate.passwordStrength(password);
    
    let strengthLabel: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = '#ef4444'; // red
    
    if (result.score >= 5) {
      strengthLabel = 'strong';
      color = '#10b981'; // green
    } else if (result.score >= 4) {
      strengthLabel = 'good';
      color = '#3b82f6'; // blue
    } else if (result.score >= 3) {
      strengthLabel = 'fair';
      color = '#f59e0b'; // yellow
    }
    
    setStrength({
      score: result.score,
      strength: strengthLabel,
      feedback: result.feedback,
      color,
    });
  }, [password]);

  return strength;
}

// 파일 검증 훅
export function useFileValidation(
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): {
  validateFile: (file: File) => Promise<boolean>;
  validateFiles: (files: FileList | File[]) => Promise<File[]>;
  errors: string[];
  clearErrors: () => void;
} {
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = useCallback(
    async (file: File): Promise<boolean> => {
      const result = await validateFileUtil(file, options);
      if (!result.success) {
        setErrors((prev) => [...prev, (result as any).error]);
        return false;
      }
      return true;
    },
    [options]
  );

  const validateFiles = useCallback(
    async (files: FileList | File[]): Promise<File[]> => {
      const fileArray = Array.from(files);
      
      if (options.maxFiles && fileArray.length > options.maxFiles) {
        setErrors([`최대 ${options.maxFiles}개의 파일만 업로드 가능합니다`]);
        return [];
      }
      
      const validFiles: File[] = [];
      const newErrors: string[] = [];
      
      for (const file of fileArray) {
        const result = await validateFileUtil(file, options);
        if (result.success) {
          validFiles.push(file);
        } else {
          newErrors.push(`${file.name}: ${(result as any).error}`);
        }
      }
      
      setErrors(newErrors);
      return validFiles;
    },
    [options]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return { validateFile, validateFiles, errors, clearErrors };
}
