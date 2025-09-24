# Configuración de Desarrollo - Sakú Store

Esta guía te ayudará a configurar el entorno de desarrollo local para Sakú Store.

## Requisitos Previos

### Software Requerido

1. **Node.js** (v18 o superior)

   ```bash
   node --version  # Debe ser v18+
   npm --version   # Debe estar instalado
   ```

2. **Git** (para control de versiones)
   ```bash
   git --version
   ```

### Herramientas Opcionales

- **Supabase CLI** (para gestión de migraciones)

  ```bash
  npm install -g supabase
  ```

- **PowerShell** (Windows - ya incluido)

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd saku-store
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
# Crear archivo de variables de entorno
# Editar .env con tus valores
# Ver sección "Variables de Entorno" más abajo
```

### 4. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Obtener URL y claves del proyecto
3. Configurar en `.env`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
   SUPABASE_SERVICE_ROLE=tu-clave-de-servicio
   ```
4. Aplicar migraciones (si las hay):
   ```bash
   npm run db:migrate
   ```

### 5. Configurar Seguridad (Opcional)

Para habilitar el firewall de desarrollo que solo permite el puerto 3000:

```bash
# Habilitar firewall seguro
npm run security:enable

# Ver estado
npm run security:status

# Deshabilitar cuando termines
npm run security:disable
```

### 6. Iniciar el Servidor de Desarrollo

```bash
# Desarrollo normal
npm run dev

# Desarrollo con seguridad habilitada
npm run dev:secure
```

El sitio estará disponible en: http://localhost:3000

## Variables de Entorno

### Variables Requeridas

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
SUPABASE_SERVICE_ROLE=tu-clave-de-servicio

# Mercado Pago (para testing de pagos)
MP_ACCESS_TOKEN=TEST-tu-access-token

# SMTP (para emails)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@sakulenceria.com
```

### Variables Opcionales

```env
# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789

# Configuración del sitio
NEXT_PUBLIC_SITE_NAME=Sakú Lencería
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Scripts Disponibles

### Desarrollo

```bash
npm run dev              # Servidor de desarrollo
npm run dev:secure       # Desarrollo con firewall
npm run build            # Build de producción
npm run start            # Servidor de producción
npm run preview          # Build + start
```

### Calidad de Código

```bash
npm run lint             # Linter
npm run lint:fix         # Arreglar errores de lint
npm run type-check       # Verificar tipos TypeScript
```

### Base de Datos

```bash
npm run db:migrate       # Aplicar migraciones
npm run db:seed          # Aplicar migraciones + seed
```

### Seguridad

```bash
npm run security:enable  # Habilitar firewall
npm run security:disable # Deshabilitar firewall
npm run security:status  # Ver estado del firewall
```

## Estructura del Proyecto

```
saku-store/
├── src/
│   ├── app/                 # App Router (Next.js 13+)
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y configuración
│   └── types/               # Tipos TypeScript
├── public/                  # Archivos estáticos
├── docs/                    # Documentación
├── scripts/                 # Scripts de automatización
├── supabase/               # Configuración de Supabase
│   ├── migrations/         # Migraciones SQL
│   └── seed.sql           # Datos de prueba
└── tests/                  # Tests E2E y unitarios
```

## Flujo de Desarrollo

### 1. Crear Nueva Feature

```bash
# Crear rama
git checkout -b feature/nueva-funcionalidad

# Desarrollar...
npm run dev

# Verificar calidad
npm run lint
npm run type-check

# Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
```

### 2. Testing

```bash
# Tests unitarios (cuando estén configurados)
npm run test

# Tests E2E (cuando estén configurados)
npm run test:e2e

# Verificar en navegador
# http://localhost:3000
```

### 3. Base de Datos

```bash
# Crear nueva migración
supabase migration new nombre-migracion

# Aplicar migraciones
npm run db:migrate

# Resetear DB con datos de prueba
npm run db:seed
```

## Troubleshooting

### Puerto 3000 Ocupado

```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar proceso (Windows)
taskkill /PID <PID> /F

# O usar otro puerto
npm run dev -- -p 3001
```

### Supabase CLI No Funciona

```bash
# Reinstalar Supabase CLI
npm uninstall -g supabase
npm install -g supabase

# Verificar instalación
supabase --version
```

### Variables de Entorno No Se Cargan

1. Verificar que el archivo se llame `.env` y esté en la raíz del proyecto
2. Reiniciar el servidor de desarrollo
3. Verificar que no haya espacios en las variables
4. Las variables públicas deben empezar con `NEXT_PUBLIC_`

### Firewall Bloquea Conexiones

```bash
# Deshabilitar firewall temporalmente
npm run security:disable

# Verificar estado
npm run security:status
```

## Recursos Útiles

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Soporte

Para dudas o problemas:

1. Revisar esta documentación
2. Buscar en issues del repositorio
3. Crear nuevo issue con detalles del problema
4. Contactar al equipo de desarrollo
