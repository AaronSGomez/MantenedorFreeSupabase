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
  - `REST API Root` (`https://<proyecto>.supabase.co/rest/v1/`): Ligero y seguro (Recomendado).
  - `Auth Health` (`https://<proyecto>.supabase.co/auth/v1/health`): Comprobación del servicio de autenticación.
  - `Consulta a Tabla`: Petición a una tabla específica (ej. `users`, `profiles`, `productos`).

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
    "target": "rest"
  },
  {
    "name": "Mi Proyecto Desarrollo",
    "url": "https://abcabc.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "target": "auth"
  }
]
```

6. Haz clic en **Add secret**.

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

## 📘 Documentación Explicativa Técnica

Para consultar una explicación más detallada sobre la integración con la API de GitHub, estrategias de ping, códigos HTTP y arquitectura técnica:
👉 Consulta el archivo **[DOCUMENTACION.md](file:///c:/PROYECTS/MantenedorSupabase/DOCUMENTACION.md)**.

---

## 📁 Estructura del Proyecto

```
MantenedorSupabase/
├── .github/
│   └── workflows/
│       └── supabase-keeper.yml   # Automatización diaria en GitHub Actions
├── data/
│   ├── projects.json             # Almacenamiento local de proyectos (protegido en Git)
│   └── logs.json                 # Historial local de pings (protegido en Git)
├── lib/
│   └── keeper.js                 # Lógica principal de peticiones y registro de logs
├── public/
│   └── index.html                # Dashboard Web SPA (TailwindCSS + Lucide Icons + GitHub Sync)
├── scripts/
│   └── ping.js                   # Script ejecutable CLI con diagnóstico local y de Nube
├── .env.example                  # Plantilla de variables de entorno
├── DOCUMENTACION.md              # Documentación técnica detallada
├── README.md                     # Guía de inicio rápido y configuración paso a paso
├── package.json                  # Configuración de dependencias y scripts npm
└── server.js                     # Servidor Express, API REST & Integración GitHub Actions
```

---

## 📝 Licencia

MIT - Libre para uso personal y comercial.
