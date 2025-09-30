# Estado del Proyecto - Sakú Store

**Fecha**: Septiembre 2025  
**Versión**: 1.0.0-beta  
**Rama principal**: `develop`

## Resumen Ejecutivo

E-commerce de lencería femenina desarrollado con Next.js 15 + Supabase, enfocado en experiencia de usuario simple y performance optimizada. **MVP completado** con funcionalidades principales implementadas.

## Estado Actual

### ✅ Completado (Fase F0 - Fundaciones)

#### Infraestructura Base
- **Framework**: Next.js 15 con App Router ✅
- **UI Kit**: Tailwind + shadcn/ui + Radix UI ✅
- **Temas**: Dark/Light mode con next-themes ✅
- **Tipografía**: Marcellus (headings) + Inter (body) ✅
- **Paleta**: #d8ceb5 / #ffffff / #000000 ✅

#### Autenticación y Usuarios
- **Google OAuth**: Implementado completamente ✅
- **Páginas**: Login, registro, callback, cuenta de usuario, forgot password ✅
- **Configuración**: Supabase Auth configurado ✅
- **Dashboard**: Página de cuenta básica implementada ✅

#### Páginas Legales
- **Términos y Condiciones**: Implementado con contenido dinámico desde DB ✅
- **Política de Privacidad**: Implementado con contenido dinámico desde DB ✅
- **Política de Cookies**: Implementado con contenido dinámico desde DB ✅

#### Optimizaciones
- **Imágenes**: Hero convertida a WebP (89KB vs 484KB PNG) ✅
- **Assets**: Logo y favicon corregidos para usar exclusivamente assets proporcionados ✅
- **SEO**: Sitemap configurado con next-sitemap ✅

### ✅ Completado (Fase F1 - MVP Ventas)

#### Catálogo de Productos
- **PLP**: Página de listado con paginación y filtros ✅
- **PDP**: Página de detalle con variantes (talle/color) ✅
- **Filtros**: Por categoría, precio, talle y color ✅
- **Paginación**: Sistema completo con navegación ✅
- **Búsqueda**: Integrada con filtros ✅

#### Carrito y Checkout
- **Carrito**: Drawer lateral funcional ✅
- **Cupones**: Sistema de descuentos (porcentaje y monto fijo) ✅
- **Envío**: Tarifa nacional + Cadete Córdoba ✅
- **Checkout**: Mercado Pago Checkout Pro integrado ✅
- **Webhook**: Procesamiento automático de pagos ✅

#### Administración
- **Dashboard**: Panel con estadísticas y órdenes recientes ✅
- **CRUD Productos**: Gestión completa de productos y variantes ✅
- **Órdenes**: Gestión, estados y tracking ✅
- **Cupones**: Administración completa ✅
- **RLS**: Políticas de seguridad configuradas ✅

#### Emails Transaccionales
- **Configuración**: SMTP setup completo ✅
- **Templates**: Confirmación, envío, bienvenida, newsletter ✅
- **Integración**: Automática con webhook MP ✅
- **Tracking**: Notificaciones de envío con Correo Argentino ✅

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
- **Ramas**: Estructura main/develop/feature/* establecida ✅
- **Commits**: Conventional Commits implementado ✅
- **Testing**: Vitest + Playwright configurado ✅
- **CI/CD**: Vercel preview automático ✅

#### Base de Datos (Supabase)
- **Schema**: Implementado completamente ✅
- **Migraciones**: Aplicadas y funcionales ✅
- **RLS**: Configurado con políticas de seguridad ✅
- **Seed Data**: Productos y cupones de prueba ✅

### ⏳ Pendiente (Fase F2 - Operaciones & CRM)

#### Automatizaciones CRM
- **n8n Cloud**: Integración para workflows
- **Carritos abandonados**: Recuperación automática
- **NPS**: Encuestas post-compra
- **RFM**: Segmentación de clientes
- **Winback**: Campañas de reactivación

#### WhatsApp Business
- **BSP 360dialog**: Integración para notificaciones
- **Templates**: Mensajes de confirmación y envío
- **Automatización**: Notificaciones automáticas

#### Optimizaciones Avanzadas
- **Bricks**: Checkout nativo de Mercado Pago
- **Filtros avanzados**: Búsqueda por texto
- **Wishlist**: Lista de deseos
- **Reviews**: Sistema de reseñas
- **Bundles**: Productos combinados

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
SUPABASE_SERVICE_ROLE ✅
MP_ACCESS_TOKEN ✅
SMTP_HOST ✅
SMTP_PORT ✅
SMTP_SECURE ✅
SMTP_USER ✅
SMTP_PASS ✅
SMTP_FROM ✅
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

### ✅ Completado (MVP F1)
1. **Migraciones Supabase**: Schema completo + RLS ✅
2. **Páginas legales**: Términos, Privacidad, Cookies ✅
3. **Catálogo MVP**: PLP + PDP con filtros y paginación ✅
4. **Carrito funcional**: Add to cart + drawer ✅
5. **Sistema de cupones**: Validación y aplicación ✅
6. **Checkout MP**: Integración Checkout Pro ✅
7. **Admin panel**: CRUD completo ✅
8. **Webhook MP**: Actualización de órdenes ✅
9. **Emails transaccionales**: Templates profesionales ✅

### Inmediato (Fase F2 - CRM)
1. **Analytics**: GA4 + Meta Pixel
2. **n8n Cloud**: Workflows de automatización
3. **WhatsApp BSP**: Integración 360dialog

### Corto Plazo (Optimizaciones)
1. **Performance**: Core Web Vitals optimization
2. **SEO**: Schema.org + sitemap avanzado
3. **A/B Testing**: Experimentos de conversión

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