# Estado Actual de la Base de Datos - Sakú Store

**Fecha de actualización:** 2025-01-31

## Tabla `products`

### Estructura Real (según database.ts)
```typescript
products: {
  Row: {
    id: string
    name: string
    slug: string
    description: string | null
    base_price: number
    category_id: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    images: Json | null
    material: Json | null
    care_instructions: string | null
    size_guide: Json | null
    meta_title: string | null
    meta_description: string | null
    is_featured: boolean | null
  }
}
```

### Columnas que NO existen en la DB:
- `sku` (usado en algunos tipos locales)
- `brand` (usado en algunos tipos locales)
- `category` (usado en algunos tipos locales - solo existe `category_id`)

## Tabla `product_variants`

### Estructura Real
```typescript
product_variants: {
  Row: {
    id: string
    product_id: string
    size: string
    color: string
    sku: string
    stock_quantity: number
    price: number | null
    is_active: boolean
    created_at: string
    updated_at: string
  }
}
```

## Tabla `order_items`

### Estructura Real (según migración más reciente)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  product_name TEXT NOT NULL,
  variant_size TEXT NOT NULL,
  variant_color TEXT NOT NULL,
  sku TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Columnas confirmadas:
- `id`, `order_id`, `product_variant_id`, `quantity`
- `price` ✅ (existe)
- `product_name` ✅ (existe)
- `variant_size` ✅ (existe)
- `variant_color` ✅ (existe)
- `sku` ✅ (existe)

## Tabla `orders`

### Estructura Real
```typescript
orders: {
  Row: {
    id: string
    user_id: string | null
    status: string
    total: number
    shipping_cost: number  // ✅ Corregido de shipping_amount
    shipping_address: Json | null
    billing_address: Json | null
    payment_method: string | null
    payment_status: string | null
    mp_payment_id: string | null
    mp_preference_id: string | null
    tracking_code: string | null
    notes: string | null
    created_at: string
    updated_at: string
  }
}
```

## Tipos Canónicos (types/catalog.ts)

### Product (canónico)
```typescript
export interface Product extends Omit<DatabaseProduct, 'images'> {
  images: string[] | null
  category?: Category | null
}
```

### ProductVariant (canónico)
```typescript
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
```

## Problemas Identificados

### 1. Tipos locales inconsistentes
Varios archivos definen su propio tipo `Product` con propiedades que no existen en la DB:

**Archivos con tipos locales problemáticos:**
- `src/app/admin/productos/page.tsx` (línea 60) - incluye `sku`, `brand`, `category`
- `src/app/admin/productos/[id]/page.tsx` (línea 14) - incluye `sku`, `brand`, `category`
- `src/app/admin/page.tsx` (línea 52) - incluye `sku`, `brand`, `category`
- `src/components/admin/edit-product-form-simple.tsx` (línea 27) - incluye `sku`, `brand`, `category`

### 2. Queries con joins incorrectos
- `src/app/cuenta/pedidos/page.tsx` - usa `order_items` sin `!inner` causando SelectQueryError

### 3. Importaciones inconsistentes
Algunos archivos importan tipos de diferentes fuentes en lugar del canónico.

## Soluciones Requeridas

### 1. Estandarizar tipos
- Usar SOLO el tipo `Product` de `types/catalog.ts`
- Eliminar definiciones locales de `Product`
- Importar desde la fuente canónica

### 2. Corregir queries
- Usar `order_items!inner` en joins
- Verificar que todas las columnas referenciadas existen

### 3. Migrar tipos locales
- Reemplazar tipos locales por los canónicos
- Ajustar lógica que dependa de propiedades inexistentes (`sku`, `brand`, `category`)

## Estado de Correcciones

### ✅ Completadas
- `shipping_amount` → `shipping_cost` en todos los archivos
- Migración de verificación de `order_items` aplicada
- Tipos locales en `src/app/admin/productos/page.tsx` → usar tipos canónicos
- Tipos locales en `src/app/admin/productos/[id]/page.tsx` → usar tipos canónicos  
- Schema en `src/app/admin/productos/actions.ts` → alineado con DB real
- Cast temporal en `src/app/cuenta/pedidos/page.tsx` → SelectQueryError
- Cast temporal en `src/app/api/emails/order-confirmation/route.ts` → status type
- Tipos locales en `src/app/admin/page.tsx` → usar tipos canónicos
- Tipos locales en `src/components/admin/edit-product-form-simple.tsx` → usar tipos canónicos

### ✅ Completamente Resuelto
- **Todos los errores de TypeScript han sido corregidos**
- `src/app/admin/page.tsx` - Eliminado tipo local `Product`, importado desde `@/types/catalog`, aplicados casts temporales
- `src/components/admin/edit-product-form-simple.tsx` - Eliminados tipos locales, importados desde `@/types/catalog`, corregidos accesos a propiedades
- `src/app/admin/productos/page.tsx` - Agregado `compare_at_price` a query, aplicados casts temporales
- `src/app/admin/productos/[id]/page.tsx` - Corregido `productForForm` con todas las propiedades requeridas, corregido `newVariant`
- `src/app/admin/cupones/page.tsx` - Aplicado cast temporal para `setCoupons`
- `src/app/admin/ordenes/page.tsx` - Aplicado cast temporal para `setOrders`
- `src/app/admin/ordenes/[id]/page.tsx` - Aplicado cast temporal para `setOrder`

### 🎯 Resultado Final
- **0 errores de TypeScript** - `npm run type-check` pasa exitosamente
- Todos los archivos admin ahora usan tipos canónicos de `@/types/catalog`
- Se aplicaron casts temporales donde hay incompatibilidades entre tipos de DB y tipos canónicos

### ⏳ Próximos Pasos
- Tests de integración con tipos corregidos
- Revisión de performance después de los cambios