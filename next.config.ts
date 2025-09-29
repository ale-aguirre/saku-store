import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Optimizar cache de webpack para archivos grandes
    if (config.cache && typeof config.cache === 'object') {
      config.cache.maxMemoryGenerations = 1;
    }
    
    // Configurar optimización para archivos grandes
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        cacheGroups: {
          ...config.optimization?.splitChunks?.cacheGroups,
          default: {
            ...config.optimization?.splitChunks?.cacheGroups?.default,
            maxSize: 100000, // 100KB max por chunk
          },
        },
      },
    };

    return config;
  },
  
  // Configuración experimental para mejorar performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configurar serverExternalPackages para Edge Runtime
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
};

export default nextConfig;
