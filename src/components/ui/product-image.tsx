'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

// Placeholder SVG generado dinámicamente
const generatePlaceholder = (width: number = 400, height: number = 400) => {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <rect x="${width * 0.25}" y="${height * 0.3}" width="${width * 0.5}" height="${height * 0.4}" rx="8" fill="#e5e7eb"/>
      <circle cx="${width * 0.4}" cy="${height * 0.45}" r="${width * 0.05}" fill="#d1d5db"/>
      <path d="M${width * 0.3} ${height * 0.6} L${width * 0.45} ${height * 0.5} L${width * 0.6} ${height * 0.55} L${width * 0.7} ${height * 0.65}" stroke="#d1d5db" stroke-width="2" fill="none"/>
      <text x="${width * 0.5}" y="${height * 0.8}" text-anchor="middle" fill="#9ca3af" font-family="Inter, sans-serif" font-size="${Math.max(12, width * 0.03)}">
        Imagen no disponible
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export function ProductImage({
  src,
  alt,
  width = 400,
  height = 400,
  className,
  priority = false,
  fill = false,
  sizes,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Si no hay src, src es null/undefined, o es una URL de placeholder, mostrar placeholder directamente
  const shouldShowPlaceholder = !src || src.includes('placeholder-product.svg') || hasError;
  
  if (shouldShowPlaceholder) {
    return (
      <div 
        className={cn(
          "relative bg-gray-100 flex items-center justify-center",
          fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`,
          className
        )}
        style={!fill ? { width, height } : undefined}
      >
        <Image
          src={generatePlaceholder(width, height)}
          alt={`Placeholder para ${alt}`}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className="object-cover"
          sizes={sizes}
        />
      </div>
    );
  }

  // Solo renderizar Image si tenemos un src válido
  if (!src) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center",
            fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`
          )}
          style={!fill ? { width, height } : undefined}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
      />
    </div>
  );
}