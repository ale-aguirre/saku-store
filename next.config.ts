import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración experimental para mejorar performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configurar serverExternalPackages para Edge Runtime
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  
  // Configuración de imágenes para permitir Supabase Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yhddnpcwhmeupwsjkchb.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
