'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  fill = false,
  sizes,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const fallbackSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="%239ca3af"%3EImage not available%3C/text%3E%3C/svg%3E';
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src]);

  const isDataUrl = !src || src.startsWith('data:');

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={fill ? undefined : (width || 400)}
      height={fill ? undefined : (height || 300)}
      priority={priority}
      onError={() => setImgSrc(fallbackSrc)}
      unoptimized={isDataUrl}
    />
  );
}
