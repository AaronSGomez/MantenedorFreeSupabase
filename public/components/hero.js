// public/components/hero.js
// Hero centrado con fondo gradiente de verde neón a violeta suave (igual en claro y oscuro)

function renderHero(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <section class="relative w-full overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-violet-600/20 py-10 sm:py-16 transition-colors">
      
      <!-- Efecto de resplandor ambiental suave -->
      <div class="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div class="h-64 w-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div class="h-64 w-96 rounded-full bg-violet-600/10 blur-3xl"></div>
      </div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center space-y-5">
        
        <!-- Badges y Enlaces Oficiales Centrados -->
        <div class="flex flex-wrap items-center justify-center gap-2.5">
          <span class="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30 shadow-sm">
            <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 pulse-glow"></span>
            Manual Técnico & Keep-Alive Open-Source
          </span>

          <a href="https://supabase.com/docs/guides/platform/pausing" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-cyan-800 bg-cyan-50 border border-cyan-300 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 hover:underline shadow-sm">
            <svg class="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>Docs Oficiales: Pausas en Supabase</span>
            <svg class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
          </a>

          <a href="/lite.html" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium text-violet-800 bg-violet-50 border border-violet-300 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30 hover:underline shadow-sm font-mono">
            <span>⚡ Modo Lite (Solo Mantenedor)</span>
          </a>
        </div>

        <!-- Título H1 Centrado con Fuente Syne y Degradado Neón -->
        <div class="space-y-1.5">
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight">
            <span class="neon-text">Supalive</span>
          </h1>
          <p class="text-xl sm:text-2xl font-sans font-bold text-slate-900 dark:text-white tracking-tight max-w-2xl mx-auto">
            Cómo operar en la capa gratuita de Supabase sin pausas por inactividad
          </p>
        </div>

        <!-- Descripción Centrada -->
        <p class="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
          Un manual técnico abierto para desarrolladores y startups. Aprende a crear tu propio flujo automatizado con GitHub Actions para mantener tus instancias activas legítimamente a coste cero, o despliega este monitor web en Vercel con tu dominio propio.
        </p>

        <!-- Métricas Horizontales Centradas -->
        <div class="flex flex-wrap items-center justify-center gap-y-3 gap-x-6 sm:gap-x-8 pt-4 border-t border-slate-300/60 dark:border-slate-800/80 text-xs sm:text-sm w-full max-w-2xl mx-auto">
          <div class="flex items-center gap-1.5 font-mono">
            <span class="text-slate-600 dark:text-slate-400">Bases protegidas:</span>
            <span class="font-bold text-slate-900 dark:text-white text-base" id="hero-total-count">4</span>
          </div>
          <div class="flex items-center gap-1.5 font-mono">
            <span class="text-slate-600 dark:text-slate-400">Frecuencia:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">Cada 12h (0 */12 * * *)</span>
          </div>
          <div class="flex items-center gap-1.5 font-mono">
            <span class="text-slate-600 dark:text-slate-400">Margen:</span>
            <span class="font-bold text-cyan-600 dark:text-cyan-400">14 latidos / sem</span>
          </div>
          <div class="flex items-center gap-1.5 font-mono">
            <span class="text-slate-600 dark:text-slate-400">Último latido:</span>
            <span class="font-semibold text-slate-800 dark:text-slate-200" id="hero-cloud-last">Consultando...</span>
          </div>
        </div>

      </div>
    </section>
  `;
}
