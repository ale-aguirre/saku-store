import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración experimental para mejorar performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Configurar serverExternalPackages para Edge Runtime
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
};

export default nextConfig;
