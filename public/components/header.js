// public/components/header.js
// Header fijo en modo oscuro para estilo de biblioteca técnica

function renderHeader(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <header class="sticky top-0 z-50 border-b border-slate-800 bg-[#090d16] text-white backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        <!-- Logo & Titular Técnico -->
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">Supalive</span>
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold shrink-0">Manual & Keep-Alive</span>
            </div>
            <p class="hidden sm:block text-xs text-slate-400 font-mono truncate">Manual técnico y mantenedor autónomo de bases de datos Supabase</p>
          </div>
        </div>

        <!-- Acciones: Tema y Latido Global -->
        <div class="flex items-center space-x-2.5 shrink-0">
          <!-- Toggle Modo Claro/Oscuro -->
          <button onclick="toggleTheme()" id="theme-btn" class="p-2 sm:p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-all active:scale-95" title="Alternar modo de lectura (Claro / Oscuro)">
            <svg id="theme-sun-icon" class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg id="theme-moon-icon" class="w-4 h-4 text-slate-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>

          <!-- Botón de Latido a Todas las Bases de Datos -->
          <button onclick="pingAllProjects()" id="btn-ping-all" class="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 shrink-0">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span class="hidden sm:inline" id="btn-ping-all-text">Latido a Todos</span>
            <span class="sm:hidden" id="btn-ping-all-text-mobile">Latido</span>
          </button>
        </div>

      </div>
    </header>
  `;
}
