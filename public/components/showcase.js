// public/components/showcase.js
// Monitor en vivo y prueba de concepto real de los proyectos activos

function renderShowcase(containerId, projects, storedPings) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white/60 dark:bg-slate-900/30">
        <p class="text-sm text-slate-500 dark:text-slate-400">No se detectaron proyectos configurados en la variable SUPABASE_PROJECTS.</p>
      </div>
    `;
    return;
  }

  const cardsHtml = projects.map((p, index) => {
    const nameKey = 'name_' + (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const lastPing = storedPings[p.id] || storedPings[nameKey] || p.lastPing;
    const hasPing = Boolean(lastPing);
    const latency = hasPing ? lastPing.latencyMs : null;
    const latencyText = latency !== null ? `${latency} ms` : '—';
    const httpStatus = hasPing ? (lastPing.httpStatus || 200) : null;
    const timestampText = hasPing 
      ? new Date(lastPing.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : 'Esperando primer latido';

    // Latency badge color
    let latencyBadgeColor = 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800/60 dark:border-slate-700';
    if (latency !== null) {
      if (latency < 250) latencyBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
      else if (latency < 600) latencyBadgeColor = 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-500/10 dark:border-cyan-500/30';
      else latencyBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
    }

    return `
      <div class="p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/50 backdrop-blur-xl shadow-soft-card dark:shadow-none hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
        
        <div>
          <div class="flex items-start justify-between gap-2.5 mb-3">
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">${escapeHtml(p.name)}</h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 pulse-glow"></span>
                  Warm
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span class="truncate text-slate-700 dark:text-slate-300 font-medium" title="Endpoint protegido con SSL">${escapeHtml(p.urlMasked || p.url || 'https://••••••••.supabase.co')}</span>
              </div>
            </div>

            <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 sm:px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shrink-0">
              ${p.target === 'auth' ? 'Auth Health' : (p.target === 'table' ? 'Table Query' : 'REST Root')}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 sm:gap-3 my-4 sm:my-5 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-950/70 dark:border-slate-800/80">
            <div>
              <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Latencia de Red</span>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-lg border ${latencyBadgeColor}" id="lat-${p.id}">
                  ${latencyText}
                </span>
                ${httpStatus ? `<span class="text-[10px] font-mono text-slate-500 dark:text-slate-400">HTTP ${httpStatus}</span>` : ''}
              </div>
            </div>

            <div>
              <span class="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Último Latido</span>
              <p class="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 mt-1" id="time-${p.id}">
                ${timestampText}
              </p>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <span class="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Inactividad evitada
          </span>

          <button onclick="pingSingleProject('${p.id}', this)" class="px-3 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/80 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 active:scale-95 shrink-0">
            <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            <span>Enviar Latido</span>
          </button>
        </div>

      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-5 sm:space-y-6">
      
      <!-- Subtítulo técnico -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Bases de Datos en Monitoreo Continuo</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">SSL Encrypted</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Demostración en vivo de los 4 proyectos protegidos. Haz clic en "Enviar Latido" para comprobar la latencia.</p>
        </div>

        <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-white dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
          <svg class="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Credenciales Privadas</span>
        </div>
      </div>

      <!-- Grid de tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        ${cardsHtml}
      </div>

    </div>
  `;
}
