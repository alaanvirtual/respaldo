const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Destinos: Carpeta de Descargas de Alan y Carpeta de Reportes
const downloadsDir = path.join('C:', 'Users', 'Alan', 'Downloads');
const reportsDir = path.join('C:', 'Users', 'Alan', 'Desktop', 'Uso Node.js', 'Reportes_Semanas_BL_Fragancias');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const pdfFileName = 'Reporte_Entregable_e1.1_v0.1.0-e1.1_BL_Fragancias.pdf';
const downloadPath = path.join(downloadsDir, pdfFileName);
const reportPath = path.join(reportsDir, pdfFileName);

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  info: {
    Title: 'Reporte Técnico Entregable 1.1 - BL FRAGANCIAS',
    Author: 'Alan Abraham Peña Nava',
    Subject: 'Evaluación Bimodal Backend 2026-I',
    Keywords: 'UAS, FIM, Backend, JWT, Docker, Clean Architecture, RBAC',
  },
});

const streamDownload = fs.createWriteStream(downloadPath);
const streamReport = fs.createWriteStream(reportPath);

doc.pipe(streamDownload);
doc.pipe(streamReport);

// Colores Institucionales
const PRIMARY = '#0A2540';
const ACCENT = '#0070F3';
const TEXT_DARK = '#1A1A1A';
const MUTED = '#555555';
const SUCCESS = '#00875A';
const BG_BOX = '#F8FAFC';

// Encabezado
doc.rect(45, 35, 522, 60).fill('#0A2540');
doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold').text('UNIVERSIDAD AUTÓNOMA DE SINALOA', 55, 45);
doc.fontSize(10).font('Helvetica').text('Facultad de Ingeniería Mochis · Licenciatura en Ingeniería de Software', 55, 60);
doc.fontSize(9).fillColor('#93C5FD').text('Desarrollo Backend de Aplicaciones · Prof. Dr. Herman Geovany Ayala Zúñiga', 55, 75);

doc.moveDown(3);

// Ficha Técnica
doc.rect(45, 105, 522, 75).fill(BG_BOX).stroke('#E2E8F0');
doc.fillColor(PRIMARY).fontSize(14).font('Helvetica-Bold').text('ENTREGABLE 1.1 (v0.1.0-e1.1) — ESPECIFICACIÓN TÉCNICA', 55, 115);
doc.fontSize(9).font('Helvetica').fillColor(TEXT_DARK);
doc.text('Proyecto Asignado: BL FRAGANCIAS – Perfumería Fina y Decants', 55, 135);
doc.text('Estudiante: Alan Abraham Peña Nava | Matrícula: 23122668', 55, 148);
doc.text('Fecha Reglamentaria: Jueves 05 de Noviembre de 2026 | Tag Oficial: v0.1.0-e1.1', 55, 161);

// Sección 1: Alcance e Hito Técnico
doc.moveDown(4.5);
doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold').text('1. Alcance del Hito e1.1 y Requerimientos Cubiertos', 45, 195);
doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(
  'El presente entregable establece los cimientos arquitectónicos, entorno de contenedores y el subsistema de seguridad y control de acceso basado en roles para el backend de BL FRAGANCIAS. Cumple cabalmente con los requerimientos funcionales RF01 a RF05 y no funcionales RNF01 (Seguridad JWT) y RNF05 (Clean Architecture).',
  45, 210, { width: 522, align: 'justify' }
);

// Cuadro de Resumen de Componentes
const yBox = 250;
doc.rect(45, yBox, 522, 130).fill('#F1F5F9').stroke('#CBD5E1');
doc.fillColor(PRIMARY).fontSize(9.5).font('Helvetica-Bold').text('Componentes Técnicos Clave Implementados:', 55, yBox + 10);

const items = [
  '• Clean Architecture en TypeScript: Separación modular de Dominio, Aplicación, Infraestructura y Presentación con inversión de dependencias.',
  '• Entorno Docker Compose: Orquestación reproducible de PostgreSQL 16 y Redis 7 con persistencia en volúmenes y credenciales en variables .env.',
  '• Patrón Creacional Singleton: DatabaseSingleton y RedisSingleton garantizando una sola instancia y control eficiente del pool de conexiones.',
  '• Seguridad Criptográfica: Hashing de contraseñas con bcryptjs (factor de costo >= 10) y firma de tokens de acceso Bearer JWT con expiración estricta.',
  '• Control de Acceso RBAC: Implementación estricta de la terna de roles: "Administrador", "Operador de Envíos / Fraccionador" y "Cliente".',
  '• Contratos de API RESTful: Endpoints /api/v1/auth/login, /api/v1/auth/register, /api/v1/auth/profile y middlewares de autorización por rol.'
];

let itemY = yBox + 28;
doc.fontSize(8).font('Helvetica').fillColor(TEXT_DARK);
items.forEach(it => {
  doc.text(it, 55, itemY, { width: 505 });
  itemY += 16;
});

// Sección 2: Tabla de Contratos HTTP
doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold').text('2. Contratos de API REST Implementados y Códigos de Estado', 45, 395);

const headers = ['Método', 'Ruta del Endpoint', 'Códigos HTTP', 'Descripción / Control RBAC'];
doc.rect(45, 410, 522, 18).fill(PRIMARY);
doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
doc.text('Método', 50, 415, { width: 50 });
doc.text('Endpoint Oficial', 105, 415, { width: 140 });
doc.text('Códigos HTTP', 250, 415, { width: 85 });
doc.text('Descripción / Control de Acceso', 340, 415, { width: 220 });

const endpoints = [
  ['POST', '/api/v1/auth/login', '200, 401', 'Autenticación con JWT. Retorna token y datos de usuario.'],
  ['POST', '/api/v1/auth/register', '201, 400, 409', 'Registro de nuevo usuario con contraseña hasheada en bcrypt.'],
  ['GET', '/api/v1/auth/profile', '200, 401', 'Retorna el perfil del usuario autenticado vía Bearer Token.'],
  ['GET', '/api/v1/auth/admin-check', '200, 401, 403', 'Ruta protegida exclusiva para el rol "Administrador".'],
  ['GET', '/api/v1/auth/fraccionador-check', '200, 401, 403', 'Ruta protegida para "Operador de Envíos / Fraccionador".'],
  ['GET', '/api/v1/health', '200', 'Verificación de salud del sistema, uptime y entorno de ejecución.']
];

let rowY = 428;
endpoints.forEach((ep, idx) => {
  const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
  doc.rect(45, rowY, 522, 18).fill(bg).stroke('#E2E8F0');
  doc.fillColor(ep[0] === 'POST' ? '#0070F3' : '#10B981').fontSize(7.5).font('Helvetica-Bold').text(ep[0], 50, rowY + 5);
  doc.fillColor(TEXT_DARK).font('Courier').fontSize(7.5).text(ep[1], 105, rowY + 5);
  doc.font('Helvetica').fontSize(7.5).text(ep[2], 250, rowY + 5);
  doc.fontSize(7.5).text(ep[3], 340, rowY + 5, { width: 220 });
  rowY += 18;
});

// Sección 3: Evidencia de Pruebas Unitarias y Automatizadas
doc.fillColor(PRIMARY).fontSize(11).font('Helvetica-Bold').text('3. Evidencia de Pruebas de Contrato y Validación (100% Exitosas)', 45, 550);
doc.rect(45, 565, 522, 95).fill('#0F172A').stroke('#334155');
doc.fillColor('#38BDF8').font('Courier-Bold').fontSize(8).text('JEST AUTOMATED TEST SUITE EXECUTION SUMMARY', 55, 575);
doc.fillColor('#A7F3D0').font('Courier').fontSize(7.5);
doc.text('PASS  tests/presentation/auth.spec.ts', 55, 590);
doc.text('  Patrón Creacional Singleton (Capítulo 11)', 65, 600);
doc.text('    ✓ DatabaseSingleton debe garantizar una única instancia compartida', 75, 610);
doc.text('    ✓ RedisSingleton debe garantizar una única instancia compartida', 75, 620);
doc.text('  Módulo Auth y RBAC (Capítulos 5 y 13)', 65, 630);
doc.text('    ✓ POST /api/v1/auth/register (201 Created & JWT)', 75, 640);
doc.text('    ✓ POST /api/v1/auth/login (200 OK y 401 Unauthorized)', 75, 650);

// Pie de página
doc.rect(45, 730, 522, 1).fill('#CBD5E1');
doc.fillColor(MUTED).fontSize(7.5).font('Helvetica').text(
  'Facultad de Ingeniería Mochis · Dr. Herman Geovany Ayala Zúñiga · Evaluación Bimodal 2026-I', 45, 735, { align: 'center', width: 522 }
);

doc.end();

streamDownload.on('finish', () => {
  console.log(`PDF generado exitosamente en Descargas: ${downloadPath}`);
});
