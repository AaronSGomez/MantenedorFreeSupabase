// public/components/cloud.js
// Componente de auditoría en vivo desde la API de GitHub Actions

function renderCloud(containerId, cloudState) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let rowsHtml = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400 font-sans">Consultando ejecuciones en la nube...</td></tr>`;

  if (cloudState && cloudState.runs && cloudState.runs.length > 0) {
    rowsHtml = cloudState.runs.map(r => {
      const isSuccess = r.conclusion === 'success';
      const badge = isSuccess
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">ÉXITO ✓</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">${(r.conclusion || r.status || 'EN CURSO').toUpperCase()}</span>`;

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
          <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">${escapeHtml(r.name)}</td>
          <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${escapeHtml(r.event)}</td>
          <td class="px-4 py-3 text-slate-700 dark:text-slate-300">${escapeHtml(r.status)}</td>
          <td class="px-4 py-3">${badge}</td>
          <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${new Date(r.created_at).toLocaleString()}</td>
          <td class="px-4 py-3 text-right">
            <a href="${r.html_url}" target="_blank" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-cyan-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 rounded-lg text-[11px] font-medium inline-flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-all">
              Registro en GitHub ↗
            </a>
          </td>
        </tr>
      `;
    }).join('');
  } else if (cloudState && (!cloudState.available || !cloudState.runs)) {
    rowsHtml = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-400 font-sans">No se pudieron consultar ejecuciones de GitHub Actions.</td></tr>`;
  }

  container.innerHTML = `
    <div class="space-y-5 sm:space-y-6">
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Historial en Tiempo Real de GitHub Actions</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25">Live API</span>
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Auditoría pública e inmutable consultada directamente desde GitHub sin base de datos externa.</p>
        </div>

        <button onclick="fetchCloudStatus()" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 active:scale-95 shrink-0">
          <svg class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67"/></svg>
          Actualizar Registros
        </button>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-slate-900/50 overflow-hidden shadow-soft-card dark:shadow-none">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs font-mono text-slate-700 dark:text-slate-300 min-w-[560px]">
            <thead class="bg-slate-50 text-slate-500 border-b border-slate-200 dark:bg-slate-950/60 dark:text-slate-400 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th class="px-4 py-3">Flujo de Trabajo</th>
                <th class="px-4 py-3">Disparador</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Resultado</th>
                <th class="px-4 py-3">Fecha y Hora</th>
                <th class="px-4 py-3 text-right">Verificación</th>
              </tr>
            </thead>
            <tbody id="cloud-tbody" class="divide-y divide-slate-100 dark:divide-slate-800/60">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
