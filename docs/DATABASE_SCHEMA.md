# Esquema de Base de Datos - Sakú Lencería

> **Última actualización**: 2025-10-01 02:06  
> **Verificado contra**: Supabase Production Database

## Tablas Principales

### `profiles` (Perfiles de Usuario)
**Ubicación**: `public.profiles`  
**Descripción**: Información extendida de usuarios (complementa `auth.users`)

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | uuid | ID del usuario (FK a auth.users.id) | ✅ |
| `email` | text | Email del usuario | ✅ |
| `first_name` | text | Nombre | ❌ |
| `last_name` | text | Apellido | ❌ |
| `phone` | text | Teléfono | ❌ |
| `role` | text | Rol (customer, admin, super_admin) | ✅ |
| `avatar_url` | text | URL del avatar | ❌ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ |

**Nota importante**: ⚠️ **NO existe tabla `users` en el esquema `public`**. Usar siempre `profiles`.

### `products` (Productos)
**Ubicación**: `public.products`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | uuid | ID único del producto | ✅ |
| `name` | text | Nombre del producto | ✅ |
| `description` | text | Descripción | ❌ |
| `category_id` | uuid | FK a categories.id | ✅ |
| `base_price` | decimal | Precio base | ✅ |
| `is_active` | boolean | Producto activo | ✅ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ |

### `product_variants` (Variantes de Producto)
**Ubicación**: `public.product_variants`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | uuid | ID único de la variante | ✅ |
| `product_id` | uuid | FK a products.id | ✅ |
| `size` | text | Talle (85, 90, 95, 100) | ✅ |
| `color` | text | Color (negro, rojo, blanco) | ✅ |
| `sku` | text | SKU único | ✅ |
| `stock_quantity` | integer | **Cantidad en stock** | ✅ |
| `price_adjustment` | decimal | Ajuste de precio | ❌ |
| `is_active` | boolean | Variante activa | ✅ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ |

**Nota importante**: ⚠️ El campo de stock se llama `stock_quantity`, **NO** `stock`.

### `categories` (Categorías)
**Ubicación**: `public.categories`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | uuid | ID único de la categoría | ✅ |
| `name` | text | Nombre de la categoría | ✅ |
| `slug` | text | Slug para URLs | ✅ |
| `description` | text | Descripción | ❌ |
| `is_active` | boolean | Categoría activa | ✅ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ |

### `orders` (Órdenes)
**Ubicación**: `public.orders`

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `id` | uuid | ID único de la orden | ✅ |
| `user_id` | uuid | FK a profiles.id | ✅ |
| `status` | text | Estado (pending, paid, shipped, delivered, cancelled) | ✅ |
| `total_amount` | decimal | Monto total | ✅ |
| `shipping_address` | jsonb | Dirección de envío | ✅ |
| `payment_method` | text | Método de pago | ✅ |
| `mercadopago_id` | text | ID de MercadoPago | ❌ |
| `tracking_code` | text | Código de seguimiento | ❌ |
| `created_at` | timestamptz | Fecha de creación | ✅ |
| `updated_at` | timestamptz | Fecha de actualización | ✅ |

## Tablas de Supabase Auth

### `auth.users` (Usuarios de Autenticación)
**Ubicación**: `auth.users`  
**Descripción**: Tabla interna de Supabase para autenticación

| Campo Principal | Tipo | Descripción |
|----------------|------|-------------|
| `id` | uuid | ID único del usuario |
| `email` | text | Email del usuario |
| `created_at` | timestamptz | Fecha de creación |
| `role` | text | Rol de autenticación |

**Relación**: `auth.users.id` → `public.profiles.id` (1:1)

## Convenciones de Naming

### Tablas
- Usar nombres en plural: `products`, `categories`, `orders`
- Usar snake_case: `product_variants`, `order_items`

### Campos
- Usar snake_case: `first_name`, `stock_quantity`, `created_at`
- IDs siempre `id` (primary key) o `{tabla}_id` (foreign key)
- Timestamps: `created_at`, `updated_at`
- Booleanos: `is_active`, `is_featured`

### Campos Comunes
Todas las tablas principales incluyen:
- `id` (uuid, primary key)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Verificación del Esquema

Para verificar el esquema actual, usar:

```bash
# Script personalizado
node scripts/check-user-tables.js

# O consulta directa
npx supabase db inspect
```

## Mejores Prácticas de Supabase

### Cliente Singleton Pattern

#### ✅ Correcto - Usar cliente centralizado
```typescript
// ✅ SIEMPRE usar esta importación
import { createClient } from '@/lib/supabase/client'

const MyComponent = () => {
  const supabase = createClient() // Reutiliza la instancia singleton
  // ...
}
```

#### ❌ Incorrecto - Crear múltiples instancias
```typescript
// ❌ NUNCA hacer esto
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const MyComponent = () => {
  const supabase = createSupabaseClient(url, key) // Crea nueva instancia
  // ...
}
```

### Estructura de Archivos Supabase

```
src/lib/supabase/
├── client.ts          # Cliente browser (singleton)
├── server.ts          # Cliente server-side
├── admin-client.ts    # Cliente admin (service role)
└── types.ts           # Tipos compartidos
```

### Reglas de Uso por Cliente

1. **Cliente Browser** (`client.ts`): Componentes React, hooks, páginas client-side
2. **Cliente Server** (`server.ts`): API routes, server components, middleware
3. **Cliente Admin** (`admin-client.ts`): Operaciones administrativas con service role

### Prevención de Warnings

**Multiple GoTrueClient Instances**
- **Causa**: Crear múltiples instancias del cliente en el mismo contexto
- **Solución**: Usar siempre el patrón singleton de `/src/lib/supabase/client.ts`

### Verificación de Instancias
```bash
# Buscar usos incorrectos
grep -r "createClient.*supabase" src/ --exclude-dir=lib/supabase
```

## Errores Comunes a Evitar

1. ❌ **NO usar** `.from('users')` → ✅ **Usar** `.from('profiles')`
2. ❌ **NO usar** `variant.stock` → ✅ **Usar** `variant.stock_quantity`
3. ❌ **NO asumir** nombres de campos → ✅ **Verificar** en documentación o DB
4. ❌ **NO hacer** cambios masivos sin verificar → ✅ **Confirmar** esquema primero
5. ❌ **NO crear** múltiples instancias de Supabase → ✅ **Usar** cliente singleton

## Changelog de Esquema

| Fecha | Cambio | Razón | Archivos Afectados |
|-------|--------|-------|-------------------|
| 2025-10-01 | Documentación inicial | Prevenir errores de mapeo | - |

---

**⚠️ IMPORTANTE**: Antes de hacer cualquier cambio que involucre nombres de tablas o campos, **SIEMPRE** verificar contra esta documentación y el esquema real de la base de datos.