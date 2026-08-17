// scripts/stress-test.js
// Node.js v18+ requerido (usa fetch nativo)

const TARGET_URL = 'http://localhost:3000/api/generate-system';
const CONCURRENT_REQUESTS = 150;

async function runStressTest() {
  console.log(`🚀 Iniciando Stress Test contra ${TARGET_URL}`);
  console.log(`💥 Disparando ${CONCURRENT_REQUESTS} peticiones simultáneas...\n`);

  const startTime = Date.now();
  let successCount = 0;
  let rateLimitCount = 0;
  let authErrorCount = 0;
  let serverErrorCount = 0;
  let otherErrorCount = 0;

  // Creamos un array de promesas que se ejecutarán al mismo tiempo
  const requests = Array.from({ length: CONCURRENT_REQUESTS }).map(async (_, index) => {
    try {
      // Usamos un User-Agent dinámico o IP simulada para ver cómo reacciona el middleware
      const response = await fetch(TARGET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `192.168.1.99` 
        },
        body: JSON.stringify({
          name: "Hacker",
          role: "PenTester",
          level: "Junior",
          goal: "Romper el sistema",
          sector: "Cybersecurity",
          hoursPerWeek: 40,
          technologies: ["Kali"],
          courses: [],
          projects: [],
          parent_id: "fake-id"
        })
      });

      if (response.status === 200) successCount++;
      else if (response.status === 429) rateLimitCount++;
      else if (response.status === 401) authErrorCount++; 
      else if (response.status >= 500) serverErrorCount++;
      else otherErrorCount++;

    } catch (error) {
      otherErrorCount++;
    }
  });

  // Ejecutamos todo de golpe
  await Promise.all(requests);
  const duration = Date.now() - startTime;

  console.log(`\n📊 === RESULTADOS DEL STRESS TEST ===`);
  console.log(`⏱️  Tiempo total: ${duration}ms`);
  console.log(`✅ Peticiones que pasaron el Rate Limit (Llegaron al auth): ${authErrorCount + successCount}`);
  console.log(`🛡️  Bloqueadas por Rate Limit (429): ${rateLimitCount}`);
  console.log(`🔥 Errores 500 (Servidor colapsó): ${serverErrorCount}`);
  console.log(`❓ Otros errores: ${otherErrorCount}`);
  console.log(`===================================\n`);

  if (serverErrorCount > 0) {
    console.log('❌ PELIGRO: El servidor devolvió errores 500. El Rate Limiter falló en protegerlo.');
  } else if (rateLimitCount > 0) {
    console.log('✅ ÉXITO: Upstash bloqueó exitosamente el exceso de tráfico.');
  } else {
    console.log('⚠️ ATENCIÓN: Ninguna petición fue bloqueada. ¿El Rate Limit está en 100?');
  }
}

runStressTest();
