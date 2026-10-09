# 📘 Documentación Técnica Explicativa - Mantenedor Supabase

Este documento describe en detalle el funcionamiento técnico, la seguridad de datos, la integración con la API de GitHub y los mecanismos internos de **Mantenedor Supabase**.

---

## 📋 Índice
1. [¿Por qué Supabase pausa los proyectos gratis?](#1-por-qué-supabase-pausa-los-proyectos-gratis)
2. [Explicación Paso a Paso de Cómo Funciona el Sistema](#2-explicación-paso-a-paso-de-cómo-funciona-el-sistema)
3. [Integración en Tiempo Real con la API de GitHub Actions](#3-integración-en-tiempo-real-con-la-api-de-github-actions)
4. [Seguridad y Repositorios Públicos en GitHub](#4-seguridad-y-repositorios-públicos-en-github)
5. [Estrategias de Ping Disponible y Cabeceras HTTP](#5-estrategias-de-ping-disponible-y-cabeceras-http)
6. [Interpretación de Respuestas y Logs](#6-interpretación-de-respuestas-y-logs)
7. [Resumen de Archivos y Responsabilidades](#7-resumen-de-archivos-y-responsabilidades)

---

## 1. ¿Por qué Supabase pausa los proyectos gratis?

Supabase ofrece un plan gratuito muy generoso, pero para optimizar recursos en sus servidores en la nube, aplica una regla de inactividad:

- **Regla de Inactividad de 7 Días**: Si un proyecto no recibe peticiones a su API REST, API Auth, o consultas SQL durante 7 días continuos, la instancia de base de datos PostgreSQL pasa a estado **Paused** (Pausada).
- **Efecto de la Pausa**: Cuando el proyecto está pausado, la base de datos no responde. Al recibir una nueva petición, el usuario o la aplicación experimenta una falla o un retraso prolongado (warm-up) mientras Supabase vuelve a encender el contenedor.

**Solución**: Este mantenedor realiza una petición HTTP autenticada al menos 1 vez al día (cada 24 horas), lo que **reinicia el temporizador de 7 días a cero constantemente**, garantizando que tu base de datos esté **100% activa siempre**.

---

## 2. Explicación Paso a Paso de Cómo Funciona el Sistema

El sistema opera mediante dos modos de ejecución sincronizados:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          1. DISPARADOR DE CRON                              │
│         GitHub Actions ejecuta diariamente a las 00:00 UTC                 │
│         o el programador interno `node-cron` si corre en VPS               │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       2. CARGA DE CONFIGURACIÓN                             │
│   El módulo `lib/keeper.js` lee los proyectos desde:                       │
│   - La variable de entorno `SUPABASE_PROJECTS` (encriptada en GitHub)       │
│   - Y/O el archivo local `data/projects.json`                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       3. EJECUCIÓN DE PETICIONES HTTP                       │
│   Para cada proyecto, realiza un fetch GET autenticado con headers:        │
│   - `apikey: <anon_or_service_key>`                                         │
│   - `Authorization: Bearer <anon_or_service_key>`                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    4. ACTIVACIÓN EN SUPABASE                                │
│   Supabase recibe la petición en PostgREST / Auth:                          │
│   - Revisa la firma del token                                               │
│   - Activa/mantiene despierto el contenedor de PostgreSQL                   │
│   - Responde HTTP 200 / 204 / 401                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               5. REGISTRO Y MONITOREO DESDE EL DASHBOARD                    │
│   Guarda el log local y reporta el estado a la API de GitHub Actions       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Integración en Tiempo Real con la API de GitHub Actions

El Dashboard Web y la herramienta CLI están conectados directamente con la **API de GitHub Actions** del repositorio ([AaronSGomez/MantenedorFreeSupabase](https://github.com/AaronSGomez/MantenedorFreeSupabase)):

### Endpoints Agregados al Servidor (`server.js`):

1. **`GET /api/github/runs`**:
   - Consulta el historial reciente de flujos ejecutados en GitHub Actions mediante GitHub API / GitHub CLI (`gh`).
   - Retorna la fecha, estado (`completed` / `in_progress`), conclusión (`success` / `failure`) y la URL directa de los registros.

2. **`POST /api/github/trigger`**:
   - Permite disparar el flujo `.github/workflows/supabase-keeper.yml` de forma remota directamente desde el botón **"☁️ Disparar en Nube"** del Dashboard Web sin entrar a la web de GitHub.

### Monitoreo desde CLI (`scripts/ping.js`):
Al ejecutar `npm run ping` en consola, el script no solo ejecuta pings locales, sino que consulta la API de GitHub y muestra una tarjeta con el estado real de la nube.

---

## 4. Seguridad y Repositorios Públicos en GitHub

### 🛡️ ¿Es seguro hacer público este repositorio?

**SÍ, ES 100% SEGURO.** 

Muchas personas temen publicar repositorios por miedo a exponer sus claves de API o URLs privadas de base de datos. Sin embargo, este proyecto está diseñado respetando el modelo de seguridad de **GitHub Secrets**:

#### ¿Cómo protegen tus credenciales los GitHub Secrets?
1. **Encriptación de extremo a extremo**: Cuando guardas el secret `SUPABASE_PROJECTS` en GitHub, tu navegador lo encripta usando la clave pública de GitHub (mediante Libsodium) antes de enviar la petición. GitHub almacena solo el valor cifrado.
2. **Invisibilidad en el repositorio**: El valor de un Secret **nunca** aparece en el código fuente, ni en la lista de archivos, ni en los *forks* de otros usuarios.
3. **Máscara automática en Logs**: Si por error el script imprimiera la clave en la consola durante una ejecución, la plataforma de GitHub Actions detecta el valor del Secret y lo reemplaza automáticamente por `***`.

#### ¿Qué archivos debes asegurar que NO se suban a Git?
El archivo `.gitignore` del proyecto bloquea automáticamente la subida de:
- `data/projects.json`: Donde el dashboard web guarda tus proyectos cuando lo usas localmente.
- `.env`: Donde guardas claves de entorno locales.

De esta forma, **puedes hacer tu repositorio público sin ningún riesgo**.

---

## 5. Estrategias de Ping Disponible y Cabeceras HTTP

Puedes configurar cada proyecto con una de las siguientes 3 estrategias según tu preferencia:

| Estrategia | Valor en JSON | URL Solicitada | Descripción |
| :--- | :--- | :--- | :--- |
| **REST Root (Recomendado)** | `"target": "rest"` | `https://<url>.supabase.co/rest/v1/` | Consulta la raíz de la API PostgREST. Es ultra ligera, rápida y no modifica datos. |
| **Auth Health** | `"target": "auth"` | `https://<url>.supabase.co/auth/v1/health` | Verifica el estado del microservicio de autenticación de Supabase (GoTrue). |
| **Consulta a Tabla** | `"target": "table"` | `https://<url>.supabase.co/rest/v1/<tabla>?select=*&limit=1` | Lee la primera fila de una tabla de tu elección (ej. `users` o `profiles`). |

### Cabeceras HTTP que se envían en la petición
```http
GET /rest/v1/ HTTP/1.1
Host: tu-proyecto.supabase.co
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
User-Agent: SupabaseMantenedor/1.0
Accept: application/json
```

---

## 6. Interpretación de Respuestas y Logs

Cuando el mantenedor realiza el ping, evalúa la respuesta HTTP de Supabase:

- **HTTP 200 / 204 (OK)**: El ping fue totalmente exitoso y autenticado.
- **HTTP 401 / 403 (Unauthorized / Forbidden)**: Ocurre si la API Key es incorrecta o no se incluyó. **Aun así, la base de datos se mantiene despierta**, porque el servidor PostgREST de Supabase procesó la solicitud HTTP para validar la autenticación.
- **HTTP 404 (Not Found)**: Ocurre si la tabla especificada no existe, pero también confirma que el motor de Supabase respondió.
- **Timeout / Error de Conexión**: Si pasan más de 15 segundos sin respuesta, se registra un error para que puedas revisarlo en el dashboard o en los logs de GitHub Actions.

---

## 7. Resumen de Archivos y Responsabilidades

- 📄 **[README.md](file:///c:/PROYECTS/MantenedorSupabase/README.md)**: Guía rápida y paso a paso para usuarios de cómo configurar GitHub Actions y el Dashboard Web.
- 📄 **[server.js](file:///c:/PROYECTS/MantenedorSupabase/server.js)**: Servidor web Express que provee las rutas de la API (`/api/projects`, `/api/ping-all`, `/api/github/runs`, `/api/github/trigger`) y el panel web.
- 📄 **[lib/keeper.js](file:///c:/PROYECTS/MantenedorSupabase/lib/keeper.js)**: Módulo principal que gestiona el envío de pings HTTP, medición de latencias y persistencia de logs.
- 📄 **[scripts/ping.js](file:///c:/PROYECTS/MantenedorSupabase/scripts/ping.js)**: Punto de entrada para la ejecución por línea de comandos (CLI) que incluye diagnóstico local y estado de la nube en GitHub.
- 📄 **[public/index.html](file:///c:/PROYECTS/MantenedorSupabase/public/index.html)**: Interfaz web SPA con tarjetas de estado en la nube, tabla de ejecuciones de GitHub Actions y disparador remoto.
- 📄 **[.github/workflows/supabase-keeper.yml](file:///c:/PROYECTS/MantenedorSupabase/.github/workflows/supabase-keeper.yml)**: Archivo YAML que indica a GitHub la programación del Cron diario.
