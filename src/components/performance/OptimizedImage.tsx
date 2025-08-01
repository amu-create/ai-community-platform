'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useIntersectionObserver } from '@/lib/performance';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  onLoad?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  onLoad,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  // Priority 이미지는 즉시 로드
  const shouldLoad = priority || isIntersecting;

  if (hasError) {
    return (
      <div
        className={cn(
          'bg-muted flex items-center justify-center',
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-muted-foreground text-sm">이미지 로드 실패</span>
      </div>
    );
  }

  return (
    <div
      ref={ref as any}
      className={cn('relative overflow-hidden', className)}
      style={fill ? undefined : { width, height }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes || (fill ? '100vw' : undefined)}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={() => {
            setIsLoaded(true);
            onLoad?.();
          }}
          onError={() => setHasError(true)}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            fill && 'object-cover'
          )}
        />
      )}
    </div>
  );
}

// 아바타 이미지 최적화 컴포넌트
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
}) {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&size=${size * 2}`;
  
  return (
    <OptimizedImage
      src={src || defaultAvatar}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      quality={90}
    />
  );
}
