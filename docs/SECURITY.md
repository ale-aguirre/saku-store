# Configuración de Seguridad - Sakú Store

## Seguridad de Red en Desarrollo

### Configuración de Firewall

Para garantizar que solo el puerto 3000 esté disponible durante el desarrollo:

#### Windows (PowerShell como Administrador)

```powershell
# Habilitar configuración de seguridad
.\scripts\setup-dev-firewall.ps1 -Enable

# Ver estado actual
.\scripts\setup-dev-firewall.ps1 -Status

# Deshabilitar (al finalizar desarrollo)
.\scripts\setup-dev-firewall.ps1 -Disable
```

#### Configuración Manual

Si prefieres configurar manualmente:

```powershell
# Habilitar firewall
netsh advfirewall set allprofiles state on

# Bloquear conexiones entrantes por defecto
netsh advfirewall set allprofiles firewallpolicy blockinbound,allowoutbound

# Permitir solo puerto 3000
netsh advfirewall firewall add rule name="Saku Dev - Next.js" dir=in action=allow protocol=TCP localport=3000
```

### Configuración de Next.js

El archivo `next.config.js` incluye:

- **Headers de seguridad**: X-Frame-Options, X-Content-Type-Options, etc.
- **Restricción de host**: Solo localhost permitido en desarrollo
- **Puerto fijo**: Forzar puerto 3000 en desarrollo
- **Imágenes seguras**: Solo localhost:3000 en desarrollo

### Variables de Entorno Seguras

#### ✅ Variables Públicas (NEXT_PUBLIC_*)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
```

#### 🔒 Variables Privadas (Solo servidor)
```env
SUPABASE_SERVICE_ROLE=your-service-role-key
MP_ACCESS_TOKEN=your-mercadopago-token
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sakulenceria.com
```

### Checklist de Seguridad

#### Desarrollo
- [ ] Firewall configurado (solo puerto 3000)
- [ ] Variables de entorno en `.env.local`
- [ ] No commits de secrets
- [ ] Headers de seguridad activos
- [ ] Solo localhost permitido

#### Producción
- [ ] Variables en Vercel/plataforma
- [ ] HTTPS habilitado
- [ ] CSP configurado
- [ ] RLS habilitado en Supabase
- [ ] Validación con Zod en todas las entradas

### Puertos Bloqueados en Desarrollo

Los siguientes puertos están explícitamente bloqueados:
- 3001, 3002, 3003 (otros servidores Next.js)
- 4000 (GraphQL común)
- 5000 (Flask/Python común)
- 5173 (Vite)
- 8000, 8080, 8081 (servidores web comunes)
- 9000 (otros servicios)

### Comandos Útiles

```powershell
# Verificar puertos abiertos
netstat -an | findstr :3000

# Ver reglas de firewall activas
netsh advfirewall firewall show rule name=all | findstr "Saku"

# Verificar conexiones activas
netstat -b | findstr :3000
```

### Troubleshooting

#### El servidor no inicia en puerto 3000
```bash
# Verificar si el puerto está ocupado
netstat -ano | findstr :3000

# Matar proceso si es necesario
taskkill /PID <PID> /F
```

#### Firewall bloquea conexiones legítimas
```powershell
# Deshabilitar temporalmente
.\scripts\setup-dev-firewall.ps1 -Disable

# Verificar configuración
.\scripts\setup-dev-firewall.ps1 -Status
```

#### No se puede acceder desde otros dispositivos
Esto es **intencional** en desarrollo. Para testing en dispositivos móviles:

1. Deshabilitar firewall temporalmente
2. Usar herramientas como ngrok para túneles seguros
3. Configurar red local específica

### Contacto

Para dudas sobre seguridad, consultar con el equipo de desarrollo o revisar la documentación de Next.js y Vercel.