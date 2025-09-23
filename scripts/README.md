# Scripts de Sakú Store

## notify-completion.js

Script para enviar notificaciones por email sobre el estado de las tareas completadas.

### Configuración

Agregar las siguientes variables de entorno al archivo `.env`:

```env
# Configuración SMTP para notificaciones
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@saku-store.com
```

### Uso

#### Uso básico (ejemplo incluido):
```bash
npm run notify
```

#### Uso programático:
```javascript
const { TaskNotifier, TASK_STATUS } = require('./notify-completion');

const notifier = new TaskNotifier();

// Agregar tareas
notifier.addTask('Migración de DB', TASK_STATUS.COMPLETED, 'Todas las tablas creadas');
notifier.addTask('Deploy', TASK_STATUS.ERROR, 'Error en build', new Error('Build failed'));
notifier.addTask('Tests', TASK_STATUS.PENDING, 'Esperando CI/CD');

// Enviar notificación
await notifier.finish();
```

### Estados de tareas

- `COMPLETED`: Tarea completada exitosamente
- `ERROR`: Tarea falló con error
- `PENDING`: Tarea pendiente de completar
- `IN_PROGRESS`: Tarea en progreso

### Características

- ✅ Envío de email HTML con resumen detallado
- 📄 Respaldo local en formato JSON (`/reports/`)
- 🎨 Diseño responsive con colores de marca Sakú
- ⏱️ Tracking de tiempo de ejecución
- 🔍 Detalles de errores y logs

### Estructura del email

- **Resumen ejecutivo**: Estadísticas generales
- **Tareas completadas**: Lista con detalles y timestamps
- **Tareas con errores**: Información de fallos
- **Tareas pendientes**: Items por completar
- **Detalles de errores**: Stack traces y mensajes

### Notas de seguridad

- Usar App Passwords para Gmail (no contraseña principal)
- No commitear credenciales SMTP al repositorio
- Los reportes locales no contienen información sensible