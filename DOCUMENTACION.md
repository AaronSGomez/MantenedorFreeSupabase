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
8. [Análisis Post-Mortem de Incidentes y Mejoras de Resiliencia](#8-análisis-post-mortem-de-incidentes-y-mejoras-de-resiliencia)

---

## 1. ¿Por qué Supabase pausa los proyectos gratis?

Supabase ofrece un plan gratuito muy generoso, pero para optimizar recursos en sus servidores en la nube, aplica una regla de inactividad:

- **Regla de Inactividad de 7 Días**: Si un proyecto no registra actividad en su base de datos **PostgreSQL** durante 7 días continuos, la plataforma pasa la instancia al estado **Paused** (Pausada).
- **Qué cuenta como actividad real**: Supabase exige que se ejecuten consultas SQL genuinas en el motor de base de datos (por ejemplo, lecturas o escrituras a tablas vía la API PostgREST o en el catálogo de Storage). Tráfico perimetral rechazado con error 401 en el API Gateway o simples comprobaciones de contenedores satélites (como GoTrue Auth) no resetean el contador de inactividad de Postgres.
- **Efecto de la Pausa**: Cuando el proyecto está pausado, la base de datos no responde. Al recibir una nueva petición, el usuario o la aplicación experimenta una falla o un retraso prolongado (warm-up) mientras Supabase vuelve a encender el contenedor.

**Solución**: Este mantenedor realiza consultas HTTP autenticadas contra tablas reales de tus proyectos dos veces al día (cada 12 horas mediante cron), ejecutando un `SELECT ... LIMIT 1` que **reinicia el temporizador de 7 días a cero constantemente en PostgreSQL**, garantizando que tu base de datos esté **100% activa siempre**.

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

Puedes configurar cada proyecto con las siguientes estrategias según la naturaleza de tu base de datos:

| Estrategia | Valor en JSON | URL Solicitada | Descripción |
| :--- | :--- | :--- | :--- |
| **Consulta a Tabla (Recomendada y 100% Efectiva)** | `"target": "table"`, `"customTable": "<tabla>"` | `https://<url>.supabase.co/rest/v1/<tabla>?select=*&limit=1` | **Garantizada.** Ejecuta una consulta `SELECT` real en PostgreSQL que lee la primera fila de una tabla pública, reseteando la inactividad en Supabase. |
| **Storage Buckets** | `"target": "storage"` | `https://<url>.supabase.co/storage/v1/bucket` | Consulta la API de almacenamiento. Ideal para proyectos donde las tablas públicas tienen RLS estricto pero se usan buckets. |
| **Auth Health** | `"target": "auth"` | `https://<url>.supabase.co/auth/v1/health` | Verifica la salud del microservicio GoTrue. *Nota: No ejecuta consultas a PostgreSQL por sí misma.* |
| **REST Root** | `"target": "rest"` | `https://<url>.supabase.co/rest/v1/` | Consulta la raíz OpenAPI. *Nota: Requiere `service_role`; con claves `anon` es bloqueada con HTTP 401 por Kong Gateway.* |

### Cabeceras HTTP que se envían en la petición
```http
GET /rest/v1/nombre_tabla?select=*&limit=1 HTTP/1.1
Host: tu-proyecto.supabase.co
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6...
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
User-Agent: SupabaseMantenedor/1.0
Accept: application/json
```

---

## 6. Interpretación de Respuestas y Logs

Cuando el mantenedor realiza el ping, evalúa la respuesta HTTP de Supabase:

- **HTTP 200 / 204 (OK) ➔ SUCCESS**: El ping fue totalmente exitoso y la consulta fue procesada por PostgreSQL. **El temporizador de 7 días se reinicia**.
- **HTTP 401 / 403 (Unauthorized / Forbidden) ➔ FAILED**: La petición fue bloqueada en el API Gateway (Kong) o la clave `anon` no tiene permisos. **PostgreSQL NO ejecutó ninguna consulta SQL**. Requiere configurar una tabla en `customTable` o revisar la clave.
- **HTTP 404 (Not Found) ➔ FAILED**: La tabla o ruta especificada no existe en el esquema de la base de datos.
- **Timeout / Error de Conexión ➔ FAILED**: Si pasan más de 15 segundos sin respuesta, se registra un fallo de red o tiempo de espera agotado.

---

## 7. Resumen de Archivos y Responsabilidades

- 📄 **[README.md](file:///c:/PROYECTS/MantenedorSupabase/README.md)**: Guía rápida y paso a paso para usuarios de cómo configurar GitHub Actions y el Dashboard Web.
- 📄 **[server.js](file:///c:/PROYECTS/MantenedorSupabase/server.js)**: Servidor web Express que provee las rutas de la API (`/api/projects`, `/api/ping-all`, `/api/github/runs`, `/api/github/trigger`) y el panel web.
- 📄 **[lib/keeper.js](file:///c:/PROYECTS/MantenedorSupabase/lib/keeper.js)**: Módulo principal que gestiona el envío de pings HTTP, medición de latencias y persistencia de logs.
- 📄 **[scripts/ping.js](file:///c:/PROYECTS/MantenedorSupabase/scripts/ping.js)**: Punto de entrada para la ejecución por línea de comandos (CLI) que incluye diagnóstico local y estado de la nube en GitHub.
- 📄 **[public/index.html](file:///c:/PROYECTS/MantenedorSupabase/public/index.html)**: Interfaz web SPA con tarjetas de estado en la nube, tabla de ejecuciones de GitHub Actions y disparador remoto.
- 📄 **[.github/workflows/supabase-keeper.yml](file:///c:/PROYECTS/MantenedorSupabase/.github/workflows/supabase-keeper.yml)**: Archivo YAML que indica a GitHub la programación del Cron diario.

---

## 8. Análisis Post-Mortem de Incidentes y Mejoras de Resiliencia

### 📝 Resumen del Incidente: Notificaciones de Pausa a pesar de Ejecuciones Exitosas

#### Contexto y Síntomas
Varios proyectos configurados en el plan gratuito de Supabase comenzaron a recibir notificaciones por correo de la plataforma indicando que la instancia *no había registrado suficiente actividad en los últimos 7 días y estaba programada para pausarse automáticamente*, a pesar de que el mantenedor ejecutaba tareas de comprobación de forma regular y reportaba estado exitoso.

#### Análisis de Causa Raíz (RCA)
Tras auditar el tráfico HTTP y las respuestas del API Gateway de Supabase, se identificaron los siguientes factores técnicos:

1. **Bloqueo Perimetral en la Raíz OpenAPI (`/rest/v1/`):**
   - La configuración por defecto enviaba las solicitudes a la raíz `https://<ref>.supabase.co/rest/v1/`.
   - PostgREST y Kong restringen la inspección completa de la raíz OpenAPI a la clave de servicio (`service_role`). Al utilizar la clave pública `anon`, la pasarela responde de inmediato con `HTTP 401 Unauthorized` (`Only the service_role API key can be used for this endpoint`).
   - Dado que el API Gateway rechaza la petición en el perímetro, **la solicitud jamás interactúa con el motor PostgreSQL**.
2. **Falsos Positivos en la Evaluación de Estado:**
   - La condición de éxito en el código evaluaba cualquier respuesta con código menor a 500 (`status < 500`) como señal de que el servicio estaba "vivo". Esto enmascaraba el error 401 como un estado verde en el panel de control.
3. **Métrica Estricta de Telemetría de Supabase:**
   - El daemon de inactividad de Supabase no evalúa el volumen de tráfico en la pasarela HTTP, sino las **consultas SQL reales ejecutadas contra el motor PostgreSQL**. Como ninguna consulta SQL se procesaba, el temporizador de inactividad continuaba avanzando hasta alcanzar los 7 días.

---

### 🛡️ Acciones Correctivas y Mejoras de Resiliencia Implementadas

1. **Priorización de Consultas a Tablas (`target: "table"`):**
   - El método estándar ahora realiza peticiones a tablas reales: `GET /rest/v1/<tabla>?select=*&limit=1`.
   - Esta petición fuerza a PostgREST a ejecutar un `SELECT ... LIMIT 1` dentro de PostgreSQL, registrando una transacción de lectura legítima en las métricas de la base de datos y reseteando el contador de inactividad de inmediato.
2. **Soporte de Catálogo de Almacenamiento (`target: "storage"`):**
   - Para proyectos con políticas restrictivas de RLS en todas sus tablas públicas, se incorporó la estrategia de Storage (`GET /storage/v1/bucket`), que consulta la base de datos relacional interna del subsistema de almacenamiento con respuesta HTTP 200.
3. **Mecanismo de Auto-Descubrimiento y Recuperación en Caliente:**
   - En el archivo [`lib/keeper.js`](file:///c:/PROYECTS/MantenedorSupabase/lib/keeper.js), si una petición a la raíz devuelve un código 401, el motor activa un sondeo autónomo de tablas comunes conocidas y de Storage. Al hallar la primera ruta que responda 200 OK, redirige la consulta en caliente y registra el latido con éxito en PostgreSQL sin requerir intervención manual del usuario.
4. **Validación Estricta sin Falsos Positivos:**
   - Se eliminaron las clasificaciones laxas. Únicamente códigos de estado HTTP 2xx (200-299) marcan el ping como `SUCCESS`. Errores 401 o 404 son reportados como `FAILED`, acompañados de un mensaje orientativo para la configuración de la tabla.
5. **Optimización de Interfaz en Dispositivos Móviles:**
   - Se rediseñaron los componentes visuales para garantizar que en pantallas de 380px no se produzcan cortes de botones ni saltos a 2 líneas en badges ("Latido", "SSL", "API"), incorporando avisos claros sobre la navegación táctil y el desplazamiento horizontal de tablas y bloques de código.

