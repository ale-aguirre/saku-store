/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de desarrollo segura
  ...(process.env.NODE_ENV === "development" && {
    // Forzar puerto 3000 en desarrollo
    env: {
      PORT: "3000",
      HOSTNAME: "localhost",
    },
  }),

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Solo en desarrollo - indicador de localhost
          ...(process.env.NODE_ENV === "development"
            ? [
                {
                  key: "X-Development-Only",
                  value: "localhost-only",
                },
              ]
            : []),
        ],
      },
    ];
  },

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ["localhost"],
    // En desarrollo, restringir a localhost:3000
    remotePatterns:
      process.env.NODE_ENV === "development"
        ? [
            {
              protocol: "http",
              hostname: "localhost",
              port: "3000",
            },
          ]
        : [
            {
              protocol: "https",
              hostname: "**",
            },
          ],
  },

  // Paquetes externos para componentes de servidor
  serverExternalPackages: ["@supabase/supabase-js"],

  experimental: {
    // Optimizar imports de lucide-react
    optimizePackageImports: ["lucide-react"],
  },

  // Configuración para suprimir warnings de Supabase en Edge Runtime
  onDemandEntries: {
    // Período de tiempo en ms para mantener las páginas en memoria
    maxInactiveAge: 25 * 1000,
    // Número de páginas que deben mantenerse simultáneamente
    pagesBufferLength: 2,
  },

  // Configuración de webpack para desarrollo seguro
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // En desarrollo, configurar devServer para localhost:3000 únicamente
      config.devServer = {
        ...config.devServer,
        allowedHosts: ["localhost", "127.0.0.1"],
        port: 3000,
        host: "localhost",
      };
    }

    // Configuración para suprimir warnings de Supabase en Edge Runtime
    config.ignoreWarnings = [
      // Ignorar warnings específicos de Supabase en Edge Runtime
      {
        module: /node_modules\/@supabase\/realtime-js\/dist\/module\/lib\/websocket-factory\.js/,
        message: /A Node\.js API is used \(process\.versions at line: 35\)/,
      },
      {
        module: /node_modules\/@supabase\/supabase-js\/dist\/module\/index\.js/,
        message: /A Node\.js API is used \(process\.version at line: 24\)/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
