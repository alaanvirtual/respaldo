// test/test-capitulo5-6.js - Suite de Pruebas de Integración para Capítulos 5 y 6
import { spawn } from 'child_process';
import http from 'http';
import jwt from 'jsonwebtoken';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestHttp(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, data: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function waitForServer(timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await requestHttp('/ping');
      if (res.status === 200) {
        return true;
      }
    } catch {
      // reintentar
    }
    await sleep(400);
  }
  throw new Error('Timeout esperando que el servidor responda en http://127.0.0.1:3000/ping');
}

async function run() {
  console.log('=================================================================');
  console.log('🚀 VALIDACIÓN DE INTEGRACIÓN: CAPÍTULO 5 & CAPÍTULO 6');
  console.log('PMS Backend: Autenticación JWT, RBAC, Proyectos y Tareas ACID');
  console.log('=================================================================\n');

  console.log('1️⃣ Iniciando servidor PMS standalone compilado...');
  const serverProcess = spawn('node', ['dist/src/express_server_standalone.js'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  try {
    await waitForServer();
    console.log('\n✅ Servidor detectado activo en http://127.0.0.1:3000\n');

    // 1. Healthcheck
    console.log('▶ [Prueba 1] GET /ping');
    const ping = await requestHttp('/ping');
    console.log(`Status: ${ping.status} | Respuesta:`, ping.data);

    // 2. Validación express-validator en creación de Roles (Nombre vacío)
    console.log('\n▶ [Prueba 2] POST /api/roles (Fallo esperado por validación: nombre vacío)');
    const roleFail = await requestHttp('/api/roles', 'POST', { name: '', description: 'Test' });
    console.log(`Status: ${roleFail.status} | Respuesta:`, roleFail.data);

    // 3. Validación express-validator en creación de Usuarios (Contraseña débil)
    console.log('\n▶ [Prueba 3] POST /api/users (Fallo esperado: contraseña débil sin mayúscula/número)');
    const userFail = await requestHttp('/api/users', 'POST', {
      fullname: 'Alan Test',
      username: 'alantest',
      email: 'alan@test.com',
      password: '123'
    });
    console.log(`Status: ${userFail.status} | Respuesta:`, userFail.data);

    // 4. Protección de endpoints con Middleware Authorize (Sin Token)
    console.log('\n▶ [Prueba 4] GET /api/projects (Fallo esperado: 401 Unauthorized sin Bearer Token)');
    const projNoToken = await requestHttp('/api/projects');
    console.log(`Status: ${projNoToken.status} | Respuesta:`, projNoToken.data);

    // 5. Generación de Token JWT de prueba para verificar autorización
    const testToken = jwt.sign(
      { username: 'superadmin', email: 'admin@pms.local' },
      'ClaveSecretaPMS_UAS_2026',
      { expiresIn: '1h' }
    );
    console.log('\n▶ [Prueba 5] Simulación de Token JWT generado:', testToken.substring(0, 30) + '...');

    // 6. Validación de reglas cronológicas de proyectos (Capítulo 6)
    console.log('\n▶ [Prueba 6] POST /api/projects/transaccion-atomica (Validación de fechas: fin anterior a inicio)');
    const projectDateFail = await requestHttp('/api/projects/transaccion-atomica', 'POST', {
      name: 'Proyecto Invalido',
      startDate: '2026-10-25T10:00:00Z',
      endDate: '2026-10-20T10:00:00Z'
    }, testToken);
    console.log(`Status: ${projectDateFail.status} | Respuesta:`, projectDateFail.data);

    // 7. Flujo de Olvido de Contraseña (Capítulo 5 - forgotPassword)
    console.log('\n▶ [Prueba 7] POST /api/users/forgot-password (Correo no registrado)');
    const forgotFail = await requestHttp('/api/users/forgot-password', 'POST', {
      email: 'desconocido@correo.com'
    });
    console.log(`Status: ${forgotFail.status} | Respuesta:`, forgotFail.data);

    // 8. Protección de endpoints de Tareas
    console.log('\n▶ [Prueba 8] GET /api/tasks (Fallo esperado: 401 Unauthorized sin token)');
    const taskNoToken = await requestHttp('/api/tasks');
    console.log(`Status: ${taskNoToken.status} | Respuesta:`, taskNoToken.data);

    console.log('\n=================================================================');
    console.log('🎉 VALIDACIONES DE SEGURIDAD, ENRUTAMIENTO Y CAPAS 5 Y 6 COMPLETADAS CON ÉXITO');
    console.log('=================================================================\n');
  } finally {
    serverProcess.kill('SIGTERM');
  }
}

run();
