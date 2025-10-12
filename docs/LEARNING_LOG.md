# Learning Log - Sakú Lencería

### 2025-01-02 - INCIDENTE CRÍTICO: Borrado completo de base de datos por feature innecesaria

**Issue**: Se solicitó hacer la imagen del hero editable desde el admin. Durante la implementación se causó un borrado completo de la base de datos de producción, perdiendo todos los datos de productos, usuarios, órdenes, etc.

**Cause**: 
- Feature innecesaria: el hero ya funcionaba perfectamente con imagen estática
- Sobreingeniería: intentar hacer editable algo que no lo requería
- Falta de backup antes de cambios estructurales
- Aplicación de migraciones destructivas sin verificación previa
- No considerar el impacto vs beneficio de la feature

**Fix**: 
- Restauración completa de la base de datos desde backup
- Recreación de todas las tablas, datos de productos, usuarios de prueba
- Reconfiguración de RLS policies
- Descarte completo de la feature de hero editable
- Vuelta a imagen estática en el hero

**Prevention**: 
- NUNCA implementar features que no aporten valor real al negocio
- SIEMPRE hacer backup completo antes de cambios estructurales
- Cuestionar la necesidad real de cada feature solicitada
- Usar entornos de desarrollo/staging para cambios riesgosos
- Documentar el costo/beneficio antes de implementar features "nice to have"
- Mantener el principio KISS (Keep It Simple, Stupid)

### 2025-10-08 - Error "bucket not found" al subir imágenes del hero

**Issue**: Error "bucket not found" al intentar cambiar la imagen del hero desde la página de administración de contenido del home.

**Cause**: 
- El código en `contenido-home/page.tsx` intentaba usar un bucket llamado 'images' que no existía en Supabase Storage
- Solo existían los buckets 'products' y 'avatars' configurados en migraciones anteriores
- La función `handleImageUpload` hacía upload manual en lugar de usar la función centralizada de `storage.ts`

**Fix**: 
- Creación de nueva migración SQL `20250201000001_add_home_images_storage.sql` para bucket 'images'
- Aplicación de migración con políticas de acceso público para lectura y autenticado para escritura
- Actualización de tipos en `storage.ts` para incluir 'images' en `uploadImage`, `deleteImage` y `uploadMultipleImages`
- Refactorización de `handleImageUpload` para usar la función centralizada `uploadImage()`

**Prevention**: 
- Verificar que los buckets de Supabase Storage existan antes de usarlos en el código
- Usar siempre las funciones centralizadas de `storage.ts` en lugar de implementar upload manual
- Documentar en `LEARNING_LOG.md` los buckets disponibles y sus propósitos específicos
- Crear migraciones para nuevos buckets antes de implementar funcionalidades que los requieran

### 2025-10-10 - Configuración Jest/Vitest mezclada y formato de precios inconsistente

**Issue**: 
- Tests unitarios fallaban con errores de `describe`, `it`, `expect` no definidos
- Formato de precios inconsistente: formulario nuevo producto multiplicaba por 100 en lugar de 100000
- UX confusa en input de precio con step="0.01" sugiriendo centavos

**Cause**: 
- Configuración de testing mezclada: archivos de test usaban Jest pero dependencias eran Vitest
- Faltaba configuración completa de Vitest (vitest.config.ts, setup.ts, tipos en tsconfig)
- Inconsistencia en multiplicación de precios entre diferentes partes de la aplicación
- Input de precio diseñado para centavos cuando la aplicación maneja pesos enteros

**Fix**: 
- Migración completa Jest → Vitest: `jest.mock` → `vi.mock`, `jest.fn()` → `vi.fn()`
- Creación de `vitest.config.ts` con configuración jsdom, globals y setupFiles
- Instalación de `@testing-library/dom` y configuración en `tests/setup.ts`
- Corrección de multiplicación en formulario nuevo producto: ×100 → ×100000
- Mejora UX input precio: step="1", placeholder="15000", label claro
- Mock completo de IntersectionObserver para evitar errores en tests

**Prevention**: 
- Mantener consistencia en herramientas de testing: usar solo Vitest o solo Jest
- Verificar que todos los archivos de configuración estén alineados (package.json, tsconfig, vitest.config)
- Documentar el formato de precios en la aplicación (centavos vs pesos) y mantener consistencia
- Crear mocks completos de APIs del navegador para entornos de test
- Verificar que build y type-check pasen antes de considerar una tarea completada

### 2025-10-09 - Filtrado de categorías no funcionaba por discrepancia slug vs ID

**Issue**: El filtrado de categorías desde el home no funcionaba. Los enlaces usaban slugs (ej: `categoria=conjuntos`) pero el código filtraba por `category_id` (UUID), causando que no se mostraran productos filtrados.

**Cause**: 
- Discrepancia entre la interfaz (que usa slugs legibles) y la lógica de filtrado (que espera UUIDs)
- Productos sin `category_id` asignado (muchos tenían `null`)
- Falta de conversión entre slug y ID en la página de productos
- No se había verificado que todos los productos tuvieran categorías asignadas

**Fix**: 
- Modificación de `src/app/productos/page.tsx` para convertir slugs a IDs usando `getCategories()`
- Script de actualización masiva que asignó categorías a todos los productos basado en keywords
- Agregadas categorías "Promo" y "Oferta" para futuras promociones
- Verificación end-to-end con curl y script de testing

**Prevention**: 
- Siempre verificar que los datos de referencia (categorías) estén completos antes de implementar filtros
- Mantener consistencia entre URLs amigables (slugs) y lógica interna (IDs)
- Crear scripts de verificación para detectar datos faltantes en relaciones importantes
- Probar filtros end-to-end desde la interfaz de usuario, no solo la API

### 2025-10-08 - Corrección de errores ESLint y dependencias de useEffect

**Issue**: Errores de ESLint por imports no utilizados y warning de dependencias faltantes en useEffect que causaba referencias circulares.

**Cause**: 
- Imports de tipos TypeScript (`Tables`, `HomeSection`, `CopyBlock`) definidos pero no utilizados
- useEffect usando valores del estado (`heroData`) dentro del efecto pero sin incluirlos en dependencias
- Uso de `<img>` en lugar de `<Image>` de Next.js en componentes admin
- Migración incompleta de sistema de toast de `use-toast` a `sonner`

**Fix**: 
- Eliminación de imports no utilizados en `page.tsx` y `enhanced-hero.tsx`
- Refactorización del useEffect usando constantes por defecto para evitar dependencias circulares
- Reemplazo de `<img>` con `<Image>` incluyendo propiedades `width` y `height`
- Migración completa de `toast({})` a `toast.success()` y `toast.error()` de sonner

**Prevention**: 
- Ejecutar ESLint regularmente durante el desarrollo para detectar imports no utilizados
- Usar constantes por defecto fuera del componente para valores que se usan en useEffect
- Preferir siempre `<Image>` de Next.js sobre `<img>` para optimización automática
- Verificar la consistencia del sistema de notificaciones en toda la aplicación antes de hacer cambios

### 2025-10-08 - Optimización de layout basada en feedback del usuario

**Issue**: El hero inicial ocupaba solo 50% del ancho en desktop y el grid de categorías usaba layout de 3 columnas que no destacaba suficientemente cada categoría.

**Cause**: 
- Layout del hero con `grid-cols-2` daba igual peso al contenido y la imagen
- Grid de categorías con `grid-cols-3` creaba cards pequeñas que no permitían títulos prominentes
- Aspect ratio cuadrado en categorías no aprovechaba el espacio horizontal disponible

**Fix**: 
- Cambio del hero a `grid-cols-5` con imagen ocupando 3/5 del espacio (60%)
- Rediseño del grid a layout vertical con `space-y-8` para categorías una debajo de otra
- Aspect ratio cinematográfico `16:6-24:6` para cards más anchas y impactantes
- Títulos centrados con tamaños `3xl-5xl` para mayor prominencia visual
- Overlay gradiente mejorado para mejor legibilidad del texto

**Prevention**: 
- Considerar el impacto visual relativo entre contenido e imágenes en layouts
- Priorizar la legibilidad y prominencia de elementos clave como títulos
- Usar aspect ratios que aprovechen mejor el espacio disponible
- Solicitar feedback temprano sobre proporciones y jerarquía visual

### 2025-10-08 - Extensiones incorrectas en archivos SVG

**Issue**: Error de sintaxis en el navegador al cargar la página después de crear imágenes SVG con extensión `.webp` en lugar de `.svg`.

**Cause**: 
- Creación de archivos SVG con contenido vectorial pero extensión `.webp`
- El navegador intentaba interpretar contenido SVG como imagen WebP
- Inconsistencia entre el tipo de contenido (SVG) y la extensión del archivo

**Fix**: 
- Renombrado de todos los archivos de `*.webp` a `*.svg` en `public/categories/`
- Actualización del mapeo de imágenes en `CategoryGrid` para usar extensiones `.svg`
- Verificación de que el contenido coincida con la extensión del archivo

**Prevention**: 
- Siempre verificar que la extensión del archivo coincida con su contenido real
- Usar herramientas de validación para archivos SVG antes de guardarlos
- Establecer convenciones claras para nombres y extensiones de archivos de imágenes
- Revisar el navegador inmediatamente después de crear nuevos assets

### 2025-10-06 - Corrección Masiva de Tipos TypeScript

**Issue**: 14 errores de TypeScript distribuidos en 7 archivos del panel admin debido a tipos locales duplicados y propiedades faltantes.

**Cause**: 
- Definición de tipos locales que duplicaban tipos canónicos
- Inicialización incompleta de objetos complejos (`productForForm`, `newVariant`)
- Incompatibilidades entre tipos de Supabase y tipos de aplicación

**Fix**: 
- Eliminación de tipos locales y uso de tipos canónicos desde `@/types/catalog`
- Inicialización completa de objetos con todas las propiedades requeridas
- Aplicación de casts temporales `as unknown as Type` para incompatibilidades

**Prevention**: 
- Siempre usar tipos canónicos desde `@/types/catalog` en lugar de definir tipos locales
- Verificar que objetos complejos incluyan todas las propiedades requeridas al inicializar
- Ejecutar `npm run type-check` frecuentemente durante el desarrollo
- Considerar crear tipos de utilidad para inicialización de objetos complejos

## 2023-11-15 - Error de nombre de bucket incorrecto en Supabase Storage

**Issue**: Fallo al guardar imágenes en Supabase Storage debido a que el código intentaba usar un bucket llamado "product-images" cuando el bucket correcto configurado en Supabase es "products".

**Cause**: Inconsistencia entre el nombre del bucket configurado en Supabase ("products") y el nombre utilizado en el código ("product-images") en la función `uploadImage` de `storage.ts`.

**Fix**:

1. Corrección del nombre del bucket en `src/lib/storage.ts` de "product-images" a "products"
2. Verificación de consistencia en el componente `ImageUpload.tsx` para usar el mismo bucket
3. Prueba exitosa de carga de imágenes al bucket correcto

**Prevention**:

- Documentar explícitamente los nombres de buckets de Supabase en la documentación del proyecto
- Centralizar la configuración de nombres de buckets en constantes o variables de entorno
- Implementar verificación de existencia de buckets antes de intentar operaciones
- Añadir tests automatizados para verificar la configuración de Storage

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

## 2025-10-02 17:49 - Problema completo de imágenes de productos: desde datos faltantes hasta CSS mal aplicado

**Issue**: Problema multifacético con imágenes de productos que evolucionó en varias etapas:

1. **Inicialmente**: Imágenes no se mostraban en NINGUNA parte de la aplicación (ni `/admin/productos` ni `/productos`)
2. **Problema de datos**: 51 de 52 productos tenían `images: null` en la base de datos
3. **Problema de configuración**: Faltaba configuración de hostname de Supabase en `next.config.ts` para `next/image`
4. **Problema de CSS**: Después de resolver los datos y configuración, las imágenes funcionaban en `/admin/productos` pero seguían invisibles en `/productos` y `/productos/[slug]`

**Cause**: Múltiples causas que se fueron resolviendo secuencialmente:

1. **Datos faltantes**: La mayoría de productos no tenían URLs de imágenes guardadas en la base de datos
2. **Configuración de Next.js**: El hostname de Supabase Storage (`yhddnpcwhmeupwsjkchb.supabase.co`) no estaba configurado en `images.remotePatterns` de `next.config.ts`
3. **CSS mal aplicado**: En el componente `ProductImage`, las clases `object-cover` y `transition-transform` se aplicaban al contenedor `div` en lugar del elemento `Image` de Next.js cuando se usaba `fill={true}`

**Fix**: Proceso de resolución en múltiples etapas:

**Etapa 1 - Diagnóstico de datos**:

1. **Script de debug**: Se creó `debug-product-images.js` para verificar datos de la base de datos
2. **Hallazgo**: 51 de 52 productos tenían `images: null`, solo "Lory" tenía imagen válida
3. **Conclusión inicial**: Se pensó que era un problema de datos faltantes

**Etapa 2 - Configuración de Next.js**:

1. **Error de hostname**: Next.js mostraba error de hostname no configurado para Supabase Storage
2. **Fix de configuración**: Se agregó el hostname de Supabase en `next.config.ts`:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: "https",
         hostname: "yhddnpcwhmeupwsjkchb.supabase.co",
         pathname: "/storage/v1/object/public/**",
       },
     ];
   }
   ```

**Etapa 3 - Identificación del patrón CSS**:

1. **Observación clave**: Después de los fixes anteriores, las imágenes funcionaban en `/admin/productos` pero NO en `/productos`
2. **Hipótesis**: El problema no era de datos ni configuración, sino de CSS/rendering
3. **Investigación**: Se comparó cómo se usaba `ProductImage` en admin vs frontend

**Etapa 4 - Corrección del CSS**:

1. **Problema identificado**: Las clases CSS se aplicaban al contenedor en lugar del elemento `Image`
2. **Solución**: Se modificó `ProductImage` para separar `className` en `containerClasses` e `imageClasses`:

   ```tsx
   // ANTES (incorrecto)
   <div className={cn("relative overflow-hidden", className)}>
     <Image src={src} alt={alt} fill sizes={sizes} />
   </div>

   // DESPUÉS (correcto)
   <div className={cn("relative overflow-hidden", containerClasses)}>
     <Image
       src={src}
       alt={alt}
       fill
       sizes={sizes}
       className={cn("object-cover transition-transform", imageClasses)}
     />
   </div>
   ```

**Prevention**:
- **Diagnóstico sistemático**: Cuando las imágenes no funcionan, verificar en orden: 1) Datos en DB, 2) Configuración de Next.js, 3) CSS/rendering
- **Scripts de debug**: Crear herramientas de verificación de datos para descartar problemas de backend antes de investigar frontend
- **Configuración de hostnames**: Siempre configurar `images.remotePatterns` en `next.config.ts` ANTES de usar imágenes externas con `next/image`
- **Testing en múltiples contextos**: Si un componente funciona en una página pero no en otra, investigar diferencias de CSS/props antes de asumir problemas de datos
- **CSS en `next/image`**: Cuando se usa `fill={true}`, las clases de estilo de imagen (`object-cover`, `transition-transform`) deben aplicarse al componente `Image`, no al contenedor
- **Separar responsabilidades**: Distinguir claramente entre estilos de contenedor (`relative`, `overflow-hidden`) y estilos de imagen (`object-cover`, `transition-transform`)
- **Documentar configuraciones**: Mantener registro de hostnames configurados y dependencias de imágenes externas
- **Proceso incremental**: Resolver problemas uno a la vez y verificar cada fix antes de continuar con el siguiente

### 2025-01-11 - Error de clave duplicada al editar productos (slug constraint)

**Issue**: Error persistente "duplicate key value violates unique constraint products_slug_key" al intentar guardar cambios en productos existentes desde el panel de administración.

**Cause**: 
- La función `updateProduct` generaba un nuevo slug basado en el nombre del producto sin verificar si ya existía en la base de datos
- Cuando el slug generado coincidía con uno existente (de otro producto), se violaba la constraint de unicidad
- La lógica del frontend intentaba preservar el slug existente, pero fallaba cuando el slug era nulo o el nombre cambiaba
- No había verificación de unicidad antes de asignar un slug a un producto

**Fix**: 
- Implementación de función `generateUniqueSlug()` en `actions.ts` que verifica la unicidad en la base de datos
- Sistema de contadores automático: si un slug existe, agrega `-1`, `-2`, etc. hasta encontrar uno único
- Lógica mejorada en `updateProduct()` para preservar slugs existentes cuando es posible
- Simplificación del frontend eliminando la generación manual de slug, delegando toda la lógica al backend
- Exclusión del producto actual en las verificaciones de unicidad para permitir actualizaciones sin cambio de slug

**Prevention**: 
- **Verificar unicidad en el backend**: Nunca confiar en que el frontend genere valores únicos para constraints de base de datos
- **Sistemas de fallback**: Implementar contadores automáticos o sufijos únicos cuando se detecten duplicados
- **Separar responsabilidades**: El frontend envía datos, el backend garantiza la integridad y unicidad
- **Testing con datos reales**: Probar con bases de datos que contengan múltiples registros para detectar conflictos de unicidad
- **Preservar datos existentes**: Cuando sea posible, mantener valores existentes en lugar de regenerarlos

### 2025-01-11 - Superposición de errores en componente de carga de imágenes

**Issue**: Los botones de eliminar y drag handle desaparecían cuando una imagen fallaba al cargar, y el estado de error persistía incorrectamente al reordenar o eliminar imágenes.

**Cause**: 
- El manejador de errores reemplazaba todo el contenido del contenedor de imagen, eliminando los controles de gestión
- El estado de error se manejaba a nivel de componente padre en lugar de por imagen individual
- Falta de reset del estado de error cuando cambiaba la prop `image`, causando que errores persistieran en imágenes nuevas
- El placeholder de error se superponía a imágenes válidas después de reordenamientos

**Fix**: 
- Implementación de estado local `hasError` en cada `SortableImageItem` individual
- Agregado de `useEffect` que resetea automáticamente `hasError` cuando cambia la prop `image`
- Renderizado condicional que mantiene los controles (botones eliminar, drag handle) visibles independientemente del estado de error
- Manejadores simplificados `onError` y `onLoad` que solo afectan el estado de la imagen específica

**Prevention**: 
- **Estado local por elemento**: Manejar estados de error a nivel de elemento individual, no a nivel de lista o contenedor
- **Reset automático**: Implementar `useEffect` para limpiar estados cuando cambien las props relevantes
- **Controles siempre accesibles**: Nunca reemplazar completamente el contenido de un elemento que contiene controles de gestión
- **Testing de casos edge**: Probar comportamiento con imágenes que fallan al cargar, reordenamientos y eliminaciones
- **Separar presentación de funcionalidad**: Los errores de presentación (imagen no carga) no deben afectar la funcionalidad (eliminar, reordenar)
