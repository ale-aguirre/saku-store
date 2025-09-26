# LEARNING LOG — Pitfalls & Prevention

## 2025-09-23 — Setup inicial de documentación

- **Issue**: Configuración de archivos de documentación para tracking de progreso y aprendizajes
- **Cause**: Necesidad de establecer disciplina de documentación desde el inicio del proyecto
- **Fix**: Creación de ROADMAP.md y LEARNING_LOG.md con estructuras definidas
- **Prevention**: Mantener actualizados ambos archivos en cada tarea, usar formato consistente

---

## 2025-09-23 — Puerto 3000 ocupado durante tests
- Issue: Tests e2e no pueden usar puerto 3000, usan 3001 automáticamente
- Cause: Proceso 29376 mantiene puerto 3000 ocupado (posiblemente dev server anterior)
- Fix: Playwright automáticamente usa puerto 3001 cuando 3000 está ocupado
- Prevention: Verificar `netstat -ano | findstr :3000` y terminar procesos innecesarios antes de tests

## 2025-09-23 — Script notify:done configurado y corregido
- Issue: `npm run notify:done` falla porque el script no estaba en package.json y tenía múltiples errores
- Causa: Script no configurado en package.json principal, error en notify-completion.js, falta SMTP_SECURE, conflicto ES modules/CommonJS, y dominio no verificado en Brevo
- Fix: 
  1. Agregado script en package.json
  2. Corregido error de nodemailer en notify-completion.js
  3. Agregado SMTP_SECURE=false al .env
  4. Convertido script de ES modules a CommonJS (.cjs)
  5. Corregido configuración SMTP para usar variables de entorno
  6. **Cambiado SMTP_FROM de noreply@sakulenceria.com a aguirrealexis.cba@gmail.com** (dominio verificado)
- Prevention: Verificar que scripts estén en package.json, probar antes de usar, mantener consistencia en sintaxis de módulos, y **usar solo dominios verificados en el proveedor SMTP**

## 2025-09-24 — Script de notificación ejecutando comandos undefined

- **Issue**: Script `notify:done` ejecutaba comandos `undefined` al final, causando confusión en el output
- **Cause**: Función `getGitInfo()` usaba `executeCommand()` que está diseñada para agregar tareas al array, no para comandos simples. Además, parsing incorrecto de argumentos en función `main` con incremento `i += 6` accediendo a índices fuera de rango
- **Fix**: 
  1. Creada función `executeSimpleCommand()` separada para comandos git sin agregar tareas
  2. Corregido parsing de argumentos en `main()` con incremento `i++` y validación `i + 3 < args.length`
  3. Eliminada función `runAutoDetection()` duplicada que iteraba incorrectamente sobre objeto
  4. Mejorados timeouts y patrones de éxito/fallo en `notification-config.json`
- **Prevention**: Separar comandos utilitarios (git info) de comandos de verificación (que agregan tareas). Validar rangos de arrays antes de acceder a índices. Probar scripts después de cada cambio

## 2025-09-23 — Error de build por cache corrupto de Next.js

- **Issue**: `npm run build` falla con error "Html should not be imported outside of pages/_document" sin imports visibles de Html en el código
- **Cause**: Cache corrupto de Next.js (.next directory) mantenía referencias incorrectas a imports de Html que ya no existen
- **Fix**: Limpiar cache con `rm -rf .next` antes de `npm run build`
- **Prevention**: Cuando aparezcan errores de build inexplicables relacionados con imports, limpiar cache de Next.js como primer paso de debugging

## 2025-09-26 — Problema de carga inicial de productos en hidratación

- **Issue**: La página `/productos` fallaba durante la carga inicial con errores de hidratación, especialmente cuando `getProducts` verificaba variables de entorno en el lado del cliente
- **Cause**: La función `getProducts` intentaba acceder a variables de entorno de Supabase durante la hidratación del cliente, cuando estas pueden no estar disponibles o tener valores "placeholder". Además, falta de manejo robusto de estados de carga y errores de tipos en tests E2E
- **Fix**: 
  1. Agregado estado `mounted` para evitar problemas de hidratación y habilitar `useQuery` solo cuando el componente está montado
  2. Verificación de disponibilidad de variables de Supabase antes de crear cliente, con manejo de valores "placeholder"
  3. Mejora de estados de carga con esqueleto inicial y mensajes de error detallados con botón de reintento
  4. Corrección de referencias inconsistentes `stock` → `stock_quantity` en ProductStockManager
  5. Corrección de errores de tipo `unknown` en catch blocks usando `e instanceof Error ? e.message : String(e)`
- **Prevention**: Siempre verificar disponibilidad de variables de entorno antes de crear clientes en el lado del cliente. Usar estado `mounted` para componentes que dependen de hidratación. Mantener consistencia en nombres de propiedades entre interfaces TypeScript y uso real. Usar manejo de tipos robusto en catch blocks para evitar errores de `unknown`

## 2025-01-25 — Error de next/image con URLs externas de placeholder

- **Issue**: Error "Invalid src prop on next/image, hostname 'via.placeholder.com' is not configured under images in your next.config.js"
- **Cause**: Scripts de importación asignaron URLs externas de Unsplash/placeholder a productos, pero next/image requiere configuración explícita de dominios externos
- **Fix**: 
  1. Limpieza de URLs externas de la base de datos con script `fix-external-placeholder-urls.js`
  2. Creación de componente `ProductImage` con fallback automático a SVG dinámico
  3. Reemplazo de `next/image` por `ProductImage` en todos los componentes
  4. Placeholder SVG generado con colores de marca y nombre del producto
- **Prevention**: No usar URLs externas para placeholders. Implementar sistema de fallback interno desde el inicio. Centralizar lógica de imágenes en un componente reutilizable

## 2025-09-25 — Inconsistencia en tipos de retorno del hook useAuth

- **Issue**: Errores TypeScript en componentes de autenticación donde `signUp`, `signIn` esperaban `{ success: boolean; error?: string }` pero el hook retornaba `{ error: any }`
- **Cause**: Desalineación entre la interfaz `AuthContextType` y la implementación real de los métodos de autenticación. Los componentes fueron desarrollados esperando un formato de respuesta diferente al implementado
- **Fix**: 
  1. Actualizada interfaz `AuthContextType` para retornar `{ success: boolean; error?: string }`
  2. Modificadas implementaciones de `signUp`, `signIn`, `resetPassword` para retornar formato consistente
  3. Eliminado código duplicado de creación de perfil en página de registro (ya manejado por trigger)
  4. Agregado componente Avatar faltante con `npx shadcn@latest add avatar`
  5. Limpiado cache `.next` y regenerado tipos con `npm run build`
- **Prevention**: Definir contratos de tipos antes de implementar. Mantener consistencia entre interfaces TypeScript y implementaciones. Verificar que componentes dependientes usen el mismo formato de respuesta

## 2025-09-24 — Errores de tipos TypeScript con Supabase en componentes de administración

- **Issue**: Errores `TS2345` donde `any` no es asignable a `never` en operaciones `update` e `insert` de Supabase, especialmente en componentes de administración
- **Cause**: Los tipos generados automáticamente por Supabase son muy estrictos y a veces infieren tipos `never` para operaciones que deberían ser válidas. Los tipos auxiliares en `supabase-helpers.ts` no resolvían el problema correctamente
- **Fix**: 
  1. Eliminación del archivo `src/types/supabase-helpers.ts` con tipos auxiliares problemáticos
  2. Creación de `src/lib/supabase/admin-client.ts` con función `createAdminClient()` que retorna un cliente sin tipado estricto
  3. Actualización de todos los componentes de administración para usar `createAdminClient()` en lugar de `createClient()`
  4. Eliminación de directivas `@ts-expect-error` innecesarias una vez resueltos los tipos
- **Prevention**: Para operaciones de administración que requieren flexibilidad de tipos, usar un cliente de Supabase sin tipado estricto. Mantener el cliente tipado para operaciones de frontend donde la seguridad de tipos es más importante

## 2025-09-24 — Errores de ESLint por uso de <a> en lugar de Link

- **Issue**: ESLint reporta errores `@next/next/no-html-link-for-pages` por usar etiquetas `<a>` para navegación interna en lugar de componentes `Link` de Next.js
- **Cause**: Páginas creadas manualmente usaban etiquetas HTML `<a href="/ruta">` en lugar del componente `Link` optimizado de Next.js
- **Fix**: 
  1. Importar `Link` de `next/link` en cada archivo
  2. Reemplazar `<a href="/ruta">` por `<Link href="/ruta">`
  3. Mantener las clases CSS en el componente `Link`
- **Prevention**: Siempre usar `Link` de Next.js para navegación interna. Reservar `<a>` solo para enlaces externos. Configurar snippet/template que incluya import de Link automáticamente

## 2025-09-24 — Variables importadas pero no utilizadas en componentes

- **Issue**: ESLint reporta `@typescript-eslint/no-unused-vars` por imports de componentes/iconos que no se usan en el JSX final
- **Cause**: Durante desarrollo se importan componentes que luego se eliminan o comentan, pero el import queda
- **Fix**: Eliminar imports no utilizados sistemáticamente antes de commit
- **Prevention**: Usar extensión de VS Code que resalte imports no utilizados. Ejecutar `npm run lint` antes de cada commit para detectar temprano

## 2025-01-15 — Script notify-completion ejecutando comandos npm desde subdirectorio

- **Issue**: Confusión sobre si el script `notify-completion.cjs` puede ejecutar comandos `npm` desde su ubicación en `/scripts/` y si necesita moverse a la raíz del proyecto
- **Cause**: Malentendido sobre cómo funciona `process.cwd()` y el directorio de trabajo cuando se ejecuta un script desde package.json
- **Fix**: 
  1. Confirmado que el script se ejecuta desde la raíz del proyecto (`npm run notify:done` → `node scripts/notify-completion.cjs`)
  2. `execSync` ya usa `cwd: process.cwd()` que apunta a la raíz del proyecto
  3. Implementada función `runQualityChecks()` que ejecuta ESLint, TypeScript y Build automáticamente
  4. Optimizado `autoDetectProjectStatus()` para evitar duplicación de verificaciones de calidad
  5. Agregado seguimiento de duración por comando y actualización de templates HTML
- **Prevention**: Recordar que `process.cwd()` siempre apunta al directorio desde donde se ejecuta el comando npm, no donde está ubicado el archivo del script. Los scripts en subdirectorios pueden ejecutar comandos npm sin problemas si se configuran correctamente

---

## Template para futuras entradas

```markdown
## YYYY-MM-DD — <título corto>

- **Issue**: <qué pasó>
- **Cause**: <causa raíz>
- **Fix**: <cómo se resolvió>
- **Prevention**: <regla/check para evitarlo>
```

---

## Reglas de uso

1. **Agregar entrada cada vez que**:
   - Aparezca un error repetible (permisos, rutas, envs, previews, etc.)
   - Se optimice un flujo (orden de scripts, configuraciones, etc.)
   - Se descubra una mejor práctica o patrón

2. **Formato consistente**:
   - Fecha en formato YYYY-MM-DD
   - Título descriptivo y conciso
   - Issue/Cause/Fix/Prevention claramente separados

3. **Enfoque en prevención**:
   - Cada entrada debe incluir cómo evitar el problema en el futuro
   - Documentar checks, reglas o procesos que ayuden
   - Mantener actualizado con nuevos hallazgos