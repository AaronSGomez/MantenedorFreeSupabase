// public/components/footer.js
// Footer fijo en modo oscuro para estilo de biblioteca técnica

function renderFooter(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <footer class="mt-auto border-t border-slate-800 bg-[#090d16] text-slate-400 py-10 font-mono text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <p class="text-white font-bold text-sm flex items-center gap-2">
              <span>Supalive</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open Source Manual</span>
            </p>
            <p class="text-xs text-slate-400 mt-1">Manual técnico y mantenedor para operar en la capa gratuita de Supabase sin suspensiones por inactividad.</p>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-[11px]">
            <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Cron: <code>0 */12 * * *</code></span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">GitHub Actions (Ubuntu 24.04)</span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">Cero Coste Operativo</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© 2026 Supalive · Diseñado para desarrolladores y proyectos independientes.</p>
          <div class="flex items-center gap-4">
            <a href="https://github.com/AaronSGomez/MantenedorFreeSupabase" target="_blank" class="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Repositorio en GitHub</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
            <span>•</span>
            <a href="https://supabase.com/docs/guides/platform/pausing" target="_blank" class="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <span>Documentación Oficial Supabase</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  `;
}
