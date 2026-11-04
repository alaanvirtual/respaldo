/**
 * script de pruebas de humo locales (smoke test)
 * uso: node scripts/smoke_test.js
 * verifica que el servidor responda antes de crear el tag de release en github.
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

function testEndpoint(path, method = 'GET', expectedStatus = [200, 404, 401]) {
  return new Promise((resolve) => {
    const opts = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      timeout: 3000
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const passed = expectedStatus.includes(res.statusCode);
        resolve({ path, method, status: res.statusCode, passed });
      });
    });

    req.on('error', (err) => {
      resolve({ path, method, error: err.message, passed: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ path, method, error: 'timeout excedido', passed: false });
    });

    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('   SUITE DE PRUEBAS DE HUMO (SMOKE TEST BACKEND)    ');
  console.log('====================================================');
  console.log(`Probando conexion a http://${HOST}:${PORT} ...\n`);

  const checks = [
    { path: '/api/v1/health', name: 'endpoint de salud', expected: [200] },
    { path: '/', name: 'ruta raiz del servidor', expected: [200, 404] },
    { path: '/api/v1/auth/login', name: 'ruta de autenticacion (metodo post esperado)', expected: [200, 400, 404, 405] },
    { path: '/api/v1/catalog', name: 'consulta de catalogo', expected: [200, 401, 404] }
  ];

  let passedCount = 0;

  for (const c of checks) {
    const res = await testEndpoint(c.path, 'GET', c.expected);
    if (res.passed) {
      console.log(`  [✓ APROBADO] ${c.name} (${c.path}) -> HTTP ${res.status}`);
      passedCount++;
    } else {
      console.log(`  [✗ FALLO]    ${c.name} (${c.path}) -> ${res.error ? res.error : 'HTTP ' + res.status}`);
    }
  }

  console.log('\n----------------------------------------------------');
  if (passedCount === checks.length) {
    console.log(`RESULTADO: ${passedCount}/${checks.length} pruebas superadas exitosamente.`);
    console.log('Listo para crear el tag y release en GitHub:');
    console.log('  git tag -a v0.1.0-e1.1 -m "Release Entregable"');
    console.log('  git push origin main --tags\n');
    process.exit(0);
  } else {
    console.log(`ATENCION: ${passedCount}/${checks.length} pruebas aprobadas.`);
    console.log('Verifique que el servidor este corriendo con: npm run dev / npm start\n');
    process.exit(1);
  }
}

run();
