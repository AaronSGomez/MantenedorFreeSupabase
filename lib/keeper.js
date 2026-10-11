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
  let targetUrl = project.url.trim().replace(/\/+$/, '');
  
  if (project.target === 'table' && project.customTable) {
    targetUrl += `/rest/v1/${project.customTable.trim()}?select=*&limit=1`;
  } else if (project.target === 'auth') {
    targetUrl += `/auth/v1/health`;
  } else {
    // Default REST API root ping
    targetUrl += `/rest/v1/`;
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

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;
    logEntry.latencyMs = latencyMs;
    logEntry.httpStatus = response.status;

    // HTTP 2xx or 401/404/400 still means Supabase DB & PostgREST engine responded!
    if (response.ok || (response.status >= 200 && response.status < 500)) {
      logEntry.status = 'SUCCESS';
      logEntry.message = `Respuesta HTTP ${response.status} (${response.statusText || 'OK'}). Proyecto despierto.`;
    } else {
      logEntry.status = 'FAILED';
      logEntry.message = `Error HTTP ${response.status}: ${response.statusText}`;
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
