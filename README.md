# ⚡ Mantenedor Supabase (Keep-Alive)

Un proyecto simple, completo y automático diseñado para realizar peticiones periódicas (pings) a tus bases de datos de **Supabase**, evitando que la plataforma suspenda o pause tus proyectos del plan gratuito por inactividad (los cuales se pausan tras 7 días sin recibir tráfico).

---

## 🔒 ¿El repositorio puede ser PÚBLICO? ¿Mis Secrets son seguros?

> **SÍ, 100% SEGURO.** Puedes hacer tu repositorio público en GitHub sin exponer tus credenciales.

- **Los GitHub Secrets NUNCA son visibles**: GitHub encripta los Secrets y jamás los muestra en la web pública ni en los logs.
- **Tus claves locales están protegidas**: Los archivos `data/projects.json` y `.env` están incluidos en `.gitignore` para que **jamás se suban a Git**.
- Al usar **GitHub Secrets**, tu código es 100% público, pero tus credenciales de Supabase se mantienen 100% privadas y encriptadas.

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
git remote add origin https://github.com/TU-USUARIO/MantenedorSupabase.git
git push -u origin main
```
*(Puedes hacer el repositorio **Público** o **Privado** según prefieras)*.

---

### 📌 Paso 2: Configurar tus Proyectos en GitHub Secrets

Para que GitHub sepa qué proyectos de Supabase debe mantener vivos sin publicar tus claves en el código:

1. Ve a tu repositorio en GitHub.
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
3. Haz clic en el botón **Run workflow** ➔ **Run workflow**.
4. En unos segundos verás un ícono verde de éxito `✓`. Haz clic en él para ver el detalle de los pings realizados a tus bases de datos.

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
- Agregar o editar proyectos con un formulario interactivo.
- Probar el botón **"Ping a Todos"** o hacer ping individual a cada proyecto.
- Ver la latencia en milisegundos, el código HTTP devuelto y el historial de ejecuciones.

---

## ⚙️ ¿Cómo Funciona por Dentro?

1. **Cada día a las 00:00 UTC**, GitHub Actions inicia una máquina virtual temporal.
2. El script de Node.js lee la variable de entorno `SUPABASE_PROJECTS` que configuraste en GitHub Secrets.
3. Realiza una petición `GET` autenticada a la API REST de cada uno de tus proyectos de Supabase.
4. Al recibir la petición HTTP, Supabase activa el motor de la base de datos PostgreSQL y el servicio PostgREST, **reiniciando el contador de inactividad de 7 días**.
5. La máquina virtual de GitHub finaliza y registra el éxito en la pestaña **Actions**.

---

## 📘 Documentación Explicativa Técnica

Para consultar una explicación más detallada sobre las estrategias de ping, códigos de respuesta HTTP, cabeceras enviadas y la arquitectura técnica:
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
│   └── index.html                # Dashboard Web SPA (TailwindCSS + Lucide Icons)
├── scripts/
│   └── ping.js                   # Script ejecutable por CLI y GitHub Actions
├── .env.example                  # Plantilla de variables de entorno
├── DOCUMENTACION.md              # Documentación técnica detallada
├── README.md                     # Guía de inicio rápido y configuración paso a paso
├── package.json                  # Configuración de dependencias y scripts npm
└── server.js                     # Servidor Express & API REST
```

---

## 📝 Licencia

MIT - Libre para uso personal y comercial.
