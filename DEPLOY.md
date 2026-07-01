# Despliegue en Vercel — Mujeres Púrpura

Este es un **sitio estático** (HTML, CSS y JavaScript con `localStorage`). No requiere
paso de compilación ni servidor backend, por lo que se despliega directamente en Vercel.

## Configuración incluida

- **`vercel.json`** — URLs limpias (sin `.html`), cabeceras de seguridad y caché de assets.
- **`.vercelignore`** — excluye archivos que no deben publicarse.

## Opción A — Desplegar con la CLI de Vercel (sin GitHub)

```bash
npm i -g vercel        # instala la CLI (una sola vez)
cd mujeres_purpura-main # carpeta que contiene index.html y vercel.json
vercel                 # despliegue de previsualización (sigue las preguntas)
vercel --prod          # despliegue a producción
```

En las preguntas del primer `vercel`:
- **Set up and deploy?** → `y`
- **Which scope?** → tu cuenta
- **Link to existing project?** → `n`
- **Project name** → `mujeres-purpura`
- **In which directory is your code located?** → `./`
- **Framework preset** → `Other` (estático)
- **Build/Output** → dejar en blanco (Enter)

## Opción B — Desplegar desde GitHub (recomendado para actualizaciones automáticas)

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://vercel.com/new importa el repositorio.
3. En **Framework Preset** elige `Other`; deja *Build Command* y *Output Directory* vacíos.
4. Si el repo tiene el proyecto en una subcarpeta, ajusta **Root Directory** a
   `mujeres_purpura-main`.
5. Pulsa **Deploy**. Cada `git push` volverá a desplegar automáticamente.

## Notas

- El panel de administración (`/admin`) usa credenciales en el cliente
  (`admin` / `purpura2025`) y guarda datos en `localStorage` del navegador. No hay base
  de datos; los cambios son locales a cada dispositivo/navegador.
