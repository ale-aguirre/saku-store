# ROADMAP — Status & History

## Phases Overview

- **F0 Foundations** — Status: **Done** — Owner: Agente Saku
  - Scope: UI kit (Marcellus/Inter + dark/light), legales, Consent, GA4/Pixel, Supabase schema & RLS

- **F1 MVP Sales** — Status: **Planned** — Owner: Agente Saku
  - Scope: Home/PLP/PDP, Cart + Coupon, Shipping (flat + Cadete Córdoba), Checkout Pro, Orders, Admin, Emails

- **F2 Ops & CRM** — Status: **Planned** — Owner: Agente Saku
  - Scope: MP webhook, Tracking link, n8n (abandonado, NPS, RFM, winback), Admin Automatizaciones/Campañas, WhatsApp BSP

- **F3 Optimization** — Status: **Planned** — Owner: Agente Saku
  - Scope: Bricks, filtros/búsqueda, wishlist, reseñas, bundles, A/B, CWV, reportes

## Today: 2025-09-23

- **Task**: Setup documentación ROADMAP y LEARNING_LOG
- **Branch**: `docs/roadmap-learning-log-setup`
- What was done: 
  - Creado /docs/ROADMAP.md con estructura completa y estado de fases
  - Creado /docs/LEARNING_LOG.md con template para registrar hallazgos
  - Corregido error ESLint en cookie-banner.tsx (prefer-rest-params)
  - Agregado componente Switch de shadcn/ui para resolver dependencia faltante
  - Configurado script notify:done en package.json y corregido error en notify-completion.js
- **How it was done**:
  - Análisis de contexto desde AI_QA_CONTEXT.md para definir scope de fases
  - Creación de archivos con estructura según especificaciones
  - Fix ESLint: reemplazado `arguments` por rest parameters `...args`
  - Instalación de componente: `npx shadcn@latest add switch`
- **Checks**:
  - ✅ ESLint: OK (sin errores)
  - ✅ Type-check: OK (sin errores)
  - 🔄 Tests e2e: en progreso (puerto alternativo 3001)
  - ✅ Script notify:done: OK (configurado y funcionando)
- **Preview**: Pendiente (no hay cambios visuales)
- **Notes/Risks**: Puerto 3000 ocupado por proceso 29376, tests e2e usando puerto 3001

## Upcoming (next 3)

1) **F1 - Catálogo de productos**: Implementar PLP/PDP con variantes (talle × color)
2) **F1 - Sistema de carrito**: Cart drawer con cupones y cálculo de envío
3) **F1 - Checkout MVP**: Integración con Mercado Pago Checkout Pro

## Backlog

- **F1 MVP Sales**:
  - Home page con hero y productos destacados
  - Product Listing Page (PLP) con filtros básicos
  - Product Detail Page (PDP) con selector de variantes
  - Cart drawer con cupones y shipping calculator
  - Checkout flow con Mercado Pago Checkout Pro
  - Order management (pending → paid → fulfilled)
  - Admin panel básico (productos, stock, órdenes, cupones)
  - Emails transaccionales (confirmación, tracking)

- **F2 Ops & CRM**:
  - Webhook de Mercado Pago para actualizar órdenes
  - Integración con Correo Argentino para tracking
  - n8n workflows (carrito abandonado, NPS, RFM, winback)
  - Admin panel para automatizaciones y campañas
  - WhatsApp BSP integration (360dialog)

- **F3 Optimization**:
  - Mercado Pago Bricks (checkout embebido)
  - Filtros avanzados y búsqueda
  - Wishlist y favoritos
  - Sistema de reseñas
  - Bundles y productos relacionados
  - A/B testing framework
  - Core Web Vitals optimization
  - Reportes y analytics (CR, AOV, NPS, RFM)

## Completed Tasks History

### 2025-01-21 — F0 Foundations Complete
- **Tasks**: Migraciones Supabase, RLS, UI Tokens, páginas legales, sistema de consentimiento, analytics
- **Branch**: Multiple feature branches
- **Status**: ✅ Completed
- **Notes**: Base sólida establecida para desarrollo del MVP

### 2025-09-23 — Documentation Setup
- **Task**: Setup documentación de roadmap y learning log
- **Branch**: `docs/roadmap-learning-log-setup`
- **Status**: 🔄 In Progress
- **Files**: `/docs/ROADMAP.md`, `/docs/LEARNING_LOG.md`

### 2025-09-23 — SMTP Configuration & Error Fixes
- **Task**: Configuración SMTP y corrección de errores de build
- **Branch**: `fix/smtp-config-and-build-errors`
- **Status**: ✅ Completed
- **What was done**:
  - Script notify:done configurado y funcionando con sintaxis CommonJS
  - Configuración SMTP para Brevo (SMTP_SECURE=false, dominio verificado)
  - Corrección de error de build: GoogleAnalytics y MetaPixel movidos dentro de ConsentProvider
  - Documentación de errores y soluciones en LEARNING_LOG.md
  - Build, ESLint y TypeScript verificados sin errores