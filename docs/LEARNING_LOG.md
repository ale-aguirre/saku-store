# Learning Log - Sakú Lencería

## 2025-10-01 23:03 - Error de hostname no configurado en next/image para Supabase

**Issue**: Runtime Error al cargar imágenes de productos desde Supabase Storage, indicando que el hostname "yhddnpcwhmeupwsjkchb.supabase.co" no está configurado en `next.config.js` para el componente `next/image`.

**Cause**: Next.js requiere que todos los dominios externos de imágenes sean explícitamente permitidos en la configuración `images.remotePatterns` para usar el componente optimizado `next/image`. El hostname de Supabase no estaba configurado.

**Fix**: 
1. Agregada configuración de `images.remotePatterns` en `next.config.ts`
2. Incluido el hostname específico de Supabase: `yhddnpcwhmeupwsjkchb.supabase.co`
3. También agregado `via.placeholder.com` para imágenes de prueba
4. Reinicio del servidor de desarrollo para aplicar cambios

**Prevention**:
- Configurar todos los dominios de imágenes externas en `next.config.js` antes de usarlos
- Verificar la configuración de imágenes cuando se integren nuevos servicios de storage
- Documentar los hostnames permitidos en la configuración del proyecto
- Probar la carga de imágenes después de cambios en la configuración

## 2025-10-01 20:52 - Error de columna inexistente en actualización de productos

**Issue**: Error `PGRST204` al intentar actualizar productos desde el panel de administración, indicando que la columna `image_url` no existe en la tabla `products` de Supabase.

**Cause**: Inconsistencia entre el esquema de la base de datos y el código de la aplicación. La tabla `products` solo tiene la columna `images` (array) pero el código intentaba actualizar también `image_url` (string) que no existe.

**Fix**: 
1. Eliminación de todas las referencias a `image_url` en el código de administración
2. Uso exclusivo de la columna `images` para almacenar las imágenes del producto
3. Corrección de la inicialización de `formData` para usar solo campos existentes
4. Actualización de la función `handleSubmit` para usar `base_price` en lugar de `price`

**Prevention**:
- Verificar el esquema actual de la base de datos antes de hacer cambios en el código
- Mantener sincronización entre migraciones de DB y código de aplicación
- Usar scripts de verificación de esquema para detectar inconsistencias
- Documentar cambios de esquema en `AI_QA_CONTEXT.md` cuando se realicen

## 2025-10-01 13:20 - Errores ENOENT por archivos faltantes en .next

**Issue**: Errores constantes `ENOENT: no such file or directory, open '.next/routes-manifest.json'` al acceder a páginas de la aplicación, especialmente `/admin/configuracion`.

**Cause**: Archivos de build corruptos o incompletos en la carpeta `.next` debido a interrupciones del servidor de desarrollo, procesos conflictivos en puertos, o builds incompletos previos.

**Fix**: Limpieza completa del entorno de desarrollo:
1. Detener todos los procesos de Next.js (`scripts/close-ports.js`)
2. Eliminar carpeta `.next` completamente (`rm -rf .next`)
3. Eliminar `node_modules` (`rm -rf node_modules`)
4. Reinstalar dependencias (`npm install`)
5. Iniciar servidor limpio (`npm run dev`)

**Prevention**:
- Ejecutar `scripts/close-ports.js` antes de iniciar desarrollo para evitar conflictos
- Usar `rm -rf .next && npm run dev` cuando aparezcan errores de archivos faltantes
- Evitar interrupciones bruscas del servidor de desarrollo (Ctrl+C limpio)
- Verificar que solo el puerto 3000 esté en uso para la aplicación

## 2025-09-29 14:30 - Dependencias faltantes en librerías externas

**Issue**: Error de compilación por dependencia faltante (`axios`) en librería `ylazzari-correoargentino`.

**Cause**: La librería externa requiere `axios` pero no lo declara como dependencia directa, solo como peer dependency.

**Fix**: Instalación manual de `axios` con `--legacy-peer-deps` para resolver conflictos de versiones de `dotenv`.

**Prevention**: 
- Verificar dependencias de librerías externas antes de integrarlas
- Revisar peer dependencies y conflictos potenciales
- Documentar dependencias adicionales requeridas en el README

## 2025-09-29 14:30 - Componentes inexistentes en imports

**Issue**: Error de TypeScript por importación de componente `OrderSummary` que no existe.

**Cause**: El componente fue eliminado en refactoring previo pero las importaciones no fueron actualizadas.

**Fix**: Eliminación de import y reemplazo con componente `Card` simple.

**Prevention**:
- Verificar existencia de archivos antes de importar
- Usar herramientas de refactoring automático cuando sea posible
- Mantener consistencia entre eliminaciones y referencias

## 2025-10-01 11:30 - Errores de tipos en operaciones de base de datos con Supabase

**Issue**: Errores TypeScript `TS2345` al intentar actualizar campos en tabla `profiles` con Supabase, donde el argumento `{ avatar_url: string }` no era asignable al parámetro de tipo `never`.

**Cause**: TypeScript no pudo inferir correctamente el tipo de la tabla `profiles` en las operaciones `.update()`, resultando en un tipo `never` que rechaza cualquier valor.

**Fix**: Especificación explícita del tipo como `any` en las operaciones de actualización: `.from('profiles' as any).update({ avatar_url: publicUrl })` y `.from('profiles' as any).update({ avatar_url: null })`.

**Prevention**:
- Definir tipos explícitos para las tablas de Supabase cuando sea necesario
- Considerar usar el generador de tipos de Supabase para mayor precisión
- Verificar tipos con `npm run type-check` después de cambios en operaciones de base de datos
- Documentar castings de tipo cuando sean necesarios para operaciones específicas

## 2025-09-29 19:50 - Inconsistencias de tipos entre hooks y funciones

**Issue**: Errores de TypeScript por inconsistencias entre interfaces de hooks (`UseProductsParams`) y funciones de datos (`getProducts`), tipos incorrectos en hooks de filtros, y acceso incorrecto a propiedades de objetos.

**Cause**: Evolución del código sin actualizar interfaces correspondientes, tipos inferidos incorrectamente por TypeScript, y cambios en estructura de datos sin actualizar consumidores.

**Fix**: Actualización sistemática de interfaces para coincidir con implementaciones reales, uso de aserciones de tipo `any` en casos específicos, corrección de acceso a propiedades anidadas, y cast explícito de tipos literales.

**Prevention**:
- Ejecutar `npm run type-check` frecuentemente durante desarrollo
- Mantener interfaces sincronizadas con implementaciones
- Usar tipos literales específicos en lugar de `string` genérico cuando sea apropiado
- Verificar estructura de datos devueltos por hooks antes de acceder a propiedades

## 2025-09-30 17:25 - Error de mapeo de campos en consultas Supabase

**Issue**: Error de runtime en `/admin/productos` por inconsistencia entre nombres de campos en consulta Supabase (`stock`) y esquema real de base de datos (`stock_quantity`).

**Cause**: La consulta de Supabase seleccionaba el campo `stock` mientras que el esquema de la tabla `product_variants` usa `stock_quantity`, causando que la función `getTotalStock` no pudiera acceder a `variant.stock_quantity`.

**Fix**: Corrección del campo en la consulta de Supabase (línea 62 de `admin/productos/page.tsx`): cambio de `stock` a `stock_quantity` para alinear con el esquema real.

**Prevention**:
- Verificar nombres de campos en migraciones SQL antes de escribir consultas
- Usar herramientas de introspección de esquema para confirmar estructura de tablas
- Mantener consistencia entre definiciones de interfaces TypeScript y esquema de base de datos
- Realizar búsquedas en el codebase para confirmar nombres de campos utilizados en otras partes

## 2025-10-01 02:06 - ERROR CRÍTICO: Asunción incorrecta sobre esquema de base de datos

**Issue**: Error masivo de runtime en toda la aplicación por cambiar referencias de tabla `profiles` a `users` sin verificar que la tabla `users` realmente existiera. Esto causó errores `PGRST205` en middleware, hooks de autenticación, componentes admin y páginas de configuración.

**Cause**: Se asumió incorrectamente que la tabla correcta era `users` basándose en un error inicial, sin verificar primero el esquema real de la base de datos. La tabla `profiles` sí existe y es la correcta, mientras que `users` no existe en el esquema `public`.

**Fix**: 
1. Verificación del esquema real usando script `check-user-tables.js`
2. Reversión completa de todos los cambios: restaurar referencias a `profiles` en:
   - `src/app/auth/actions.ts` (línea 67)
   - `src/app/admin/page.tsx` (línea 130)
   - `src/app/api/debug/auth/route.ts` (línea 67)
   - `src/app/api/debug/test-queries/route.ts` (línea 56)
   - `src/middleware.ts` (línea 65)
   - `src/hooks/use-auth.tsx` (línea 47)
   - `src/components/admin/profile-photo-upload.tsx` (líneas 98, 139)
   - `src/app/admin/configuracion/page.tsx` (línea 72)
   - `src/components/admin/layout/AdminHeader.tsx` (línea 56)
3. Verificación de que TypeScript compile sin errores
4. Confirmación de que el servidor funcione sin errores `PGRST205`

**Prevention**:
- **SIEMPRE verificar el esquema de base de datos ANTES de hacer cambios masivos**
- Usar herramientas de introspección (`npx supabase db inspect` o scripts personalizados)
- Crear documentación precisa del esquema de base de datos
- Implementar un registro de cambios para trackear modificaciones
- No asumir nombres de tablas sin confirmación explícita
- Realizar cambios incrementales y verificar cada paso antes de continuar

## 2025-10-01 12:50 - Warning de múltiples instancias GoTrueClient

**Issue**: Warning en consola del navegador: "Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key."

**Cause**: Múltiples componentes y hooks estaban creando instancias separadas del cliente de Supabase usando `createClient()` en lugar de reutilizar una instancia singleton, causando múltiples instancias de GoTrueClient que comparten el mismo contexto de almacenamiento.

**Fix**: El patrón singleton ya estaba implementado en `/src/lib/supabase/client.ts` con una variable `supabaseInstance` que almacena y reutiliza la misma instancia. El warning se resuelve automáticamente cuando todos los componentes usan la función `createClient()` del archivo centralizado.

**Prevention**:
- **SIEMPRE** importar `createClient` desde `/src/lib/supabase/client.ts` en lugar de crear instancias directas
- No crear múltiples instancias de Supabase en el mismo componente o hook
- Verificar que el patrón singleton esté funcionando correctamente en el archivo client.ts
- Documentar en el README que todos los clientes de Supabase deben usar la función centralizada
- Revisar periódicamente la consola del navegador para detectar warnings similares

## 2025-10-01 20:34 - Error recurrente de chunks de TanStack Query

**Issue**: Error en tiempo de ejecución "Cannot find module './vendor-chunks/@tanstack.js'" al intentar acceder a páginas de productos, especialmente al visualizar productos específicos como "Lory".

**Cause**: Caché corrupto de Next.js que genera chunks malformados o referencias incorrectas a módulos de TanStack Query. Este problema es recurrente y ha ocurrido múltiples veces en el proyecto, sugiriendo un problema sistémico con la gestión de chunks de dependencias grandes como TanStack Query.

**Fix**: Limpieza completa del entorno de desarrollo:
1. Detener servidor de desarrollo (`Ctrl+C` o `npm run stop`)
2. Eliminar caché de Next.js (`rm -rf .next`)
3. Eliminar node_modules (`rm -rf node_modules`)
4. Eliminar package-lock.json (`rm -f package-lock.json`)
5. Reinstalar dependencias (`npm install`)
6. Reiniciar servidor (`npm run dev`)

**Prevention**:
- **NUNCA** modificar configuraciones de `splitChunks` en `next.config.ts` sin documentar el motivo
- Ejecutar limpieza de caché (`rm -rf .next`) cuando aparezcan errores de módulos no encontrados
- Mantener `next.config.ts` simple y dejar que Next.js maneje automáticamente la división de código
- Documentar cualquier cambio en configuraciones de Webpack o bundling
- Crear script automatizado para limpieza completa (`npm run clean:all`)
- Verificar que el problema se resuelva completamente antes de continuar desarrollo