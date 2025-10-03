# Especificaciones de Diseño - Panel de Administración Sakú Lencería

## Inspiración y Referencias

**Basado en**: Dashboard de Tiendanube/Nuvemshop  
**Fecha de análisis**: Enero 2025  
**Imágenes de referencia**: Guardadas en `/docs/references/tiendanube/`

## Paleta de Colores

### Colores Principales
- **Brand Primary**: `#d8ceb5` (Beige característico de Sakú)
- **Background Primary**: `#ffffff` (Blanco)
- **Background Secondary**: `#f8f9fa` (Gris muy claro)
- **Sidebar**: `#2c3e50` (Azul oscuro profesional)

### Colores de Estado
- **Success**: `#28a745` (Verde para métricas positivas)
- **Warning**: `#ffc107` (Amarillo para alertas)
- **Danger**: `#dc3545` (Rojo para métricas negativas)
- **Info**: `#17a2b8` (Azul para información)

### Colores de Texto
- **Primary**: `#2c3e50` (Texto principal)
- **Secondary**: `#6c757d` (Texto secundario)
- **Muted**: `#adb5bd` (Texto deshabilitado)
- **White**: `#ffffff` (Texto sobre fondos oscuros)

## Tipografía

### Fuentes
- **Headings**: Marcellus (títulos principales)
- **Body**: Inter (texto general, UI)
- **Logo**: Razed Bold (solo para logotipo)

### Escalas
- **H1**: 24px, font-weight: bold
- **H2**: 20px, font-weight: 600
- **H3**: 18px, font-weight: 600
- **H4**: 16px, font-weight: 600
- **Body**: 14px, font-weight: normal
- **Small**: 12px, font-weight: normal
- **Caption**: 11px, font-weight: normal

## Layout y Estructura

### Dimensiones Base
- **Sidebar Width**: 280px
- **Header Height**: 80px
- **Container Max Width**: 1440px
- **Content Padding**: 20px (mobile), 32px (desktop)

### Grid System
- **Columns**: 12 columnas
- **Gutter**: 24px
- **Breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

### Espaciado (8pt Grid)
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 48px

## Componentes UI

### Sidebar Navigation
```
Estructura:
├── Logo Area (80px height)
├── Main Navigation
│   ├── Dashboard (activo por defecto)
│   ├── Productos
│   ├── Pedidos
│   ├── Clientes
│   ├── Cupones
│   ├── Reportes
│   ├── Automatizaciones (NUEVO - destacado)
│   └── Configuración
└── User Profile (60px height)
```

**Estados**:
- **Activo**: Background `#d8ceb5`, texto `#2c3e50`
- **Hover**: Background `rgba(255,255,255,0.1)`
- **Normal**: Texto `#ffffff` con opacidad 0.7

### Header
- **Background**: `#ffffff`
- **Border Bottom**: `1px solid #e9ecef`
- **Content**: Título de página + breadcrumbs + acciones contextuales
- **Right Side**: Selector de fechas, notificaciones, perfil

### Cards y Contenedores
- **Background**: `#ffffff`
- **Border Radius**: 8px
- **Shadow**: `0 2px 4px rgba(0,0,0,0.1)`
- **Padding**: 20px
- **Border**: `1px solid #e9ecef` (opcional)

### Botones
- **Primary**: Background `#d8ceb5`, texto `#2c3e50`
- **Secondary**: Background `#6c757d`, texto `#ffffff`
- **Outline**: Border `#d8ceb5`, texto `#d8ceb5`
- **Height**: 40px (normal), 32px (small)
- **Border Radius**: 6px

### Tablas
- **Header**: Background `#f8f9fa`, texto `#6c757d`
- **Rows**: Alternating `#ffffff` y `#f8f9fa`
- **Hover**: Background `#e9ecef`
- **Border**: `1px solid #e9ecef`

## Dashboard Principal

### KPI Cards (4 columnas)
1. **Ventas Hoy**
   - Valor principal + porcentaje de cambio
   - Comparación vs. día anterior
   
2. **Pedidos Pendientes**
   - Número + indicador de urgencia
   - Link directo a gestión
   
3. **Stock Bajo**
   - Cantidad de productos + alerta
   - Link a restock
   
4. **Conversión**
   - Porcentaje + tendencia
   - Comparación mensual

### Gráficos
- **Ventas**: Chart de barras (7 días)
- **Productos Top**: Lista con thumbnails
- **Tabs**: Ventas / Pedidos / Clientes

### Acciones Rápidas (5 cards)
1. Nuevo Producto
2. Ver Pedidos
3. Automatizaciones
4. Reportes
5. Exportar Datos

## Módulos Específicos

### Automatizaciones (NUEVO)
**Inspirado en**: Sección de configuración de Tiendanube

#### Estructura:
```
Automatizaciones/
├── Carritos Abandonados
│   ├── Email Secuencia (3 emails)
│   ├── WhatsApp Follow-up
│   └── Descuento Progresivo
├── Post-Compra
│   ├── Email Confirmación
│   ├── Tracking Updates
│   └── NPS Survey
├── Marketing
│   ├── Winback Campaigns
│   ├── Restock Alerts
│   └── Birthday Offers
└── Webhooks n8n
    ├── Configuración Endpoints
    ├── Logs y Monitoreo
    └── Templates
```

#### UI Pattern:
- **Cards con estado** (Activo/Inactivo)
- **Toggle switches** para activar/desactivar
- **Configuración modal** para cada automatización
- **Métricas de performance** (open rate, conversión)

### Configuración
**Basado en**: Estructura de Tiendanube

#### Sidebar Sections:
```
Pagos y Envíos/
├── Mercado Pago
├── Métodos de Envío
└── Zonas de Entrega

Comunicación/
├── Información de Contacto
├── WhatsApp Business
├── Emails Automáticos
└── Notificaciones

Tienda/
├── Información General
├── Políticas y Términos
├── SEO y Analytics
└── Opciones del Checkout

Sistema/
├── Usuarios y Roles
├── Copias de Seguridad
├── Logs y Auditoría
└── Integraciones
```

## Responsive Design

### Mobile (320px - 767px)
- **Sidebar**: Colapsible (hamburger menu)
- **Cards**: Stack vertical (1 columna)
- **Tables**: Horizontal scroll
- **Padding**: Reducido a 16px

### Tablet (768px - 1023px)
- **Sidebar**: Fijo pero más estrecho (240px)
- **Cards**: 2 columnas
- **Charts**: Responsive scaling

### Desktop (1024px+)
- **Layout completo** según mockup
- **Sidebar**: 280px fijo
- **Cards**: 4 columnas para KPIs

## Estados y Interacciones

### Loading States
- **Skeleton screens** para cards
- **Spinners** para acciones
- **Progress bars** para uploads

### Empty States
- **Ilustraciones** simples
- **CTAs claros** para primera acción
- **Texto explicativo** amigable

### Error States
- **Toast notifications** para errores temporales
- **Error boundaries** para errores críticos
- **Retry buttons** cuando aplique

## Accesibilidad

### Requisitos AA
- **Contraste**: Mínimo 4.5:1 para texto normal
- **Focus states**: Visible en todos los elementos interactivos
- **Keyboard navigation**: Completa
- **Screen readers**: Labels y ARIA apropiados

### Indicadores Visuales
- **Estados de carga** claramente marcados
- **Errores** con iconos y colores
- **Éxito** con confirmaciones visuales

## Implementación Técnica

### Stack Recomendado
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **Forms**: react-hook-form + Zod
- **State**: TanStack Query v5

### Estructura de Archivos
```
src/components/admin/
├── layout/
│   ├── AdminSidebar.tsx
│   ├── AdminHeader.tsx
│   └── AdminLayout.tsx
├── dashboard/
│   ├── KPICards.tsx
│   ├── SalesChart.tsx
│   ├── TopProducts.tsx
│   └── QuickActions.tsx
├── modules/
│   ├── products/
│   ├── orders/
│   ├── customers/
│   ├── coupons/
│   ├── reports/
│   ├── automations/
│   └── settings/
└── ui/
    ├── DataTable.tsx
    ├── MetricCard.tsx
    ├── StatusBadge.tsx
    └── ActionButton.tsx
```

## Métricas y KPIs

### Dashboard Principal
- **Ventas**: Diarias, semanales, mensuales
- **Pedidos**: Pendientes, completados, cancelados
- **Stock**: Productos bajo mínimo
- **Conversión**: Visitantes → Compradores
- **AOV**: Valor promedio de orden

### Automatizaciones
- **Email Open Rate**: % de apertura
- **Click Rate**: % de clicks
- **Conversion Rate**: % de conversión
- **Recovery Rate**: % de carritos recuperados

## Fases de Implementación

### Fase 1: Layout Base (1-2 semanas)
- Sidebar navigation
- Header component
- Dashboard skeleton
- Responsive layout

### Fase 2: Dashboard Core (2-3 semanas)
- KPI cards con datos reales
- Charts básicos
- Quick actions
- Notificaciones

### Fase 3: Módulos CRUD (3-4 semanas)
- Productos management
- Orders management
- Customers management
- Basic reports

### Fase 4: Automatizaciones (2-3 semanas)
- n8n integration
- Email templates
- WhatsApp setup
- Monitoring dashboard

### Fase 5: Configuración (1-2 semanas)
- Settings panels
- User management
- System configuration
- Export functionality

## Notas de Implementación

### Performance
- **Lazy loading** para módulos pesados
- **Virtual scrolling** para listas largas
- **Memoización** de componentes costosos
- **Code splitting** por rutas

### SEO y Analytics
- **No indexar** páginas de admin
- **GA4 events** para acciones importantes
- **Error tracking** con Sentry (opcional)

### Seguridad
- **RLS policies** en Supabase
- **Role-based access** control
- **CSRF protection**
- **Input validation** con Zod

### Manejo de Imágenes

#### Configuración Next.js
- **next.config.ts**: Configurado con `remotePatterns` para Supabase Storage
- **Dominios permitidos**: 
  - `*.supabase.co` (Supabase Storage)
  - `via.placeholder.com` (placeholders)
- **Optimización**: Automática vía `next/image`

#### Flujo de Carga
1. **Productos**: Array de URLs en campo `images` (JSON)
2. **Fallback**: Placeholder SVG generado dinámicamente
3. **Validación**: Verificación de URLs válidas antes de renderizar
4. **Performance**: Lazy loading automático con `next/image`

#### Estructura de Datos
```typescript
interface Product {
  images: string[]; // Array de URLs de Supabase Storage
  // ... otros campos
}
```

#### Componentes
- **ProductImageGallery**: Maneja múltiples imágenes con navegación
- **ImagePlaceholder**: SVG generado para productos sin imágenes
- **AdminImageUpload**: Componente para subir/gestionar imágenes (futuro)

#### Tests E2E
- **Verificación**: Carga correcta de imágenes en páginas públicas
- **Fallbacks**: Manejo de imágenes faltantes o errores de carga
- **Performance**: No errores de hostname en consola

---

**Última actualización**: Enero 2025  
**Responsable**: Agente Saku  
**Estado**: Especificación completa - Listo para implementación