require('dotenv').config();
const { pingAllProjects, getProjects } = require('../lib/keeper');

async function runStandalonePing() {
  console.log('==================================================');
  console.log(`[Supabase Mantenedor] Ejecución CLI - ${new Date().toLocaleString()}`);
  console.log('==================================================');

  const projects = getProjects();
  if (!projects || projects.length === 0) {
    console.warn('⚠️ No se encontraron proyectos configurados.');
    console.warn('Agrega proyectos mediante el Dashboard Web o la variable de entorno SUPABASE_PROJECTS.');
    process.exit(0);
  }

  try {
    const results = await pingAllProjects();
    const successCount = results.filter(r => r.status === 'SUCCESS').length;
    const failCount = results.length - successCount;

    console.log('--------------------------------------------------');
    console.log(`Resumen: ${successCount} exitoso(s), ${failCount} fallido(s) de ${results.length} proyecto(s).`);
    console.log('==================================================');

    if (failCount > 0 && process.env.FAIL_ON_ERROR === 'true') {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error durante la ejecución del ping:', err);
    process.exit(1);
  }
}

runStandalonePing();
