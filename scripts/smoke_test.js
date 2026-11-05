/**
 * ============================================================================
 * SUITE DE PRUEBAS DE HUMO EXHAUSTIVA Y PERSONALIZADA (SMOKE TEST)
 * ============================================================================
 * Proyecto: BL FRAGANCIAS – Perfumería Fina y Decants
 * Repositorio: DesarrolloBackend-2026-402/23122668
 * Evaluación Bimodal Institucional · Universidad Autónoma de Sinaloa
 * Profesor Titular: Dr. Herman Geovany Ayala Zúñiga
 * ============================================================================
 * 
 * USO:
 *   1. Asegúrese de que su entorno Docker esté corriendo: docker compose up -d
 *   2. Inicie su servidor backend: npm run dev (o npm start)
 *   3. En otra terminal, ejecute: node scripts/smoke_test.js
 * 
 * Esta suite comprueba 16 endpoints exhaustivos específicos de su proyecto,
 * validando que no existan crashes (500) ni rutas no implementadas (404 no deseadas).
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const ENDPOINTS_A_PROBAR = [
  {
    "path": "/api/v1/health",
    "method": "GET",
    "name": "Salud del Servidor y Conectividad DB/Redis",
    "expected": [
      200
    ],
    "modulo": "Infraestructura",
    "body": null
  },
  {
    "path": "/",
    "method": "GET",
    "name": "Ruta Raíz del API",
    "expected": [
      200,
      404
    ],
    "modulo": "Infraestructura",
    "body": null
  },
  {
    "path": "/api/docs",
    "method": "GET",
    "name": "Especificación Swagger UI / OpenAPI 3.0",
    "expected": [
      200,
      301,
      302
    ],
    "modulo": "Documentación",
    "body": null
  },
  {
    "path": "/api/v1/auth/register",
    "method": "POST",
    "name": "Registro de Usuarios (Validación DTO)",
    "expected": [
      201,
      400,
      409,
      422
    ],
    "modulo": "Seguridad",
    "body": {
      "email": "smoke_test@uas.edu.mx"
    }
  },
  {
    "path": "/api/v1/auth/login",
    "method": "POST",
    "name": "Inicio de Sesión y Emisión JWT",
    "expected": [
      200,
      400,
      401,
      422
    ],
    "modulo": "Seguridad",
    "body": {
      "email": "smoke_test@uas.edu.mx",
      "password": "bad_password"
    }
  },
  {
    "path": "/api/v1/auth/me",
    "method": "GET",
    "name": "Perfil Protegido por Token Bearer JWT",
    "expected": [
      200,
      401,
      403
    ],
    "modulo": "Seguridad",
    "body": null
  },
  {
    "path": "/api/v1/perfumes",
    "method": "GET",
    "name": "Contrato Oficial: GET /api/v1/perfumes",
    "expected": [
      200,
      401,
      403
    ],
    "modulo": "Contratos de Dominio",
    "body": null
  },
  {
    "path": "/api/v1/pedidos",
    "method": "POST",
    "name": "Contrato Oficial: POST /api/v1/pedidos",
    "expected": [
      201,
      400,
      409,
      422,
      401,
      403
    ],
    "modulo": "Contratos de Dominio",
    "body": {}
  },
  {
    "path": "/api/v1/pedidos/1/guia",
    "method": "PATCH",
    "name": "Contrato Oficial: PATCH /api/v1/pedidos/:id/guia",
    "expected": [
      200,
      400,
      401,
      403
    ],
    "modulo": "Contratos de Dominio",
    "body": {}
  },
  {
    "path": "/api/v1/reportes/ventas-fragancias",
    "method": "GET",
    "name": "Contrato Oficial: GET /api/v1/reportes/ventas-fragancias",
    "expected": [
      200,
      403,
      401
    ],
    "modulo": "Contratos de Dominio",
    "body": null
  },
  {
    "path": "/api/v1/casaperfumeras",
    "method": "GET",
    "name": "Catálogo de CasaPerfumera (Listado y Paginación)",
    "expected": [
      200,
      401,
      403
    ],
    "modulo": "Catálogos de Negocio",
    "body": null
  },
  {
    "path": "/api/v1/presentaciondecantes",
    "method": "GET",
    "name": "Catálogo de PresentacionDecant (Listado y Paginación)",
    "expected": [
      200,
      401,
      403
    ],
    "modulo": "Catálogos de Negocio",
    "body": null
  },
  {
    "path": "/api/v1/lotebatches",
    "method": "GET",
    "name": "Catálogo de LoteBatch (Listado y Paginación)",
    "expected": [
      200,
      401,
      403
    ],
    "modulo": "Catálogos de Negocio",
    "body": null
  },
  {
    "path": "/api/v1/perfumes?casa=1&familia=1",
    "method": "GET",
    "name": "Búsqueda Avanzada con Filtros (/api/v1/perfumes)",
    "expected": [
      200,
      400,
      401,
      403
    ],
    "modulo": "Búsqueda y Filtros",
    "body": null
  },
  {
    "path": "/api/v1/pedidos?cliente=1",
    "method": "GET",
    "name": "Búsqueda Avanzada con Filtros (/api/v1/pedidos)",
    "expected": [
      200,
      400,
      401,
      403
    ],
    "modulo": "Búsqueda y Filtros",
    "body": null
  },
  {
    "path": "/api/v1/pedidos/1/estado",
    "method": "PATCH",
    "name": "Máquina de Estados en Pedido",
    "expected": [
      200,
      400,
      401,
      403,
      404,
      422
    ],
    "modulo": "Máquina de Estados",
    "body": {
      "estado": "Pago_Pendiente"
    }
  }
];

function executeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const payload = endpoint.body ? JSON.stringify(endpoint.body) : null;

    const options = {
      hostname: HOST,
      port: PORT,
      path: endpoint.path,
      method: endpoint.method,
      timeout: 4000,
      headers: {
        'User-Agent': 'SmokeTest-UAS-Bimodal/1.0',
        'Accept': 'application/json, text/html, */*'
      }
    };

    if (payload) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const durationMs = Date.now() - startTime;
        const passed = endpoint.expected.includes(res.statusCode);
        resolve({
          path: endpoint.path,
          method: endpoint.method,
          name: endpoint.name,
          modulo: endpoint.modulo,
          status: res.statusCode,
          expected: endpoint.expected,
          durationMs,
          passed
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path: endpoint.path,
        method: endpoint.method,
        name: endpoint.name,
        modulo: endpoint.modulo,
        error: err.code || err.message,
        expected: endpoint.expected,
        passed: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: endpoint.path,
        method: endpoint.method,
        name: endpoint.name,
        modulo: endpoint.modulo,
        error: 'TIMEOUT (excedió 4000ms)',
        expected: endpoint.expected,
        passed: false
      });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runSuite() {
  console.log('\n' + '='.repeat(76));
  console.log('   SUITE DE PRUEBAS DE HUMO EXHAUSTIVA · DESARROLLO BACKEND');
  console.log('='.repeat(76));
  console.log('  * Repositorio: DesarrolloBackend-2026-402/23122668');
  console.log('  * Proyecto:    BL FRAGANCIAS – Perfumería Fina y Decants');
  console.log('  * Host:        http://' + HOST + ':' + PORT);
  console.log('  * Endpoints a evaluar: ' + ENDPOINTS_A_PROBAR.length + ' rutas especificas');
  console.log('='.repeat(76) + '\n');

  let passedTotal = 0;
  let currentModule = '';

  for (let i = 0; i < ENDPOINTS_A_PROBAR.length; i++) {
    const ep = ENDPOINTS_A_PROBAR[i];
    if (ep.modulo !== currentModule) {
      currentModule = ep.modulo;
      console.log(`\n--- [MODULO: ${currentModule.toUpperCase()}] ---`);
    }

    const res = await executeRequest(ep);
    const num = (i + 1).toString().padStart(2, '0');

    if (res.passed) {
      passedTotal++;
      console.log(`  [✓ APROBADO] #${num} ${res.method.padEnd(5)} ${res.path.padEnd(35)} -> HTTP ${res.status} (${res.durationMs}ms)`);
    } else {
      const motivo = res.error ? res.error : `HTTP ${res.status} (Esperaba: ${res.expected.join(', ')})`;
      console.log(`  [✗ FALLO]    #${num} ${res.method.padEnd(5)} ${res.path.padEnd(35)} -> ${motivo}`);
      console.log(`               Detalle: ${res.name}`);
    }
  }

  const score = Math.round((passedTotal / ENDPOINTS_A_PROBAR.length) * 100);

  console.log('\n' + '='.repeat(76));
  console.log('                        RESUMEN DE EVALUACION');
  console.log('='.repeat(76));
  console.log(`  * Pruebas superadas:   ${passedTotal} de ${ENDPOINTS_A_PROBAR.length}`);
  console.log(`  * Calificacion Smoke:  ${score} / 100 puntos`);
  console.log('-'.repeat(76));

  if (score >= 80) {
    console.log('  [ESTADO: APROBADO] ✅ El backend cumple con los contratos requeridos.');
    console.log('  Proceda a publicar su tag y release en GitHub:');
    console.log('    git add .');
    console.log('    git commit -m "feat: implementar hito tecnico reglamentario"');
    console.log('    git tag -a v0.1.0-e1.1 -m "Release Entregable e1.1"');
    console.log('    git push origin main --tags\n');
    process.exit(0);
  } else {
    console.log('  [ESTADO: REVISIÓN REQUERIDA] ⚠️  Calificación inferior al umbral (80 pts).');
    console.log('  Acciones recomendadas:');
    console.log('    1. Verifique que Docker Compose esté levantado: docker compose ps');
    console.log('    2. Compruebe los logs del servidor para identificar excepciones 500.');
    console.log('    3. Corrija las rutas faltantes o códigos HTTP esperados y vuelva a ejecutar.');
    console.log('='.repeat(76) + '\n');
    process.exit(1);
  }
}

runSuite();
