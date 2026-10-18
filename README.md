# ⚡ Mantenedor Supabase (Keep-Alive)

Un proyecto simple, completo y automático diseñado para realizar peticiones periódicas (pings) a tus bases de datos de **Supabase**, evitando que la plataforma suspenda o pause tus proyectos del plan gratuito por inactividad (los cuales se pausan tras 7 días sin recibir tráfico).

---

## 🔒 ¿El repositorio puede ser PÚBLICO? ¿Mis Secrets son seguros?

> **SÍ, 100% SEGURO.** Puedes hacer tu repositorio público en GitHub sin exponer tus credenciales.

- **Los GitHub Secrets NUNCA son visibles**: GitHub encripta los Secrets y jamás los muestra en la web pública ni en los logs.
- **Tus claves locales están protegidas**: Los archivos `data/projects.json` y `.env` están incluidos en `.gitignore` para que **jamás se suban a Git**.
- Al usar **GitHub Secrets**, tu código es 100% público, pero tus credenciales de Supabase se mantienen 100% privadas y encriptadas.

---

## 🚀 Características Principales

- **Dashboard Web Moderno**: Interfaz gráfica intuitiva para administrar proyectos de Supabase, ver latencias, respuestas HTTP y logs.
- **Integración en Tiempo Real con GitHub Actions API**: Visualiza directamente desde la Web local el estado de las ejecuciones realizadas en la nube por GitHub.
- **Disparador Remoto ("Disparar en Nube")**: Botón para mandar a ejecutar el workflow en GitHub Actions de forma remota sin entrar a la página de GitHub.
- **Automatización 100% Gratuita (GitHub Actions)**: Flujo de trabajo `.github/workflows/supabase-keeper.yml` para ejecutarse automáticamente **todos los días en la nube sin necesidad de mantener encendida tu PC**.
- **Diagnóstico por Consola (CLI)**: Ejecuta `npm run ping` para obtener un informe instantáneo del estado de tus proyectos locales y de la nube.
- **Múltiples Estrategias de Ping**:
  - `Consulta a Tabla (Recomendada y 100% Efectiva)`: Ejecuta una lectura ligera (`SELECT ... LIMIT 1`) que interactúa directamente con el motor de PostgreSQL y resetea el contador de inactividad de 7 días.
  - `Storage Buckets` (`https://<proyecto>.supabase.co/storage/v1/bucket`): Consulta la API de almacenamiento para proyectos que utilicen buckets.
  - `Auth Health` (`https://<proyecto>.supabase.co/auth/v1/health`): Comprobación del microservicio de autenticación GoTrue.
  - `Auto-Recuperación Inteligente`: Si un proyecto no tiene tabla definida o recibe un 401 en la raíz, el motor sondea automáticamente tablas públicas comunes hasta forzar una consulta exitosa en Postgres.

---

## 🚀 Paso a Paso: Cómo Configurar la Automatización en 3 Pasos

Sigue estos 3 sencillos pasos para dejar tu mantenedor funcionando automáticamente para siempre:

### 📌 Paso 1: Subir el Proyecto a tu Cuenta de GitHub

Abre tu consola de comandos en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "feat: inicializar mantenedor supabase"
git branch -M main
git remote add origin https://github.com/AaronSGomez/MantenedorFreeSupabase.git
git push -u origin main
```
*(Puedes hacer el repositorio **Público** o **Privado** según prefieras)*.

---

### 📌 Paso 2: Configurar tus Proyectos en GitHub Secrets

Para que GitHub sepa qué proyectos de Supabase debe mantener vivos sin publicar tus claves en el código:

1. Ve a tu repositorio en GitHub ([https://github.com/AaronSGomez/MantenedorFreeSupabase](https://github.com/AaronSGomez/MantenedorFreeSupabase)).
2. Haz clic en la pestaña **Settings** (Configuración) en la parte superior.
3. En el menú lateral izquierdo, ve a **Secrets and variables** ➔ **Actions**.
4. Haz clic en el botón verde **New repository secret**.
5. Completa los campos:
   - **Name**: `SUPABASE_PROJECTS`
   - **Secret**: Copia y pega un arreglo JSON con tus proyectos (puedes agregar uno o varios):

```json
[
  {
    "name": "Mi Proyecto Produccion",
    "url": "https://xyzxyz.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "target": "table",
    "customTable": "nombre_tabla"
  },
  {
    "name": "Mi Proyecto Seguro (RLS)",
    "url": "https://abcabc.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "target": "storage"
  }
]
```

> ⚠️ **REGLA FUNDAMENTAL DE SUPABASE:**  
> Supabase mide únicamente la actividad real que ejecuta consultas en el motor de **PostgreSQL**. Peticiones a la raíz (`/rest/v1/`) con claves `anon` son bloqueadas en el API Gateway (Kong) con HTTP 401 y no tocan la base de datos. Por ello, **configura siempre `"target": "table"` con una tabla existente o `"target": "storage"`**.

6. Haz clic en **Add secret**.

#### 🌐 ¿Vas a desplegar también la interfaz web en Vercel?
> **Recuerda:** Vercel y GitHub son plataformas independientes. Los **GitHub Secrets NO se transfieren a Vercel**.  
> Si despliegas la web en Vercel para auditar tus proyectos desde el móvil o navegador, entra en **Vercel Dashboard ➔ Tu Proyecto ➔ Settings ➔ Environment Variables**, añade la misma variable `SUPABASE_PROJECTS` con tu JSON y pulsa **Redeploy**.

---

## 🧭 Cómo Identificar sin Riesgos la Tabla Óptima de tu Base de Datos

Muchos usuarios se preguntan si consultar una tabla puede alterar sus datos o saturar su base de datos gratuita:

### 1. Garantías Técnicas de Seguridad
- **Lectura Pura de 1 Fila**: El mantenedor ejecuta únicamente peticiones `GET /rest/v1/<tabla>?select=*&limit=1`. **Bajo ninguna circunstancia escribe, modifica ni elimina registros**.
- **Impacto de Cómputo Nulo (< 10 ms)**: Al limitar la consulta a 1 sola fila (`limit=1`), PostgreSQL resuelve la búsqueda en milisegundos y devuelve apenas unos cientos de bytes. El consumo de CPU en tu plan gratuito es virtualmente **cero**.
- **Clave Anon Pública**: Usar la clave `anon` no expone ningún dato sensible que no sea ya accesible públicamente desde el navegador de tu aplicación.

### 2. ¿Qué opción elegir para tu proyecto?
- **Opción A (Tablas Públicas o Catálogos - La más común):**  
  Si tu app tiene alguna tabla que se consulta habitualmente desde el frontend (ej: `posts`, `productos`, `articulos`, `categorias`, `fotos`, `preguntas`, `proyectos`), indica su nombre en `"customTable"`. Si tu frontend ya la lee con la clave `anon`, funcionará de inmediato con **HTTP 200 OK**.
- **Opción B (Storage Buckets - Para proyectos con RLS Estricto):**  
  Si todas tus tablas tienen políticas de **Row Level Security (RLS)** cerradas a usuarios no autenticados o tienes revocado el acceso al esquema público, configura `"target": "storage"`. Consultará `/storage/v1/bucket`, que interactúa con la base de datos PostgreSQL interna de Storage y devuelve **HTTP 200 OK** sin tocar tus tablas de negocio.
- **Opción C (Tabla Vacía de Control):**  
  Si prefieres no tocar ninguna tabla existente, puedes crear una tabla vacía en Supabase (ej: `CREATE TABLE keepalive (id int);`) con una política `SELECT` para `anon`. Incluso vacía (`[]`), PostgreSQL ejecutará la consulta y reseteará el temporizador de 7 días.

---

### 📌 Paso 3: Probar la Ejecución Automática (Opcional pero Recomendado)

No tienes que esperar a la medianoche para comprobar que funciona:

1. En tu repositorio de GitHub, ve a la pestaña **Actions**.
2. En el panel izquierdo, selecciona el flujo **Supabase Keep-Alive Daily Ping**.
3. Haz clic en el botón **Run workflow** ➔ **Run workflow** (o usa el botón **"☁️ Disparar en Nube"** del Dashboard Web local).
4. En unos segundos verás un ícono verde de éxito `✓`.

¡Y listo! A partir de este momento, GitHub ejecutará este flujo **automáticamente todos los días a las 00:00 UTC**, manteniendo tus proyectos de Supabase activos de forma indefinida.

---

## 🖥️ Uso Local con Dashboard Web (Opcional)

Si prefieres administrar y ver el estado de tus proyectos desde una interfaz gráfica en tu computadora local:

### 1. Iniciar el Servidor Web Local
```bash
npm start
```

### 2. Abrir el Navegador
Ve a: **[http://localhost:3000](http://localhost:3000)**

Desde el dashboard podrás:
- Ver el estado en vivo de las ejecuciones en la Nube (GitHub Actions).
- Disparar ejecuciones en la nube con 1 solo clic.
- Agregar o editar proyectos locales.
- Realizar pings de prueba inmediatos.

---

## ⚡ Versión Lite (Solo Mantenedor sin Artículos ni Guías)

Si deseas clonar o desplegar este proyecto únicamente como herramienta de trabajo (para tu empresa, clientes o uso personal) **sin la guía didáctica ni textos personales**:

1. **Ruta lista para usar:** Accede directamente a `/lite.html` (ej: `https://tudominio.vercel.app/lite.html`).
2. **Convertir en portada por defecto:** En tu repositorio clonado, renombra `public/lite.html` a `public/index.html`.
3. **Uso 100% headless / sin web:** Solo necesitas GitHub Actions (`.github/workflows/supabase-keeper.yml`) y el secreto `SUPABASE_PROJECTS`. Se ejecutará automáticamente cada 12 horas sin necesidad de desplegar ninguna web.

---

## 📘 Documentación Oficial de Supabase
- Política oficial de suspensiones por inactividad: [https://supabase.com/docs/guides/platform/pausing](https://supabase.com/docs/guides/platform/pausing)
- Documentación técnica interna: Consulta **[DOCUMENTACION.md](file:///c:/PROYECTS/MantenedorSupabase/DOCUMENTACION.md)**.

---

## 📁 Estructura del Proyecto

```
MantenedorSupabase/
├── .github/
│   └── workflows/
│       └── supabase-keeper.yml   # Automatización autónoma en GitHub Actions (cron: 0 */12 * * *)
├── data/
│   ├── projects.json             # Almacenamiento local de proyectos (protegido en Git)
│   └── logs.json                 # Historial local de pings (protegido en Git)
├── lib/
│   └── keeper.js                 # Lógica de peticiones HTTP, enmascaramiento y latidos
├── public/
│   ├── components/               # Arquitectura modular de componentes
│   │   ├── header.js             # Barra de navegación fija y controles globales
│   │   ├── hero.js               # Cabecera centrada con degradado verde neon a violeta
│   │   ├── manual.js             # Manual técnico editorial y guía paso a paso
│   │   ├── showcase.js           # Monitor de proyectos en vivo con latencias
│   │   ├── cloud.js              # Auditoría en vivo de GitHub Actions API
│   │   └── footer.js             # Pie con enlaces al autor y docs oficiales
│   ├── index.html                # Aplicación completa con manual y monitor
│   └── lite.html                 # Versión Lite independiente (solo mantenedor)
├── scripts/
│   └── ping.js                   # Script CLI para ejecución local manual o cron
├── .env.example                  # Plantilla de variables de entorno
├── DOCUMENTACION.md              # Documentación técnica detallada
├── README.md                     # Guía de inicio rápido y configuración
├── package.json                  # Dependencias y scripts
└── server.js                     # Servidor Express y endpoints API REST
```

---

## 🛠️ Registro de Incidentes y Mejoras de Resiliencia

### ⚠️ Incidente: Notificaciones de Pausa por Inactividad tras Pings en Raíz (`/rest/v1/`)
- **Síntoma:** Proyectos en plan gratuito recibieron avisos de pausa inminente por inactividad de 7 días a pesar de que el mantenedor reportaba ejecuciones diarias exitosas.
- **Causa Raíz:**
  1. Al configurar proyectos sin especificar una tabla concreta, las peticiones se enviaban a la raíz de la API PostgREST (`https://<ref>.supabase.co/rest/v1/`).
  2. Supabase bloquea por seguridad el acceso a la raíz OpenAPI con claves públicas `anon`, devolviendo `HTTP 401 Unauthorized: Only service_role API key can be used for this endpoint`.
  3. Este bloqueo es ejecutado en el API Gateway perimetral (Kong) **antes de que la petición llegue a PostgreSQL**.
  4. Debido a que el software consideraba respuestas HTTP `< 500` como proyectos "despiertos", se generaba un **falso positivo** en los logs mientras la base de datos PostgreSQL permanecía sin ninguna consulta real.
- **Resolución y Mejoras Implementadas:**
  1. **Consultas Directas a Tablas (`target: "table"`):** Se estableció como método oficial consultar una tabla existente mediante `GET /rest/v1/<tabla>?select=*&limit=1`, garantizando que PostgreSQL procese una consulta SQL legítima y reinicie la telemetría de inactividad.
  2. **Auto-Recuperación y Auto-Descubrimiento en Caliente:** El motor de ejecución ([`lib/keeper.js`](file:///c:/PROYECTS/MantenedorSupabase/lib/keeper.js)) ahora detecta automáticamente si una petición en raíz o tabla da 401/404 y sondea de inmediato tablas públicas comunes o endpoints de Storage (`/storage/v1/bucket`) hasta obtener un HTTP 200 OK en Postgres de manera autónoma.
  3. **Validación Estricta de Códigos HTTP:** Se eliminaron los falsos positivos. Únicamente respuestas HTTP 2xx (200-299) son catalogadas como `SUCCESS`. Códigos 401 o 404 se reportan inmediatamente como `FAILED` con alertas descriptivas.
  4. **Optimización Visual en Dispositivos Móviles:** Se optimizó la interfaz para pantallas de 380px de ancho, incluyendo etiquetas compactas responsivas ("Latido", "SSL", "API"), prevención de saltos a 2 líneas y barras táctiles de scroll horizontal.
  5. **Sincronización de Entornos (GitHub vs Vercel):** Se aclaró la independencia entre los Secrets de GitHub (usados en Actions) y las Variables de Entorno de Vercel (usadas en la Web UI).
  6. **Aislamiento de `CRON_SECRET`:** Se restringió la validación de contraseñas de cron únicamente al endpoint `/api/cron`, garantizando que el botón de latido manual en la interfaz web (`/api/ping-all`) funcione siempre con 1 solo clic.

---

## 📝 Licencia

MIT - Libre para uso personal y comercial.
