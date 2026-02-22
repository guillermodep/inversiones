# Desarrollo Local con Netlify Dev

Para que el desarrollo local funcione **exactamente igual** que en Netlify (producción), usa **Netlify Dev** en lugar de `npm run dev`.

## 🚀 Inicio Rápido

### Ejecutar con Netlify Dev
```bash
npm run dev:netlify
```

**Nota:** La primera vez descargará Netlify CLI automáticamente con `npx`.

Esto iniciará:
- ✅ Vite dev server en el puerto que elijas (ej: 5173)
- ✅ Netlify Functions localmente en `/.netlify/functions/*`
- ✅ Mismo comportamiento que producción

## 📊 Diferencias entre modos

### `npm run dev` (Vite solo)
- ❌ Usa proxy de Vite (`/api/yahoo`) 
- ❌ Peticiones directas a Yahoo Finance desde el navegador
- ❌ Errores 429 (Too Many Requests)
- ❌ Datos pueden fallar o mostrar N/A

### `npm run dev:netlify` (Netlify Dev) ⭐ **RECOMENDADO**
- ✅ Usa Netlify Functions (`/.netlify/functions/*`)
- ✅ Peticiones desde servidor local (igual que producción)
- ✅ Sin errores 429
- ✅ Datos reales de Yahoo Finance
- ✅ **Funciona exactamente igual que Netlify**

## 🔧 Configuración

Netlify Dev detecta automáticamente:
- Puerto de Vite (configurado en `vite.config.ts`)
- Netlify Functions (carpeta `netlify/functions/`)
- Variables de entorno (archivo `.env`)

## 📝 Notas

- **Primera vez:** Netlify Dev puede pedirte autorizar la aplicación
- **Puerto:** Por defecto usa el puerto 8888, pero puedes cambiarlo
- **Hot reload:** Funciona igual que con Vite normal
- **Functions:** Se recargan automáticamente al editar

## 🎯 Recomendación

**Siempre usa `npm run dev:netlify` para desarrollo local** para tener la misma experiencia que en producción.
