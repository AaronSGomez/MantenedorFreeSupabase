// public/components/footer.js
// Footer fijo en modo oscuro con enlaces al autor, código y documentación oficial

function renderFooter(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <footer class="mt-auto border-t border-slate-800 bg-[#070b14] text-slate-400 py-10 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-white font-display font-extrabold text-base tracking-wide">Supalive</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Open Source Engineering</span>
            </div>
            <p class="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Manual técnico y mantenedor para operar en la capa gratuita de Supabase sin suspensiones por inactividad. 100% legal, documentado y reproducible.
            </p>
          </div>

          <!-- Enlaces Principales: Autor (Portfolio), GitHub y Docs Oficiales -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Enlace al Portfolio con texto exacto AaronSGomez -->
            <a href="https://aaronsgomez.es" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-2 text-xs font-semibold shadow-sm">
              <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span>AaronSGomez</span>
              <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>

            <!-- Enlace a GitHub del Autor -->
            <a href="https://github.com/AaronSGomez" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold shadow-sm">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              <span>GitHub</span>
            </a>

            <!-- Documentación Oficial de Supabase -->
            <a href="https://supabase.com/docs/guides/platform/pausing" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 transition-all flex items-center gap-2 text-xs font-semibold shadow-sm">
              <svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>Docs Oficiales Supabase</span>
              <svg class="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] font-mono">
          <p>© 2026 Aarón Santiago Gómez Abella · Supalive Engineering.</p>
          <div class="flex items-center gap-4">
            <a href="https://github.com/AaronSGomez/MantenedorFreeSupabase" target="_blank" class="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Repositorio del Proyecto</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
            </a>
            <span>•</span>
            <span class="text-slate-400">Cron: <code>0 */12 * * *</code></span>
          </div>
        </div>

      </div>
    </footer>
  `;
}
