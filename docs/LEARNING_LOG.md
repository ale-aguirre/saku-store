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