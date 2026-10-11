// public/components/manual.js
// Manual técnico educativo: Cómo opera Supabase Free y cómo mantener proyectos autónomos

function renderManual(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-10 max-w-5xl mx-auto">
      
      <!-- Encabezado de la Guía -->
      <div class="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25">
          <span>Manual de Ingeniería · v2.0</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
          Guía Completa: Mantén tus Proyectos Supabase Vivos sin Tráfico Orgánico Diario
        </h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
          Aprende cómo funciona el mecanismo de hibernación de la capa gratuita de Supabase, cómo configurar tu propio repositorio de GitHub para automatizar latidos cada 12 horas a coste cero, y cómo desplegar un monitor con tu propio dominio en Vercel.
        </p>
      </div>

      <!-- SECCIÓN 1: EL PROBLEMA REAL -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">01</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">La Regla de los 7 Días de Supabase y el Mito de las Visitas Web</h3>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <p>
            En la capa gratuita (Free Tier) de Supabase, cada proyecto corre en una instancia dedicada de PostgreSQL dentro de contenedores en la nube. Para liberar memoria y CPU en proyectos abandonados, Supabase aplica una regla inmutable:
          </p>

          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs font-mono">
            <strong>Regla oficial:</strong> Si un proyecto pasa 7 días continuos (168 horas) sin registrar peticiones a la API REST, autenticación o base de datos, la instancia se suspende (estado <code>Paused</code>).
          </div>

          <h4 class="font-bold text-slate-900 dark:text-white pt-2 text-xs sm:text-sm">❌ El gran error que cometen muchos desarrolladores:</h4>
          <p>
            Creer que porque tu web estática (React, Vue, Astro, HTML) recibe visitas todos los días, la base de datos se mantiene despierta. <strong>Falso:</strong> si un visitante entra en una landing page estática o en un blog que tiene caché y no ejecuta una llamada directa a la API de Supabase, <strong>el contador de inactividad de Supabase sigue corriendo</strong>. Si pasan 7 días, tu base de datos se pausará y tu próximo cliente experimentará un retraso de 40 segundos (*cold start*) o un error de conexión.
          </p>

          <h4 class="font-bold text-slate-900 dark:text-white pt-2 text-xs sm:text-sm">✅ La Solución Técnica de Supalive:</h4>
          <p>
            Un latido HTTP autenticado programado cada 12 horas contra la pasarela PostgREST o Auth de tu proyecto. El motor de Supabase procesa la firma del token criptográfico y reinicia el contador de inactividad a <strong>cero días constantemente</strong>, garantizando 100% de disponibilidad sin pagar planes Pro ni VPS.
          </p>
        </div>
      </section>

      <!-- SECCIÓN 2: GITHUB ACTIONS AUTÓNOMO -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">02</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Opción A: Automatización Autónoma con GitHub Actions (Sin PC Encendida)</h3>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <p>
            Esta es la forma más limpia y 100% autónoma. No necesitas ningún servidor encendido ni pagar nada: GitHub te regala <strong>2.000 minutos mensuales</strong> de ejecución en la nube.
          </p>

          <ol class="list-decimal list-inside space-y-3 pl-1 font-sans">
            <li>
              <strong>Haz un Fork o clona el repositorio:</strong><br>
              <code class="text-xs bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-800 dark:text-slate-200 font-mono mt-1 inline-block">https://github.com/AaronSGomez/MantenedorFreeSupabase</code>
            </li>
            <li>
              <strong>El flujo ya viene preparado en el archivo:</strong><br>
              <span class="text-xs font-mono text-emerald-600 dark:text-emerald-400">.github/workflows/supabase-keeper.yml</span>
            </li>
            <li>
              <strong>Configura el secreto en GitHub:</strong><br>
              Entra a tu repositorio en GitHub ➔ <b>Settings</b> ➔ <b>Secrets and variables</b> ➔ <b>Actions</b>.<br>
              Haz clic en <b>New repository secret</b>:<br>
              • <b>Name:</b> <code class="font-mono font-bold text-emerald-600 dark:text-emerald-400">SUPABASE_PROJECTS</code><br>
              • <b>Secret:</b> Pega el JSON con tus proyectos (ver formato en el paso 04).
            </li>
          </ol>

          <!-- Bloque de Código YAML -->
          <div class="space-y-2 pt-2">
            <span class="text-xs font-mono text-slate-500 block">Flujo de GitHub Actions (.github/workflows/supabase-keeper.yml):</span>
            <div class="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
<pre><code>name: Supabase Keep-Alive Daily Ping
on:
  schedule:
    # Corre automáticamente cada 12 horas (00:00 y 12:00 UTC)
    - cron: '0 */12 * * *'
  workflow_dispatch: # Permite dispararlo a mano desde GitHub

jobs:
  ping-supabase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - name: Ejecutar Mantenedor Supabase
        env:
          SUPABASE_PROJECTS: \${{ secrets.SUPABASE_PROJECTS }}
        run: npm run ping</code></pre>
            </div>
          </div>

          <p class="text-xs text-slate-500 dark:text-slate-400">
            A partir de ese momento, los servidores de GitHub ejecutarán este script 2 veces al día (14 veces por semana) sin que tengas que tocar nada.
          </p>
        </div>
      </section>

      <!-- SECCIÓN 3: DESPLIEGUE EN VERCEL -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">03</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Opción B: Despliegue en Vercel con tu Dominio (Monitor Web y Control Manual)</h3>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <p>
            Si quieres tener una web pública o privada para ver tus bases de datos, comprobar su latencia y enviar latidos manuales desde tu teléfono o portátil:
          </p>

          <ol class="list-decimal list-inside space-y-2.5 pl-1 font-sans">
            <li>Ve a <b>vercel.com</b> e importa el repositorio desde tu cuenta de GitHub.</li>
            <li>
              En el paso de configuración de Vercel (o en <b>Project Settings ➔ Environment Variables</b>):<br>
              • <b>Key:</b> <code class="font-mono font-bold text-cyan-600 dark:text-cyan-400">SUPABASE_PROJECTS</code><br>
              • <b>Value:</b> El mismo JSON con tus proyectos.
            </li>
            <li>Haz clic en <b>Deploy</b>. ¡Y listo! Ya tienes tu servidor web funcionando de inmediato.</li>
            <li>
              *(Opcional)* En <b>Settings ➔ Domains</b> de Vercel puedes conectar tu propio dominio (ejemplo: <code>monitor.tuweb.com</code>).
            </li>
          </ol>

          <div class="p-3.5 bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/20 dark:border-cyan-900/40 rounded-xl text-cyan-900 dark:text-cyan-200 text-xs font-mono">
            💡 <strong>Nota de arquitectura:</strong> En Vercel, cada latido que envías desde el botón web despierta tus bases de datos de inmediato en 200ms y <strong>consume cero minutos de GitHub Actions</strong>.
          </div>
        </div>
      </section>

      <!-- SECCIÓN 4: FORMATO DEL JSON -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">04</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Formato Exacto de la Variable SUPABASE_PROJECTS</h3>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <p>
            Tanto en GitHub Secrets como en Vercel, la configuración se define como un arreglo JSON con tus proyectos. Puedes añadir todos los que necesites:
          </p>

          <div class="p-4 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto border border-slate-800">
<pre><code>[
  {
    "name": "Mi Proyecto Producción",
    "url": "https://xyzxyzxyzxyzxyzxyzxy.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "rest"
  },
  {
    "name": "App Móvil Clientes",
    "url": "https://abcabcabcabcabcabcab.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "target": "rest"
  }
]</code></pre>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">¿Dónde se obtienen estos datos en Supabase?</h4>
            <ul class="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <li>Entra en tu panel de Supabase ➔ Selecciona tu proyecto.</li>
              <li>Menú inferior izquierdo ➔ <b>Project Settings (el engranaje ⚙️)</b> ➔ <b>API</b>.</li>
              <li>Copia la <b>Project URL</b> (ej. <code>https://xyz.supabase.co</code>).</li>
              <li>Copia la <b>anon public API key</b> (empieza por <code>eyJhbGci...</code>).</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECCIÓN 5: PRIVACIDAD Y SEGURIDAD -->
      <section class="space-y-4">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">05</span>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Privacidad y Seguridad: ¿Por qué es Seguro tener el Repositorio Público?</h3>
        </div>

        <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-sm">
          <ul class="space-y-2 text-xs">
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>Cero credenciales en código:</strong> Las claves y URLs jamás se escriben en los archivos del repositorio ni se hacen commit. Residen únicamente en los Secrets cifrados de GitHub y en las variables de entorno de Vercel.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>Enmascaramiento en tiempo real:</strong> En el servidor, las URLs y las claves se ofuscan antes de transmitirse al navegador. Ningún visitante de tu web puede extraer la URL real ni las llaves.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-500 font-bold shrink-0">✓</span>
              <span><strong>Sin riesgo de inyecciones:</strong> Los pings son peticiones GET de solo lectura. No modifican filas, no alteran esquemas ni ejecutan transacciones de escritura.</span>
            </li>
          </ul>
        </div>
      </section>

    </div>
  `;
}
