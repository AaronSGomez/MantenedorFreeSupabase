# 🔐 Guía de Configuración de Proyectos (`SUPABASE_PROJECTS`)

Este documento explica cómo configurar la variable de entorno `SUPABASE_PROJECTS` tanto en **GitHub Secrets** como en **Vercel**, y cómo elegir sin ningún riesgo la tabla o estrategia óptima para evitar la suspensión por inactividad de Supabase.

---

## 🧭 Cómo Identificar sin Riesgos la Consulta o Tabla Óptima

Muchos desarrolladores se preguntan: *¿Afectará al rendimiento de mi base de datos? ¿Expondrá mis datos privados? ¿Qué tabla debo elegir?*

### 1. Garantías de Seguridad e Impacto Cero
- **Solo Lectura (`SELECT ... LIMIT 1`)**: Las peticiones de Supalive son estrictamente lecturas de una sola fila (`?select=*&limit=1`). **Jamás insertan, modifican ni borran información**.
- **Impacto Nulo en Rendimiento**: Con `limit=1`, PostgreSQL resuelve la consulta en menos de 10 milisegundos y transmite pocos bytes de ancho de banda. El consumo de cómputo en tu cuota gratuita de Supabase es de **0.00%**.
- **Anon Key Segura**: La clave `anon` es la misma clave pública que incluyes en tu aplicación web o móvil. Usarla en este mantenedor no añade ningún vector de riesgo.

### 2. Los 3 Métodos de Selección (Elige el que mejor se adapte a tu proyecto)

#### ✅ Opción 1: Cualquier Tabla Pública o Catálogo Existente (Recomendado)
- **Cuándo usarla**: Si tu proyecto tiene alguna tabla que tu frontend ya lee con la clave pública `anon` (por ejemplo: `articulos`, `productos`, `categorias`, `fotos`, `posts`, `preguntas`, `proyectos`, `configuracion`).
- **Por qué es segura**: Si la tabla ya es visible para los usuarios de tu app, consultarla para el ping no expone nada nuevo.
- **Configuración JSON**:
  ```json
  {
    "name": "Mi Proyecto",
    "url": "https://abcdefghijklmno.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "target": "table",
    "customTable": "nombre_de_tu_tabla"
  }
  ```

#### ✅ Opción 2: Storage Buckets (Perfecta si tus tablas tienen RLS Estricto)
- **Cuándo usarla**: Si tu base de datos tiene **Row Level Security (RLS)** bloqueando todas las tablas a usuarios no autenticados, o si tienes revocado el acceso al esquema `public` para el rol `anon`.
- **Por qué es segura**: Consulta el catálogo de almacenamiento `/storage/v1/bucket`. Dado que el sistema de Storage de Supabase corre sobre PostgreSQL internamente, la consulta interactúa con la base de datos, devuelve **HTTP 200 OK** y resetea el contador de 7 días **sin que tengas que tocar ni exponer ninguna tabla de tu aplicación**.
- **Configuración JSON**:
  ```json
  {
    "name": "Mi Proyecto Seguro",
    "url": "https://abcdefghijklmno.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "target": "storage"
  }
  ```

#### ✅ Opción 3: Tabla Específica de Control (Incluso Vacía)
- **Cuándo usarla**: Si prefieres aislar completamente el mantenedor en una tabla dedicada.
- **Por qué es segura**: Puedes crear una tabla llamada `keepalive` o `ping` vacía en Supabase con una política de lectura pública:
  ```sql
  -- Ejecutar en Supabase SQL Editor (opcional):
  CREATE TABLE IF NOT EXISTS keepalive (id int PRIMARY KEY);
  ALTER TABLE keepalive ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Permitir lectura anon" ON keepalive FOR SELECT TO anon USING (true);
  ```
  Incluso estando totalmente vacía, PostgREST devolverá `[]` con **HTTP 200 OK**, ejecutando la consulta en el motor SQL y manteniendo el proyecto despierto.

---

## 📋 Ejemplos de JSON Listos para Copiar y Pegar

### Ejemplo A: Un solo proyecto con consulta a tabla
```json
[
  {
    "name": "Mi Tienda Online",
    "url": "https://abcdefghijklmno.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "table",
    "customTable": "productos"
  }
]
```

### Ejemplo B: Varios proyectos combinando Tablas y Storage
```json
[
  {
    "name": "App Móvil - Producción",
    "url": "https://xyz123abc456.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "table",
    "customTable": "photos",
    "enabled": true
  },
  {
    "name": "API Privada - Sin Tablas Públicas",
    "url": "https://stag987qwe321.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "storage",
    "enabled": true
  }
]
```

### Ejemplo C: En una sola línea (Para terminal o variables compactas)
```json
[{"name":"Mi Proyecto","url":"https://abcdefghijklmno.supabase.co","key":"eyJhbGciOiJIUzI1NiIsInR5cCI6...","target":"table","customTable":"posts"}]
```

---

## 📖 Referencia de Campos del JSON

| Campo | Obligatorio | Descripción | Ejemplo |
| :--- | :---: | :--- | :--- |
| `name` | Opcional | Nombre legible para paneles, reportes y logs. | `"Backend Producción"` |
| `url` | **Sí** | URL base de tu proyecto en Supabase (sin barra `/` final). | `"https://xyz.supabase.co"` |
| `key` | **Sí** | Clave pública `anon` de Supabase (token JWT que inicia por `eyJhbG...`). | `"eyJhbGciOi..."` |
| `target` | Opcional | Estrategia de ping: `"table"` (por defecto) o `"storage"`. | `"table"` |
| `customTable`| Si `target: "table"` | Nombre de la tabla a la que se le realiza el `SELECT LIMIT 1`. | `"photos"` o `"posts"` |
| `enabled` | Opcional | Habilitar (`true`) o pausar temporalmente (`false`) el ping. | `true` |

---

## 🚀 Dónde Configurar la Variable: GitHub Actions vs Vercel

> [!IMPORTANT]
> **GitHub Secrets y Vercel son entornos independientes.**  
> Si solo vas a utilizar la ejecución automática programada en segundo plano, basta con configurarlo en GitHub Secrets. Si además despliegas la web en Vercel para auditar desde tu móvil o navegador, **debes añadir la variable en ambas plataformas**.

### 1. Configuración en GitHub Actions (Ejecución automática en la nube)
1. Ve a tu repositorio en GitHub.
2. Entra a **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Haz clic en **New repository secret**.
4. **Name**: `SUPABASE_PROJECTS`
5. **Secret**: Pega tu bloque JSON.
6. Haz clic en **Add secret**.

### 2. Configuración en Vercel (Web en vivo y botones de latido manual)
1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard).
2. Entra a **Settings** ➔ **Environment Variables**.
3. **Key**: `SUPABASE_PROJECTS`
4. **Value**: Pega el mismo bloque JSON.
5. Selecciona los entornos: **Production**, **Preview** y **Development**.
6. Haz clic en **Save**.
7. En la pestaña **Deployments**, pulsa los tres puntos `...` de tu último commit y selecciona **Redeploy** para aplicar los cambios de inmediato.

---

## 🛠️ ¿Dónde conseguir tus credenciales en Supabase?
En tu panel de [Supabase Dashboard](https://supabase.com/dashboard):
1. Entra a tu proyecto.
2. Ve a **Project Settings (icono de engranaje ⚙️)** ➔ **API**.
3. Copia **Project URL** (ej: `https://xyz.supabase.co`).
4. Copia la clave **anon public** (cadena JWT que inicia por `eyJhbG...`).
