# 🔐 Ejemplo de Configuración para GitHub Secrets (`SUPABASE_PROJECTS`)

Este archivo contiene ejemplos con **valores ficticios e inventados** que puedes tomar como plantilla para copiar y pegar en los **Secrets** de tu repositorio de GitHub.

---

## 📌 Datos del Secret en GitHub

Cuando crees el secreto en GitHub, debes usar exactamente estos datos:

- **Nombre del Secreto (Name)**: `SUPABASE_PROJECTS`
- **Tipo**: *Repository secret*
- **Valor (Secret)**: El bloque JSON con la lista de tus proyectos (ver ejemplos abajo).

---

## 📋 Ejemplo 1: Un solo proyecto (Recomendado y más simple)

Este es el formato más habitual utilizando la estrategia recomendada (`target: "rest"`):

```json
[
  {
    "name": "Mi Tienda Online",
    "url": "https://abcdefghijklmno.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.ejemploFirmaFalsaClavePublicaAnonima1234567890",
    "target": "rest"
  }
]
```

---

## 📋 Ejemplo 2: Varios proyectos con distintas estrategias

Puedes agregar todos los proyectos que quieras dentro de los corchetes `[...]`, separados por comas:

```json
[
  {
    "name": "App Móvil - Producción",
    "url": "https://xyz123abc456.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ejEyM2FiYzQ1NiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.FirmaFalsaAnonProd123456789",
    "target": "rest",
    "enabled": true
  },
  {
    "name": "Panel Administrativo - Staging",
    "url": "https://stag987qwe321.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YWc5ODdxd2UzMjEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.FirmaFalsaAnonStaging987654321",
    "target": "auth",
    "enabled": true
  },
  {
    "name": "Blog Personal - Consulta a Tabla",
    "url": "https://blog456def789.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsb2c0NTZkZWY3ODkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.FirmaFalsaAnonBlog456789123",
    "target": "table",
    "customTable": "posts",
    "enabled": true
  }
]
```

---

## 📋 Ejemplo 3: En una sola línea (Para scripts o terminal)

Si prefieres ingresarlo compactado en una sola línea:

```json
[{"name":"Mi Proyecto","url":"https://abcdefghijklmno.supabase.co","key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.ejemploFirmaFalsaClavePublicaAnonima1234567890","target":"rest"}]
```

---

## 📖 Explicación de cada campo

| Campo | Obligatorio | Descripción | Ejemplo inventado |
| :--- | :---: | :--- | :--- |
| `name` | Opcional | Nombre legible que aparecerá en tus reportes y logs. | `"Mi Tienda Online"` |
| `url` | **Sí** | URL base de tu proyecto en Supabase (sin barra `/` al final). | `"https://abcdefghijklmno.supabase.co"` |
| `key` | **Sí** | La clave `anon public` de Supabase (token JWT). | `"eyJhbGciOiJIUzI1NiIsInR5c..."` |
| `target` | Opcional | Método de ping (`rest`, `auth`, o `table`). Por defecto es `rest`. | `"rest"` |
| `customTable`| Solo si `target: "table"` | Nombre de la tabla a la que se le hará la consulta de 1 fila. | `"posts"` o `"usuarios"` |
| `enabled` | Opcional | Permite pausar (`false`) o activar (`true`) el ping sin borrar el proyecto. | `true` |

---

## 🛠️ ¿Dónde se consiguen los datos reales en Supabase?

En tu panel de Supabase ([https://supabase.com/dashboard](https://supabase.com/dashboard)):

1. Selecciona tu proyecto.
2. Ve al menú inferior izquierdo: **Project Settings** (el engranaje ⚙️) ➔ **API**.
3. En la sección **Project URL**: copia la `URL` (ej. `https://abcdefghijklmno.supabase.co`).
4. En la sección **Project API keys**: copia la clave etiquetada como `anon` `public` (empieza por `eyJhbG...`).

---

## 🚀 ¿Cómo cargarlo en GitHub Actions?

1. Ve a tu repositorio en GitHub.
2. Entra a **Settings** ➔ **Secrets and variables** ➔ **Actions**.
3. Haz clic en el botón verde **New repository secret**.
4. En **Name**, escribe: `SUPABASE_PROJECTS`.
5. En **Secret**, pega el JSON con tus datos reales.
6. Haz clic en **Add secret**.
