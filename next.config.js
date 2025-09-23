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

    return config;
  },
};

module.exports = nextConfig;
