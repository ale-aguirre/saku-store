# Guía de Contribución - Sakú Store

## Workflow de Ramas

### Estructura de Ramas

- **`main`**: Rama de producción. Solo se actualiza con releases estables.
- **`develop`**: Rama de desarrollo principal. Todas las features se integran aquí.
- **`feature/*`**: Ramas para nuevas funcionalidades.
- **`fix/*`**: Ramas para correcciones de bugs.
- **`hotfix/*`**: Ramas para correcciones urgentes en producción.

### Proceso de Desarrollo

1. **Crear rama desde develop**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrollar y commitear**:
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   ```

3. **Push y Pull Request**:
   ```bash
   git push origin feature/nombre-descriptivo
   ```
   - Crear PR hacia `develop`
   - Solicitar revisión
   - Verificar preview de Vercel

4. **Merge y limpieza**:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/nombre-descriptivo
   ```

### Reglas Importantes

- ❌ **NO hacer push directo a `main` o `develop`**
- ✅ **Siempre trabajar en ramas feature/fix**
- ✅ **Usar Conventional Commits**
- ✅ **Verificar preview antes de mergear**
- ✅ **Eliminar ramas después del merge**

### Tipos de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Cambios de formato
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Release Process

1. Merge `develop` → `main`
2. Tag con versión SemVer (`vX.Y.Z`)
3. Deploy automático a producción