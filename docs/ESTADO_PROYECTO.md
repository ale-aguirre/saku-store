# Estado del Proyecto - Sakú Store

**Fecha**: Enero 2025  
**Versión**: 0.1.0  
**Rama principal**: `develop`

## Resumen Ejecutivo

E-commerce de lencería femenina desarrollado con Next.js 15 + Supabase, enfocado en experiencia de usuario simple y performance optimizada.

## Estado Actual

### ✅ Completado (Fase F0 - Fundaciones)

#### Infraestructura Base
- **Framework**: Next.js 15 con App Router
- **UI Kit**: Tailwind + shadcn/ui + Radix UI
- **Temas**: Dark/Light mode con next-themes
- **Tipografía**: Marcellus (headings) + Inter (body)
- **Paleta**: #d8ceb5 / #ffffff / #000000

#### Autenticación y Usuarios
- **Google OAuth**: Implementado completamente
- **Páginas**: Login, registro, callback, cuenta de usuario, forgot password
- **Configuración**: Supabase Auth configurado
- **Dashboard**: Página de cuenta básica implementada

#### Páginas Legales
- **Términos y Condiciones**: Implementado con contenido dinámico desde DB
- **Política de Privacidad**: Implementado con contenido dinámico desde DB
- **Política de Cookies**: Implementado con contenido dinámico desde DB

#### Optimizaciones
- **Imágenes**: Hero convertida a WebP (89KB vs 484KB PNG)
- **Assets**: Logo y favicon corregidos para usar exclusivamente assets proporcionados
- **SEO**: Sitemap configurado con next-sitemap

## Problemas Críticos Resueltos

### 1. Assets Inconsistentes (Resuelto)
- **Problema**: Archivos SVG generados automáticamente (`favicon.svg`, `logo.svg`) no correspondían con assets reales proporcionados
- **Impacto**: Logo y favicon incorrectos en toda la aplicación
- **Solución**: 
  - Corregido navbar para usar `logo.png`
  - Actualizado metadata para usar `favicon.ico`
  - Eliminados archivos SVG conflictivos
- **Archivos modificados**: `src/components/layout/navbar.tsx`, `src/app/layout.tsx`
- **Archivos eliminados**: `public/favicon.svg`, `public/logo.svg`
- **Estado**: ✅ Resuelto y verificado en preview

### 2. Estructura de Archivos Desorganizada (Resuelto)
- **Problema**: Múltiples archivos de prueba y debug en raíz del proyecto
- **Impacto**: Estructura desordenada, dificulta mantenimiento y navegación
- **Solución**: Reorganización completa de archivos de testing
- **Archivos movidos a `scripts/`**:
  - `test-cart-trigger-after-add.js`
  - `test-cart-trigger.js`
  - `test-full-cart-flow.js`
  - `test-link-behavior.js`
  - `test-navigation.js`
  - `test-product-ids.js`
  - `debug-productos.js`
- **Estado**: ✅ Resuelto - Estructura limpia y organizada

#### Workflow de Desarrollo
- **Ramas**: Estructura main/develop/feature/* establecida
- **Documentación**: Guía de contribución creada
- **Commits**: Conventional Commits implementado

### 🔄 En Progreso

#### Base de Datos (Supabase)
- **Schema**: Definido en AI_QA_CONTEXT.md
- **Migraciones**: Pendientes de implementar
- **RLS**: Pendiente de configurar

#### Páginas Legales
- **Términos**: Estructura básica creada
- **Privacidad**: Pendiente
- **Cookies**: Pendiente

### ⏳ Pendiente (Fase F1 - MVP Ventas)

#### Catálogo de Productos
- **PLP**: Página de listado de productos
- **PDP**: Página de detalle con variantes (talle/color)
- **Guía de talles**: Implementar
- **Aviso de higiene**: Integrar en PDP

#### Carrito y Checkout
- **Carrito**: Drawer lateral
- **Cupones**: Sistema de descuentos
- **Envío**: Tarifa nacional + Cadete Córdoba
- **Checkout**: Mercado Pago Checkout Pro

#### Administración
- **CRUD**: Productos, variantes, stock
- **Órdenes**: Gestión y tracking
- **Cupones**: Administración
- **Usuarios**: Panel básico

#### Emails Transaccionales
- **Configuración**: SMTP setup
- **Templates**: Confirmación, envío, etc.

## Arquitectura Técnica

### Stack Principal
```
Frontend: Next.js 15 + TypeScript + Tailwind
UI: shadcn/ui + Radix UI + Lucide React
Estado: TanStack Query + Zustand
Validación: Zod + React Hook Form
Backend: Supabase (Auth + DB + Storage)
Pagos: Mercado Pago Checkout Pro
```

### Variables de Entorno Configuradas
```
NEXT_PUBLIC_SUPABASE_URL ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
SUPABASE_SERVICE_ROLE ⏳
MP_ACCESS_TOKEN ⏳
SMTP_* ⏳
GA4_ID ⏳
META_PIXEL_ID ⏳
```

## Modelo de Datos

### Entidades Principales
- **products**: Información base del producto
- **variants**: Talle × Color con stock y precio
- **orders**: Órdenes con snapshot de items
- **carts**: Carritos temporales
- **coupons**: Sistema de descuentos
- **users**: Usuarios con roles (retail/wholesale/admin)

### Flujo de Compra Planificado
```
PDP → Carrito → Cupón → Envío → MP Checkout → Webhook → Email
```

## Métricas y KPIs (Futuros)

### Conversión
- **CR**: Conversion Rate
- **AOV**: Average Order Value
- **% Carritos recuperados**: Abandoned cart recovery

### Satisfacción
- **NPS**: Net Promoter Score (5-7 días post-compra)
- **RFM**: Recency, Frequency, Monetary segmentation

## Roadmap Próximos Pasos

### Inmediato (Sprint 1-2)
1. **Migraciones Supabase**: Schema completo + RLS
2. **Páginas legales**: Términos, Privacidad, Cookies
3. **Catálogo MVP**: PLP + PDP básico

### Corto Plazo (Sprint 3-4)
1. **Carrito funcional**: Add to cart + drawer
2. **Sistema de cupones**: Validación y aplicación
3. **Checkout MP**: Integración Checkout Pro

### Medio Plazo (Sprint 5-8)
1. **Admin panel**: CRUD básico
2. **Webhook MP**: Actualización de órdenes
3. **Emails transaccionales**: Templates básicos

## Riesgos y Consideraciones

### Técnicos
- **RLS Supabase**: Crítico para seguridad
- **MP Webhook**: Idempotencia y retry logic
- **Performance**: Optimización de imágenes y queries

### Negocio
- **Políticas de devolución**: Solo cambio de talle
- **Higiene**: Comunicación clara en PDP
- **Monotributo**: Proceso fiscal en curso

## Contacto y Recursos

- **Repositorio**: GitHub (privado)
- **Deploy**: Vercel (preview automático)
- **Documentación**: `/docs/` en repo
- **Reglas técnicas**: `project_rules.md`
- **Contexto AI**: `AI_QA_CONTEXT.md`