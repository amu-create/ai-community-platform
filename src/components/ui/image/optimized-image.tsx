'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
  sizes?: string
  quality?: number
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes = '100vw',
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        className={cn(
          'duration-700 ease-in-out',
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  )
}
