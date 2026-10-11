// public/components/manual.js
// Manual técnico educativo: Cómo opera Supabase Free y cómo mantener proyectos autónomos
// Formato editorial y limpio estilo documentación técnica (sin exceso de tarjetas)

function renderManual(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <article class="max-w-4xl mx-auto space-y-12 sm:space-y-16 pb-12">
      
      <!-- Encabezado de la Guía Editorial -->
      <header class="space-y-4 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
          <span>Manual de Ingeniería · Keep-Alive Supabase Free</span>
        </div>
        
        <h2 class="text-2xl sm:text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">
          Guía Técnica: Cómo mantener tus bases de datos Supabase activas 24/7 sin coste
        </h2>

        <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
          Un manual paso a paso sobre el ciclo de vida de la capa gratuita de Supabase, las políticas oficiales de hibernación por inactividad y cómo automatizar latidos HTTP seguros mediante GitHub Actions o Vercel.
        </p>

        <!-- Banner de Transparencia y Documentación Oficial -->
        <div class="p-4 sm:p-5 rounded-xl border-l-4 border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 border border-slate-200 dark:border-slate-800/80 space-y-2 mt-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <span class="text-xs font-mono uppercase tracking-wider font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Documentación Oficial y Transparencia
            </span>
            <a href="https://supabase.com/docs/guides/platform/pausing" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:text-cyan-600 dark:hover:text-cyan-200 underline flex items-center gap-1">
              <span>Leer política oficial en supabase.com</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
          <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <em>"Projects on the Free Plan are paused after 7 days of inactivity. When a project is paused, its compute resources are deactivated to save resources."</em> — Esta guía explica cómo gestionar este ciclo legítimamente dentro de los límites y cuotas estándar de Supabase y GitHub.
          </p>
        </div>
      </header>

      <!-- CAPÍTULO 1 -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">CAPÍTULO 01</span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            La Regla de los 7 Días y la Falacia de las Visitas Web
          </h3>
        </div>

        <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          En la capa gratuita (Free Tier) de Supabase, cada proyecto corre en un contenedor dedicado de PostgreSQL. Para optimizar infraestructura y no mantener recursos de CPU/RAM asignados a proyectos abandonados, Supabase establece que:
        </p>

        <div class="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
          <strong>Regla:</strong> Si un proyecto pasa 7 días seguidos (168 horas) sin recibir tráfico hacia la API REST, autenticación o conexión a PostgreSQL, el contenedor entra en estado <code>Paused</code> (hibernación).
        </div>

        <div class="space-y-3 pt-2">
          <h4 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-red-500 font-bold">✕</span> El gran error de concepto
          </h4>
          <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Muchos desarrolladores piensan: <em>"Mi web o portfolio recibe visitas todos los días, así que mi base de datos no se pausará jamás"</em>. <strong>Esto es falso si tu web es estática o usa caché</strong>. Si un visitante navega por tu frontend (en Astro, Next.js estático, React o WordPress) y no realiza una consulta que envíe una petición HTTP directa a la API de Supabase, <strong>el temporizador de inactividad de Supabase no se resetea</strong>.
          </p>
          <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Al cumplirse el día 7, la base de datos se pausa. El próximo usuario que intente rellenar un formulario o iniciar sesión sufrirá un error de desconexión o un retraso de hasta 40 segundos mientras el servidor se reactiva (*cold start*).
          </p>
        </div>

        <div class="space-y-2 pt-2">
          <h4 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="text-emerald-500 font-bold">✓</span> La Solución Técnica de Supalive
          </h4>
          <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            Un latido periódico (cada 12 horas) que realiza una llamada autenticada ligera al endpoint de comprobación de salud o a la raíz de PostgREST de tu proyecto. El motor de Supabase valida el token de autenticación, registra actividad genuina y restablece el contador de inactividad a <strong>cero días de forma continua</strong>.
          </p>
        </div>
      </section>

      <!-- CAPÍTULO 2 -->
      <section class="space-y-5 border-t border-slate-200 dark:border-slate-800 pt-10">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">CAPÍTULO 02</span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Opción A: Automatización Autónoma con GitHub Actions (Recomendada)
          </h3>
        </div>

        <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Esta es la vía más robusta y económica. No necesitas tener ningún ordenador encendido ni pagar servidores VPS. GitHub Actions ofrece <strong>2.000 minutos mensuales gratuitos</strong> para tareas en la nube, y cada ejecución de Supalive apenas consume 8 segundos.
        </p>

        <!-- Pasos en lista limpia con indicadores -->
        <div class="space-y-6 pt-2">
          
          <div class="flex items-start gap-3">
            <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div class="space-y-1.5 flex-1">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Haz un Fork o clona el repositorio</h4>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Accede al repositorio de código abierto y crea una copia en tu cuenta de GitHub:
              </p>
              <div class="pt-1">
                <a href="https://github.com/AaronSGomez/MantenedorFreeSupabase" target="_blank" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 border border-slate-700 text-xs font-mono hover:border-emerald-400 transition-colors">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>github.com/AaronSGomez/MantenedorFreeSupabase</span>
                  <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div class="space-y-1.5 flex-1">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Guarda tu Secreto Cifrado en GitHub</h4>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                En tu repositorio de GitHub, dirígete a: <strong>Settings</strong> ➔ <strong>Secrets and variables</strong> ➔ <strong>Actions</strong>.<br>
                Crea un nuevo secreto haciendo clic en <strong>New repository secret</strong>:
              </p>
              <ul class="text-xs sm:text-sm font-mono space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                <li>• <b>Nombre del Secreto:</b> <code class="text-emerald-700 dark:text-emerald-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">SUPABASE_PROJECTS</code></li>
                <li>• <b>Valor del Secreto:</b> Pega el arreglo JSON con tus proyectos (ver estructura en el Capítulo 04).</li>
              </ul>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div class="space-y-2 flex-1">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">El flujo ya viene preconfigurado en el repositorio</h4>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                El archivo <code class="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.github/workflows/supabase-keeper.yml</code> define la tarea programada:
              </p>
              
              <!-- Bloque de Código de Alto Contraste -->
              <div class="rounded-xl bg-[#090d16] text-slate-200 border border-slate-800 overflow-x-auto p-4 font-mono text-xs leading-relaxed shadow-sm">
<pre><code class="text-slate-300"><span class="text-slate-500"># .github/workflows/supabase-keeper.yml</span>
<span class="text-cyan-400">name:</span> Supabase Keep-Alive Ping
<span class="text-cyan-400">on:</span>
  <span class="text-cyan-400">schedule:</span>
    <span class="text-slate-500"># Se ejecuta 2 veces al día (a las 00:00 y 12:00 UTC)</span>
    - <span class="text-emerald-400">cron: '0 */12 * * *'</span>
  <span class="text-cyan-400">workflow_dispatch:</span> <span class="text-slate-500"># Permite lanzarlo manualmente desde la web de GitHub</span>

<span class="text-cyan-400">jobs:</span>
  <span class="text-cyan-400">keep-alive:</span>
    <span class="text-cyan-400">runs-on:</span> ubuntu-latest
    <span class="text-cyan-400">steps:</span>
      - <span class="text-cyan-400">uses:</span> actions/checkout@v4
      - <span class="text-cyan-400">uses:</span> actions/setup-node@v4
        <span class="text-cyan-400">with:</span>
          <span class="text-cyan-400">node-version:</span> '22'
      - <span class="text-cyan-400">run:</span> npm ci
      - <span class="text-cyan-400">name:</span> Ejecutar Latidos a Supabase
        <span class="text-cyan-400">env:</span>
          <span class="text-emerald-400">SUPABASE_PROJECTS:</span> \${{ secrets.SUPABASE_PROJECTS }}
        <span class="text-cyan-400">run:</span> npm run ping</code></pre>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- CAPÍTULO 3 -->
      <section class="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-10">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">CAPÍTULO 03</span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Opción B: Despliegue en Vercel con tu Dominio Propio
          </h3>
        </div>

        <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Si además del cron autónomo deseas una interfaz web accesible desde cualquier dispositivo para auditar tiempos de respuesta y disparar latidos manuales:
        </p>

        <div class="space-y-3 pt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300">
          <p>
            1. Entra en <strong>vercel.com</strong> e importa tu repositorio de GitHub.<br>
            2. En <strong>Environment Variables</strong> añade la variable:
          </p>
          <div class="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs space-y-1">
            <div><span class="text-slate-500">Key:</span> <span class="text-cyan-600 dark:text-cyan-400 font-bold">SUPABASE_PROJECTS</span></div>
            <div><span class="text-slate-500">Value:</span> <span class="text-slate-700 dark:text-slate-300">[ { "name": "Mi Base", "url": "https://...supabase.co", "key": "..." } ]</span></div>
          </div>
          <p>
            3. Haz clic en <strong>Deploy</strong>. Vercel compilará la API serverless y la interfaz web en menos de 1 minuto.<br>
            4. <em>(Opcional)</em> En <strong>Settings ➔ Domains</strong> puedes vincular tu dominio o subdominio personalizado (por ejemplo: <code>monitor.tuempresa.es</code>).
          </p>
        </div>
      </section>

      <!-- CAPÍTULO 4 -->
      <section class="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-10">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30">CAPÍTULO 04</span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Estructura del JSON de Configuración y Obtención de Claves
          </h3>
        </div>

        <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          El valor de la variable de entorno <code class="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">SUPABASE_PROJECTS</code> es un arreglo JSON con los proyectos que quieres mantener vivos simultáneamente:
        </p>

        <!-- Bloque JSON -->
        <div class="rounded-xl bg-[#090d16] text-emerald-300 border border-slate-800 overflow-x-auto p-4 font-mono text-xs leading-relaxed shadow-sm">
<pre><code>[
  {
    "name": "Proyecto Producción",
    "url": "https://xxxxxxxxxxxxxxxxxxxx.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "rest"
  },
  {
    "name": "Backend App Móvil",
    "url": "https://yyyyyyyyyyyyyyyyyyyy.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "auth"
  }
]</code></pre>
        </div>

        <div class="space-y-2 pt-2">
          <h4 class="text-base font-bold text-slate-900 dark:text-white">¿Dónde se encuentran estas credenciales en Supabase?</h4>
          <ol class="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <li>Inicia sesión en tu consola de <a href="https://supabase.com/dashboard" target="_blank" class="text-emerald-600 dark:text-emerald-400 underline font-medium">Supabase Dashboard</a> y selecciona tu proyecto.</li>
            <li>En la barra lateral izquierda, entra en <strong>Project Settings (icono de engranaje ⚙️)</strong> ➔ <strong>API</strong>.</li>
            <li>Copia el valor de <strong>Project URL</strong> (ejemplo: <code>https://abcdefghijklmn.supabase.co</code>).</li>
            <li>Copia el valor de la clave <strong>anon public API key</strong> (la cadena que comienza por <code>eyJhbG...</code>).</li>
          </ol>
        </div>
      </section>

      <!-- CAPÍTULO 5 -->
      <section class="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-10">
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">CAPÍTULO 05</span>
          <h3 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Seguridad, Claves Públicas Anon y Arquitectura
          </h3>
        </div>

        <p class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          Es fundamental comprender por qué este método es totalmente seguro y no expone tus datos sensibles:
        </p>

        <div class="space-y-3 pt-1 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          <div class="flex items-start gap-3">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold text-base">✓</span>
            <div>
              <strong>Las claves anon son públicas por diseño:</strong> La anon key de Supabase es la misma llave que se incluye en el código frontend de cualquier aplicación web o móvil. La seguridad real de los datos reside en las políticas <em>Row Level Security (RLS)</em> configuradas en PostgreSQL, no en esconder la clave anon.
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold text-base">✓</span>
            <div>
              <strong>Enmascaramiento de URLs en la web:</strong> En la interfaz web desplegada en Vercel, el servidor ofusca automáticamente las URLs del proyecto (ej: <code>https://xyum••••••••.supabase.co</code>) antes de responder al navegador. Los visitantes no ven los identificadores internos de tus proyectos.
            </div>
          </div>

          <div class="flex items-start gap-3">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold text-base">✓</span>
            <div>
              <strong>Peticiones idempotentes y seguras:</strong> Los latidos son peticiones HTTP GET contra la pasarela PostgREST o contra el healthcheck de Auth. No insertan datos basura, no ejecutan transacciones pesadas ni alteran tus tablas.
            </div>
          </div>
        </div>
      </section>

    </article>
  `;
}
