const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');

// Ensure data directory exists (seguro para entornos de sólo lectura como Vercel)
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    // Normal en entornos serverless/Vercel (sistema de archivos de sólo lectura)
  }
}

// Generar un ID determinista y estable para cada proyecto de entorno
function getStableId(ep, index) {
  if (ep.id) return String(ep.id);
  if (ep.name) {
    const slug = ep.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    if (slug) return 'proj-' + slug;
  }
  if (ep.url) {
    try {
      const u = new URL(ep.url);
      const sub = u.hostname.split('.')[0];
      if (sub) return 'proj-' + sub;
    } catch (e) {}
  }
  return 'proj-' + index;
}

// Get all projects (combining data file & process.env.SUPABASE_PROJECTS)
function getProjects() {
  ensureDataDir();
  let projects = [];

  // 1. Load from projects.json file if exists
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      projects = JSON.parse(data);
    }
  } catch (err) {
    // Archivo no existe o no se pudo leer
  }

  // 2. Load from environment variable (soporta mayúsculas y minúsculas: SUPABASE_PROJECTS o supabase_projects)
  const envRaw = process.env.SUPABASE_PROJECTS || process.env.supabase_projects || process.env.Supabase_Projects;
  if (envRaw) {
    try {
      let cleaned = String(envRaw).trim();
      // Remover comillas envolventes accidentales (' o ")
      if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"') && !cleaned.startsWith('[') && !cleaned.startsWith('{'))) {
        cleaned = cleaned.slice(1, -1).trim();
      }
      let envProjects = JSON.parse(cleaned);
      if (typeof envProjects === 'string') {
        envProjects = JSON.parse(envProjects);
      }
      if (Array.isArray(envProjects)) {
        envProjects.forEach((ep, index) => {
          const stableId = getStableId(ep, index);
          if (!projects.some(p => p.id === stableId || p.url === ep.url)) {
            projects.push({
              id: stableId,
              name: ep.name || 'Proyecto Supabase',
              url: ep.url,
              key: ep.key,
              target: ep.target || 'rest',
              customTable: ep.customTable || '',
              enabled: ep.enabled !== false,
              createdFromEnv: true
            });
          }
        });
      }
    } catch (err) {
      console.error('Error al procesar variable de entorno SUPABASE_PROJECTS:', err.message);
    }
  }

  return projects;
}

// Save projects list to projects.json
function saveProjects(projects) {
  try {
    ensureDataDir();
    // Filter out temporary env projects before saving to disk
    const fileProjects = projects.filter(p => !p.createdFromEnv);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(fileProjects, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Keeper] Aviso: No se pudo escribir en disco (normal en entornos serverless/Vercel):', err.message);
  }
}

// Get logs
function getLogs(limit = 100) {
  ensureDataDir();
  try {
    if (!fs.existsSync(LOGS_FILE)) return [];
    const data = fs.readFileSync(LOGS_FILE, 'utf8');
    const logs = JSON.parse(data);
    return logs.slice(0, limit);
  } catch (err) {
    return [];
  }
}

// Add a log entry
function addLog(logEntry) {
  ensureDataDir();
  let logs = getLogs(500);
  logs.unshift(logEntry); // Prepend newest log
  if (logs.length > 300) {
    logs = logs.slice(0, 300); // Keep last 300 logs
  }
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
  } catch (err) {
    console.error('Error al guardar log:', err.message);
  }
}

// Ping a single project
async function pingProject(project) {
  const startTime = Date.now();
  const baseOrigin = project.url.trim().replace(/\/+$/, '');
  let targetUrl = '';
  
  if (project.target === 'storage') {
    targetUrl = `${baseOrigin}/storage/v1/bucket`;
  } else if (project.target === 'auth') {
    targetUrl = `${baseOrigin}/auth/v1/health`;
  } else if (project.customTable && project.customTable.trim()) {
    targetUrl = `${baseOrigin}/rest/v1/${project.customTable.trim()}?select=*&limit=1`;
  } else if (project.target === 'table') {
    targetUrl = `${baseOrigin}/rest/v1/mantenedor?select=*&limit=1`;
  } else {
    // Si no se especificó tabla, intentar primero la raíz rest
    targetUrl = `${baseOrigin}/rest/v1/`;
  }

  const headers = {
    'User-Agent': 'SupabaseMantenedor/1.0',
    'Accept': 'application/json'
  };

  if (project.key) {
    headers['apikey'] = project.key.trim();
    headers['Authorization'] = `Bearer ${project.key.trim()}`;
  }

  let logEntry = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name,
    targetUrl,
    status: 'UNKNOWN',
    httpStatus: null,
    latencyMs: 0,
    message: ''
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Si la llamada fue rechazada con 401 o 404 (Kong bloquea anon en raíz, o la tabla elegida requiere RLS/da permiso denegado),
    // intentar auto-descubrir tablas públicas o storage para forzar una consulta real con HTTP 200 en Postgres
    if ((response.status === 401 || response.status === 404) && project.target !== 'auth') {
      const candidates = ['mantenedor', 'photos', 'question', 'projects', 'invitados', 'mesas', 'users', 'roles'];
      let foundCandidate = null;

      for (const cand of candidates) {
        if (project.customTable && cand === project.customTable.trim()) continue; // Ya falló
        try {
          const testUrl = `${baseOrigin}/rest/v1/${cand}?select=*&limit=1`;
          const testRes = await fetch(testUrl, { method: 'GET', headers });
          if (testRes.ok) {
            foundCandidate = { table: cand, res: testRes, url: testUrl };
            break;
          }
        } catch (e) {}
      }

      // Si ninguna tabla pública respondió 200, probar el endpoint de buckets de Storage
      if (!foundCandidate) {
        try {
          const storageUrl = `${baseOrigin}/storage/v1/bucket`;
          const testStorage = await fetch(storageUrl, { method: 'GET', headers });
          if (testStorage.ok) {
            foundCandidate = { target: 'storage', res: testStorage, url: storageUrl };
          }
        } catch (e) {}
      }

      if (foundCandidate) {
        response = foundCandidate.res;
        targetUrl = foundCandidate.url;
        logEntry.targetUrl = targetUrl;
        if (foundCandidate.table) {
          project.target = 'table';
          project.customTable = foundCandidate.table;
        } else if (foundCandidate.target) {
          project.target = foundCandidate.target;
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    logEntry.latencyMs = latencyMs;
    logEntry.httpStatus = response.status;

    // Solo HTTP 2xx (200-299) garantiza que Postgres ejecutó la consulta y reseteó el temporizador de inactividad
    if (response.ok) {
      logEntry.status = 'SUCCESS';
      logEntry.message = `Respuesta HTTP ${response.status} (OK). Consulta a Postgres ejecutada y actividad registrada.`;
    } else if (response.status === 401) {
      logEntry.status = 'FAILED';
      logEntry.message = `Alerta HTTP 401 (No autorizado): PostgREST/Kong rechazó la petición. Supabase NO registrará actividad. Configura una tabla pública en customTable.`;
    } else if (response.status === 404) {
      logEntry.status = 'FAILED';
      logEntry.message = `Error HTTP 404: Tabla o endpoint no encontrado. Verifica el nombre de la tabla en customTable.`;
    } else {
      logEntry.status = 'FAILED';
      logEntry.message = `Error HTTP ${response.status}: ${response.statusText || 'Petición rechazada'}`;
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logEntry.latencyMs = latencyMs;
    logEntry.status = 'FAILED';
    if (err.name === 'AbortError') {
      logEntry.message = 'Tiempo de espera agotado (Timeout 15s)';
    } else {
      logEntry.message = `Error de conexión: ${err.message}`;
    }
  }

  // Save log
  addLog(logEntry);

  // Update project lastPing state
  updateProjectStatus(project.id, logEntry);

  return logEntry;
}

// Update lastPing info inside project object
function updateProjectStatus(projectId, logEntry) {
  const projects = getProjects();
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.lastPing = {
      timestamp: logEntry.timestamp,
      status: logEntry.status,
      httpStatus: logEntry.httpStatus,
      latencyMs: logEntry.latencyMs,
      message: logEntry.message
    };
    saveProjects(projects);
  }
}

// Ping all active projects
async function pingAllProjects() {
  const projects = getProjects();
  const activeProjects = projects.filter(p => p.enabled !== false);
  
  console.log(`[Keeper] Iniciando ping a ${activeProjects.length} proyecto(s)...`);
  const results = [];

  for (const project of activeProjects) {
    console.log(`[Keeper] Pingeando "${project.name}" (${project.url})...`);
    const result = await pingProject(project);
    console.log(`[Keeper] "${project.name}" -> ${result.status} (${result.latencyMs}ms, HTTP ${result.httpStatus})`);
    results.push(result);
  }

  return results;
}

module.exports = {
  getProjects,
  saveProjects,
  getLogs,
  pingProject,
  pingAllProjects
};
