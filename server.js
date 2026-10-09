require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { getProjects, saveProjects, getLogs, pingProject, pingAllProjects } = require('./lib/keeper');

const app = express();
const PORT = process.env.PORT || 3000;
const CRON_SECRET = process.env.CRON_SECRET || '';
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *'; // Default: Midnight every day

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to mask key for security in UI output
function maskKey(key) {
  if (!key) return '';
  if (key.length <= 10) return '***';
  return key.substring(0, 6) + '...' + key.substring(key.length - 4);
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// System Status
app.get('/api/status', (req, res) => {
  const projects = getProjects();
  res.json({
    status: 'online',
    serverTime: new Date().toISOString(),
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.enabled !== false).length,
    cronSchedule: CRON_SCHEDULE,
    cronSecretEnabled: Boolean(CRON_SECRET)
  });
});

// List Projects
app.get('/api/projects', (req, res) => {
  const projects = getProjects();
  // Return projects with masked keys for security unless requested
  const safeProjects = projects.map(p => ({
    ...p,
    keyMasked: maskKey(p.key)
  }));
  res.json(safeProjects);
});

// Create Project
app.post('/api/projects', (req, res) => {
  const { name, url, key, target, customTable, enabled } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'El nombre y la URL de Supabase son obligatorios.' });
  }

  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }

  const projects = getProjects();
  const newProject = {
    id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    url: formattedUrl,
    key: key ? key.trim() : '',
    target: target || 'rest', // 'rest', 'table', 'auth'
    customTable: customTable ? customTable.trim() : '',
    enabled: enabled !== false,
    createdAt: new Date().toISOString(),
    lastPing: null
  };

  projects.push(newProject);
  saveProjects(projects);

  res.status(201).json({
    message: 'Proyecto agregado correctamente',
    project: {
      ...newProject,
      keyMasked: maskKey(newProject.key)
    }
  });
});

// Update Project
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { name, url, key, target, customTable, enabled } = req.body;

  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Proyecto no encontrado.' });
  }

  const existing = projects[index];
  if (existing.createdFromEnv) {
    return res.status(400).json({ error: 'No se puede modificar un proyecto definido por variable de entorno (SUPABASE_PROJECTS).' });
  }

  if (name) existing.name = name.trim();
  if (url) {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    existing.url = formattedUrl;
  }
  if (key !== undefined) existing.key = key.trim();
  if (target) existing.target = target;
  if (customTable !== undefined) existing.customTable = customTable.trim();
  if (enabled !== undefined) existing.enabled = Boolean(enabled);

  projects[index] = existing;
  saveProjects(projects);

  res.json({
    message: 'Proyecto actualizado correctamente',
    project: {
      ...existing,
      keyMasked: maskKey(existing.key)
    }
  });
});

// Delete Project
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  let projects = getProjects();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado.' });
  }

  if (project.createdFromEnv) {
    return res.status(400).json({ error: 'No se puede eliminar un proyecto definido por variable de entorno.' });
  }

  projects = projects.filter(p => p.id !== id);
  saveProjects(projects);

  res.json({ message: 'Proyecto eliminado correctamente.' });
});

// Trigger Ping for Single Project
app.post('/api/projects/:id/ping', async (req, res) => {
  const { id } = req.params;
  const projects = getProjects();
  const project = projects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado.' });
  }

  try {
    const result = await pingProject(project);
    res.json({
      message: `Ping ejecutado para "${project.name}"`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al ejecutar ping', details: err.message });
  }
});

// Trigger Ping for ALL Active Projects (Supports Cron Secret)
app.all(['/api/ping-all', '/api/cron'], async (req, res) => {
  // Check authorization if CRON_SECRET is configured
  if (CRON_SECRET) {
    const headerSecret = req.headers['x-cron-secret'] || req.headers['authorization'];
    const querySecret = req.query.secret;
    const providedSecret = headerSecret ? headerSecret.replace('Bearer ', '') : querySecret;

    if (providedSecret !== CRON_SECRET) {
      return res.status(401).json({ error: 'No autorizado. CRON_SECRET inválido o ausente.' });
    }
  }

  try {
    const results = await pingAllProjects();
    res.json({
      message: 'Ping masivo completado',
      timestamp: new Date().toISOString(),
      summary: {
        total: results.length,
        success: results.filter(r => r.status === 'SUCCESS').length,
        failed: results.filter(r => r.status === 'FAILED').length
      },
      results
    });
  } catch (err) {
    res.status(500).json({ error: 'Error durante el ping masivo', details: err.message });
  }
});

// Logs Endpoint
app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = getLogs(limit);
  res.json(logs);
});

// Clear Logs
app.delete('/api/logs', (req, res) => {
  const fs = require('fs');
  const LOGS_FILE = path.join(__dirname, 'data', 'logs.json');
  if (fs.existsSync(LOGS_FILE)) {
    fs.writeFileSync(LOGS_FILE, '[]', 'utf8');
  }
  res.json({ message: 'Historial de logs limpiado.' });
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------------------------------------------
// CRON SCHEDULER
// ----------------------------------------------------
if (cron.validate(CRON_SCHEDULE)) {
  cron.schedule(CRON_SCHEDULE, async () => {
    console.log(`[Cron Interno] Ejecutando manteniento programado (${CRON_SCHEDULE})...`);
    await pingAllProjects();
  });
  console.log(`[Cron Interno] Tarea diaria activada con expresión: "${CRON_SCHEDULE}"`);
} else {
  console.warn(`[Cron Interno] Expresión cron inválida: "${CRON_SCHEDULE}"`);
}

// ----------------------------------------------------
// SERVER LAUNCH
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Mantenedor Supabase corriendo en http://localhost:${PORT}`);
  console.log(`==================================================`);
});
