'use client';

import { useState, useRef, useEffect } from 'react';
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
  lazy?: boolean; // Nueva prop para controlar lazy loading
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
  lazy = true,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy || priority); // Si no es lazy o es priority, cargar inmediatamente
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Cargar 50px antes de que sea visible
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);



  // Si no hay src, src es null/undefined, o es una URL de placeholder, mostrar placeholder directamente
  const shouldShowPlaceholder = !src || (typeof src === 'string' && src.includes('placeholder-product.svg')) || hasError;
  
  // Separar clases del contenedor vs clases de la imagen
  const containerClasses = fill ? "relative w-full h-full" : "relative";
  const imageClasses = className || "object-cover";
  
  if (shouldShowPlaceholder) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          "relative bg-gray-100 flex items-center justify-center",
          fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`
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
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div ref={imgRef} className={containerClasses}>
      {/* Mostrar skeleton mientras no esté en vista o esté cargando */}
      {(!isInView || isLoading) && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-100 flex items-center justify-center z-10",
            fill ? "w-full h-full" : `w-[${width}px] h-[${height}px]`,
            !isInView ? "animate-pulse" : ""
          )}
          style={!fill ? { width, height } : undefined}
        >
          {isInView && isLoading ? (
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          )}
        </div>
      )}
      
      {/* Solo renderizar la imagen si está en vista */}
      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          className={cn(
            imageClasses,
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
          sizes={sizes || (fill ? "100vw" : undefined)}
          unoptimized={false}
        />
      )}
    </div>
  );
}