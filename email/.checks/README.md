# Email Quality Checks

Tests automatizados para verificar la calidad de las plantillas de email.

## Tests disponibles

- `width.spec.ts` - Verificación de anchos máximos (680px desktop, 90-96% mobile)
- `preheader.spec.ts` - Validación de preheaders (35-90 caracteres)
- `links.spec.ts` - Verificación de enlaces válidos y UTM tracking
- `overflow.spec.ts` - Tests de overflow horizontal y adaptabilidad

## Ejecutar

```bash
npm run emails:check
```

## Estado

🚧 **Placeholders** - Tests pendientes de implementación completa