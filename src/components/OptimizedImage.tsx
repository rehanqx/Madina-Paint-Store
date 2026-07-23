'use client';

import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string; // Kept for type compatibility
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

  if (fill) {
    return (
      <img
        src={imgSrc}
        alt={alt}
        className={`${className} absolute inset-0 w-full h-full object-cover`}
        onError={() => setImgSrc(fallbackSrc)}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width || 400}
      height={height || 300}
      onError={() => setImgSrc(fallbackSrc)}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}
