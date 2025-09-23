# Sakú Store - E-commerce de Lencería

E-commerce moderno para Sakú Lencería construido con Next.js 15, Supabase y Mercado Pago.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm/yarn/pnpm
- Cuenta de Supabase
- Cuenta de Mercado Pago (para pagos)

### Configuración

1. **Clonar y instalar dependencias:**
```bash
git clone <repo-url>
cd saku-store
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env.local
```

Completar las variables requeridas en `.env.local`:

```env
# Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key

# Mercado Pago (Requerido)
MP_ACCESS_TOKEN=TEST-your-access-token

# Analytics (Opcional)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Email/SMTP (Requerido para transaccionales)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Sakú Lencería <noreply@sakulenceria.com>"
```

3. **Ejecutar en desarrollo:**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🏗️ Stack Tecnológico

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + Radix UI
- **Backend:** Supabase (Auth + Database + Storage)
- **Pagos:** Mercado Pago Checkout Pro
- **Estado:** TanStack Query + Zustand
- **Validación:** Zod + React Hook Form
- **Analytics:** Google Analytics 4 + Meta Pixel

## 📁 Estructura del Proyecto

```
src/
├── app/                 # App Router (Next.js 15)
├── components/          # Componentes reutilizables
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Header, Footer, etc.
│   ├── consent/        # Sistema de consentimiento
│   └── analytics/      # GA4 + Meta Pixel
├── lib/                # Utilidades y configuración
├── hooks/              # Custom hooks
└── types/              # Definiciones TypeScript
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run dev:secure       # Desarrollo con firewall habilitado

# Build y producción
npm run build           # Build para producción
npm run start           # Servidor de producción
npm run preview         # Build + start

# Calidad de código
npm run lint            # ESLint
npm run lint:fix        # ESLint con auto-fix
npm run type-check      # TypeScript check

# Supabase local
npm run supabase:start  # Iniciar Supabase local
npm run supabase:stop   # Detener Supabase local
npm run supabase:reset  # Reset DB local

# Testing
npm run test:e2e        # Tests E2E con Playwright
npm run test:e2e:ui     # Tests E2E con UI
```

## 🗄️ Base de Datos

El proyecto usa Supabase con las siguientes tablas principales:

- `products` - Productos base
- `variants` - Variantes (talle × color) con stock
- `orders` - Órdenes de compra
- `carts` - Carritos temporales
- `coupons` - Sistema de cupones
- `users` - Usuarios con roles

Ver `docs/AI_QA_CONTEXT.md` para el schema completo.

## 🔐 Seguridad

- **RLS habilitado** en todas las tablas de Supabase
- **Validación con Zod** en todos los inputs
- **Variables sensibles** solo en servidor (no `NEXT_PUBLIC_*`)
- **Consentimiento GDPR** con Google Consent Mode

## 📊 Analytics y Tracking

- **Google Analytics 4** con Enhanced Ecommerce
- **Meta Pixel** para remarketing
- **Consent Mode** integrado con banner de cookies
- **Eventos personalizados** para funnel de conversión

## 🚢 Deploy

El proyecto se despliega automáticamente en Vercel:

- **Preview:** Cada PR genera un preview automático
- **Staging:** Branch `develop` → staging.saku-store.vercel.app
- **Producción:** Branch `main` → saku-store.vercel.app

## 📚 Documentación

- `docs/ESTADO_PROYECTO.md` - Estado actual y roadmap
- `docs/AI_QA_CONTEXT.md` - Contexto de negocio y datos
- `.trae/rules/project_rules.md` - Reglas técnicas
- `.trae/user_rules.md` - Preferencias de desarrollo

## 🤝 Contribución

1. Crear branch desde `develop`: `feature/nueva-funcionalidad`
2. Hacer cambios y commits (Conventional Commits)
3. Push y crear PR hacia `develop`
4. Verificar preview de Vercel antes de merge
5. Merge solo después de review y tests pasando

## 📞 Soporte

Para dudas técnicas o de negocio, revisar la documentación en `/docs/` o contactar al equipo de desarrollo.
