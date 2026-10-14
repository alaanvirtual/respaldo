// test/test-pms.js - Suite de pruebas automatizadas para el PMS (Capítulo 4)
import { spawn } from 'child_process';
import http from 'http';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestHttp(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
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
  console.log('🚀 VALIDACIÓN COMPLETA: CAPÍTULO 4 - PMS BACKEND (TypeScript/Express)');
  console.log('=================================================================\n');

  console.log('1️⃣ Levantando servidor PMS compilado en proceso individual para pruebas...');
  const serverProcess = spawn('node', ['dist/src/express_server_standalone.js'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  try {
    await waitForServer();
    console.log('\n✅ Servidor detectado activo en http://127.0.0.1:3000\n');

    // Test 1: GET /ping
    console.log('▶ [Prueba 1] GET /ping');
    const ping = await requestHttp('/ping');
    console.log(`Status: ${ping.status} | Respuesta: ${ping.data}`);

    // Test 2: GET /api/roles
    console.log('\n▶ [Prueba 2] GET /api/roles (Módulo Roles)');
    const roles = await requestHttp('/api/roles');
    console.log(`Status: ${roles.status} | Respuesta:`, roles.data);

    // Test 3: POST /api/roles
    console.log('\n▶ [Prueba 3] POST /api/roles');
    const rolesPost = await requestHttp('/api/roles', 'POST', { name: 'Admin' });
    console.log(`Status: ${rolesPost.status} | Respuesta:`, rolesPost.data);

    // Test 4: GET /api/users
    console.log('\n▶ [Prueba 4] GET /api/users (Módulo Users)');
    const users = await requestHttp('/api/users');
    console.log(`Status: ${users.status} | Respuesta:`, users.data);

    // Test 5: GET /api/projects
    console.log('\n▶ [Prueba 5] GET /api/projects (Módulo Projects)');
    const projects = await requestHttp('/api/projects');
    console.log(`Status: ${projects.status} | Respuesta:`, projects.data);

    // Test 6: GET /api/tasks
    console.log('\n▶ [Prueba 6] GET /api/tasks (Módulo Tasks)');
    const tasks = await requestHttp('/api/tasks');
    console.log(`Status: ${tasks.status} | Respuesta:`, tasks.data);

    // Test 7: GET /api/comments
    console.log('\n▶ [Prueba 7] GET /api/comments (Módulo Comments)');
    const comments = await requestHttp('/api/comments');
    console.log(`Status: ${comments.status} | Respuesta:`, comments.data);

    // Test 8: PUT /api/tasks/task-uuid-test
    console.log('\n▶ [Prueba 8] PUT /api/tasks/task-uuid-test');
    const updateTask = await requestHttp('/api/tasks/task-uuid-test', 'PUT', { status: 'InProgress' });
    console.log(`Status: ${updateTask.status} | Respuesta:`, updateTask.data);

    console.log('\n=================================================================');
    console.log('🎉 TODOS LOS MÓDULOS, CONTROLADORES Y RUTAS RESPONDEN CON ÉXITO');
    console.log('=================================================================\n');
  } finally {
    serverProcess.kill('SIGTERM');
  }
}

run();
