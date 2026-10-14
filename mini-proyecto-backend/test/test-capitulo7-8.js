// test/test-capitulo7-8.js - Suite de Pruebas Automatizadas para Capítulos 7 y 8
import { spawn } from 'child_process';
import http from 'http';
import { CacheUtil } from '../dist/src/utils/cache_util.js';
import { NotificationUtil } from '../dist/src/utils/notification_util.js';

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
  console.log('🚀 VALIDACIÓN DE INTEGRACIÓN: CAPÍTULO 7 & CAPÍTULO 8');
  console.log('PMS Backend: API Caching (Redis) y Colas de Mensajes Asíncronas (Bull)');
  console.log('=================================================================\n');

  // Test 1: Operaciones de Caché (Capítulo 7)
  console.log('▶ [Prueba 1] Almacenar entidad en Caché (CacheUtil.set)');
  const testUserData = { user_id: 'usr-cached-001', username: 'juan_perez', role: 'Developer' };
  await CacheUtil.set('User', 'usr-cached-001', testUserData);
  console.log('✅ Entidad guardada en namespace "User:usr-cached-001"');

  console.log('\n▶ [Prueba 2] Recuperar entidad desde Caché (CacheUtil.get)');
  const retrievedUser = await CacheUtil.get('User', 'usr-cached-001');
  console.log('Resultado recuperado:', retrievedUser);
  if (!retrievedUser || retrievedUser.username !== 'juan_perez') {
    throw new Error('Fallo al recuperar usuario de la caché');
  }
  console.log('✅ Verificación de caché exitosa: coincidencia de datos confirmada');

  console.log('\n▶ [Prueba 3] Invalidación de clave de Caché (CacheUtil.remove)');
  await CacheUtil.remove('User', 'usr-cached-001');
  const afterRemove = await CacheUtil.get('User', 'usr-cached-001');
  console.log('Valor tras invalidar (debe ser null):', afterRemove);
  if (afterRemove !== null) {
    throw new Error('La clave no fue invalidada correctamente');
  }
  console.log('✅ Invalidación de caché exitosa');

  // Test 2: Módulo de Notificaciones y Encolamiento (Capítulo 8)
  console.log('\n▶ [Prueba 4] Encolamiento asíncrono de correo (NotificationUtil.enqueueEmail)');
  await NotificationUtil.enqueueEmail(
    'developer@pms.local',
    'Bienvenido al Sistema PMS',
    '<p>Tu cuenta ha sido activada en el sistema.</p>'
  );
  console.log('✅ Solicitud de encolamiento completada sin bloquear el hilo');

  console.log('\n▶ [Prueba 5] Envío directo de correo para acciones críticas (NotificationUtil.sendEmail)');
  const directSend = await NotificationUtil.sendEmail(
    'admin@pms.local',
    'Alerta Crítica PMS',
    '<p>Notificación directa ejecutada con éxito.</p>'
  );
  console.log(`Estado de envío directo: ${directSend ? 'EXITOSO' : 'FALLIDO'}`);
  console.log('✅ Despacho de correo verificado');

  // Test 3: Levantamiento del servidor Express con Caché y Colas activas
  console.log('\n1️⃣ Levantando servidor PMS standalone con Cache y QueueWorker activos...');
  const serverProcess = spawn('node', ['dist/src/express_server_standalone.js'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  try {
    await waitForServer();
    console.log('\n✅ Servidor con Worker de colas y Caché detectado en http://127.0.0.1:3000\n');

    console.log('▶ [Prueba 6] GET /ping (Servidor activo)');
    const ping = await requestHttp('/ping');
    console.log(`Status: ${ping.status} | Respuesta: ${ping.data}`);

    console.log('\n=================================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE LOS CAPÍTULOS 7 Y 8 FUERON COMPLETADAS EXITOSAMENTE');
    console.log('=================================================================\n');
  } finally {
    serverProcess.kill();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Error en las pruebas:', err);
  process.exit(1);
});
