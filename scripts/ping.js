require('dotenv').config();
const { execSync } = require('child_process');
const { pingAllProjects, getProjects } = require('../lib/keeper');

async function runStandalonePing() {
  console.log('==================================================');
  console.log(`[Supabase Mantenedor] Ejecución CLI - ${new Date().toLocaleString()}`);
  console.log('==================================================');

  // Check local/env projects
  const projects = getProjects();
  if (projects && projects.length > 0) {
    try {
      const results = await pingAllProjects();
      const successCount = results.filter(r => r.status === 'SUCCESS').length;
      const failCount = results.length - successCount;

      console.log('--------------------------------------------------');
      console.log(`[Pings Locales] Resumen: ${successCount} exitoso(s), ${failCount} fallido(s) de ${results.length} proyecto(s).`);
    } catch (err) {
      console.error('❌ Error durante la ejecución del ping local:', err.message);
    }
  } else {
    console.warn('ℹ️ No hay proyectos locales configurados en data/projects.json.');
  }

  // Check GitHub Actions status in cloud
  console.log('--------------------------------------------------');
  console.log('☁️ Verificando estado de ejecuciones en la Nube (GitHub Actions)...');
  try {
    const repo = process.env.GITHUB_REPO || 'AaronSGomez/MantenedorFreeSupabase';
    const output = execSync(`gh api repos/${repo}/actions/runs --jq ".workflow_runs[0] | {name, status, conclusion, created_at, html_url, event}"`, { encoding: 'utf8' });
    if (output && output.trim()) {
      const run = JSON.parse(output.trim());
      console.log(`   📌 Último flujo en la Nube: "${run.name}"`);
      console.log(`   🕒 Fecha: ${new Date(run.created_at).toLocaleString()}`);
      console.log(`   ⚡ Estado: ${run.status === 'completed' ? 'Completado' : run.status}`);
      console.log(`   ✅ Resultado: ${run.conclusion === 'success' ? 'ÉXITO ✓' : run.conclusion}`);
      console.log(`   🔗 Ver en GitHub: ${run.html_url}`);
    } else {
      console.log('   ℹ️ No se registraron ejecuciones previas en GitHub Actions.');
    }
  } catch (err) {
    console.log('   ⚠️ No se pudo consultar la API de GitHub (asegúrate de tener gh CLI configurado).');
  }

  console.log('==================================================');
}

runStandalonePing();
