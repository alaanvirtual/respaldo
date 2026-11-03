const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputDir = path.join('C:', 'Users', 'Alan', 'Downloads', 'Reportes_Semanas_BL_Fragancias');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const reports = [
  {
    week: 'Semana 01',
    dates: '24–28 Ago 2026',
    tag: 'v1.0.0-http-core',
    milestone: 'Fundamentos Node.js y Event Loop',
    checklist: [
      'Servidor HTTP nativo con módulo node:http (sin Express ni frameworks externos).',
      'Demostración de I/O asíncrono no bloqueante vs bloqueo de hilo principal.',
      'Carga de variables de entorno mediante process.env y configuración flexible.',
      'Repositorio GitHub inicializado con .gitignore profesional para Node.js y README técnico.'
    ],
    summary: 'Implementación del núcleo de servidor HTTP nativo sin dependencias externas, comprobando el funcionamiento del Event Loop de Node.js mediante callbacks no bloqueantes y delegación de operaciones al pool de hilos de libuv.',
    details: [
      'Se construyó un servidor HTTP utilizando la biblioteca estándar node:http para comprender la arquitectura de bajo nivel de Node.js.',
      'Se demostró la naturaleza asíncrona no bloqueante frente a cómputos intensivos de CPU, implementando respuestas concurrentes sin degradar la latencia.',
      'Se configuró el entorno con lectura de variables de entorno y se estructuró el repositorio inicial con exclusiones rigurosas de node_modules y artefactos en .gitignore.'
    ],
    files: ['src/server.js / src/http_core.js', '.gitignore', 'README.md', 'package.json'],
    verification: 'Ejecución del servidor nativo en el puerto 3000 con respuestas instantáneas y verificación de código de salida 0 sin dependencias.'
  },
  {
    week: 'Semana 02',
    dates: '31 Ago–04 Sep 2026',
    tag: 'v1.1.0-native-routing',
    milestone: 'Servidores HTTP y Enrutamiento Nativo',
    checklist: [
      'Enrutador manual modular para verbos HTTP (GET, POST, PUT, DELETE) con módulo node:url.',
      'Parseo manual de cuerpo de petición (body) mediante streams (req.on("data") y req.on("end")) a JSON.',
      'Emisión de códigos de estado HTTP semánticos (200, 201, 400, 404, 500) y cabeceras Content-Type.',
      'Middleware manual de logging y manejo defensivo de excepciones con bloques try/catch.'
    ],
    summary: 'Desarrollo de un router HTTP nativo desacoplado capaz de mapear rutas y métodos REST sin usar Express, procesando peticiones entrantes como flujos de datos binarios y emitiendo respuestas con códigos semánticos.',
    details: [
      'Se desacopló la lógica de enrutamiento mediante un árbol de despachadores basado en URL pathname y método HTTP.',
      'Se implementó el acumulador de fragmentos (chunks) binarios de streams de entrada para reconstruir cargas útiles JSON sin sobrecargar la memoria.',
      'Se estructuró el manejo defensivo de errores capturando fallas de sintaxis JSON con código 400 y rutas inexistentes con 404.'
    ],
    files: ['src/router/nativeRouter.js', 'src/utils/bodyParser.js', 'src/handlers/'],
    verification: 'Pruebas mediante cURL y Postman validando códigos de respuesta 200, 201 y captura de 400 en JSONs malformados.'
  },
  {
    week: 'Semana 03',
    dates: '07–11 Sep 2026',
    tag: 'v1.2.0-streams-buffers-cluster',
    milestone: 'Streams, Buffers y Módulo Cluster',
    checklist: [
      'Procesamiento eficiente con Streams (Readable, Writable, Transform) y pipeline().',
      'Manejo de Backpressure y gestión controlada de memoria con Buffer.',
      'Escalabilidad multi-núcleo mediante módulo node:cluster para aprovechar todos los cores de CPU.',
      'Mecanismo de Graceful Shutdown ordenado ante señales del sistema SIGINT y SIGTERM.'
    ],
    summary: 'Optimización de throughput y mitigación de cuello de botella de hilo único mediante escalamiento multi-proceso con cluster.fork() y transferencia de datos con streams reactivos y backpressure.',
    details: [
      'Se implementó la partición de carga con node:cluster distribuyendo peticiones entrantes entre procesos trabajadores (workers) equivalentes al número de núcleos lógicos del procesador.',
      'Se integró pipeline() de node:stream para procesar flujos de entrada y salida evitando memory leaks por asimetría de velocidad (backpressure).',
      'Se programó el cierre ordenado (Graceful Shutdown) liberando conexiones activas y cerrando sockets de forma limpia ante señales de terminación del sistema.'
    ],
    files: ['src/cluster.js', 'src/streams/streamPipeline.js', 'src/utils/shutdown.js'],
    verification: 'Prueba de concurrencia y estrés demostrando tolerancia a fallos y apagado seguro sin desconexiones abruptas.'
  },
  {
    week: 'Semana 04',
    dates: '14–18 Sep 2026',
    tag: 'v1.3.0-typescript-strict',
    milestone: 'Entorno TypeScript y Tipado Estático',
    checklist: [
      'Configuración estricta en tsconfig.json (strict: true, noImplicitAny: true, strictNullChecks: true).',
      'Estructura modular con separación src/ (fuente) vs dist/ (compilado) y scripts build, dev y start.',
      'Modelado de entidades con interfaces, types y enums fuertemente tipados.',
      'Compilación limpia con npx tsc --noEmit con 0 errores y cero tipos any injustificados.'
    ],
    summary: 'Migración arquitectónica a TypeScript 5.7+ con los parámetros de verificación estricta más rigurosos, garantizando seguridad de tipos en tiempo de compilación y modelado robusto de entidades de negocio.',
    details: [
      'Se configuró tsconfig.json con reglas estrictas: strict, noImplicitAny, strictNullChecks, noUnusedLocals y noImplicitReturns.',
      'Se definieron las estructuras base para entidades de perfumería fina (Perfume, User, Order) y enums de concentración (EDT, EDP, Parfum, Extrait) y roles.',
      'Se establecieron scripts de construcción incremental con tsc y ejecución en desarrollo mediante tsx/ts-node sin transpilaciones defectuosas.'
    ],
    files: ['tsconfig.json', 'package.json', 'src/types/perfume.ts', 'src/types/user.ts'],
    verification: 'Ejecución exitosa de npx tsc --noEmit retornando código de salida 0 con 0 errores de tipado.'
  },
  {
    week: 'Semana 05',
    dates: '21–25 Sep 2026',
    tag: 'v1.4.0-clean-arch-domain',
    milestone: 'POO y Capa de Dominio (Clean Architecture)',
    checklist: [
      'Entidades de dominio ricas con encapsulamiento estricto e invariantes de negocio (Perfume, User, Order).',
      'Value Objects inmutables con validación de reglas de dominio (Concentration).',
      'Interfaces abstractas de repositorio (IPerfumeRepository, IUserRepository) sin dependencias externas.',
      'Casos de uso orquestando reglas de negocio puras aplicando Inversión de Dependencias (DIP).'
    ],
    summary: 'Establecimiento de las 4 capas concéntricas de Clean Architecture y aislamiento del Dominio como núcleo independiente de bibliotecas externas, TypeORM o Express.',
    details: [
      'Se modeló la entidad Perfume con métodos encapsulados: deductStock() que protege el invariante de inventario lanzando InsufficientStockError si se solicita más producto del disponible, addStock() y updatePrice().',
      'Se definieron contratos de repositorios abstractos en src/domain/repositories desacoplando la lógica de negocio de los mecanismos de almacenamiento.',
      'Se construyeron casos de uso puros (CreatePerfumeUseCase, DeductStockUseCase, GetPerfumeByIdUseCase, ListPerfumesUseCase) recibiendo dependencias inyectadas en su constructor.'
    ],
    files: [
      'src/domain/entities/Perfume.ts',
      'src/domain/entities/User.ts',
      'src/domain/entities/Order.ts',
      'src/domain/repositories/IPerfumeRepository.ts',
      'src/domain/errors/InsufficientStockError.ts',
      'src/application/use-cases/DeductStockUseCase.ts'
    ],
    verification: 'Pruebas unitarias de invariantes de dominio ejecutándose independientemente de cualquier base de datos o servidor HTTP.'
  },
  {
    week: 'Semana 06',
    dates: '28 Sep–02 Oct 2026',
    tag: 'v1.5.0-linters-git-hooks',
    milestone: 'Linters, Prettier y Git Hooks',
    checklist: [
      'Configuración rigurosa de ESLint con reglas estrictas para TypeScript (typescript-eslint).',
      'Configuración de Prettier (.prettierrc) y script automatizado npm run format.',
      'Integración de Husky y lint-staged para pre-commit hooks obligatorios.',
      'Integración de commitlint para forzar el estándar de Conventional Commits en cada commit.'
    ],
    summary: 'Implementación del pipeline de aseguramiento estático de calidad y gobierno del repositorio, impidiendo el registro de código no formateado o con violaciones sintácticas mediante Git Hooks perimetrales.',
    details: [
      'Se configuró eslint.config.mjs con soporte para TypeScript moderno, prohibiendo variables sin uso y tipos implícitos.',
      'Se establecieron políticas uniformes de formateo en .prettierrc (comillas simples, punto y coma obligatorio, tabulación de 2 espacios y trailing comma).',
      'Se configuró Husky con .husky/pre-commit ejecutando lint-staged sobre archivos modificados y .husky/commit-msg validando mensajes según Conventional Commits.'
    ],
    files: ['.husky/pre-commit', '.husky/commit-msg', '.prettierrc', 'eslint.config.mjs', 'commitlint.config.mjs'],
    verification: 'Comprobación de bloqueo automático de commits ante mensajes no convencionales o fallas de linting.'
  },
  {
    week: 'Semana 07',
    dates: '05–09 Oct 2026',
    tag: 'v2.0.0-express-rest-launch',
    milestone: 'API REST Modular con Express.js',
    checklist: [
      'Arquitectura modular en Express.js separando routers, controllers y casos de uso.',
      'Endpoints RESTful completos (CRUD) para al menos 2 entidades principales (Perfumes y Usuarios).',
      'Middlewares base perimetrales: express.json(), cors(), helmet() y compresión gzip.',
      'Diagrama de Arquitectura de Capas (C4 Nivel 2) documentado en el repositorio.'
    ],
    summary: 'Lanzamiento de la capa de presentación modular basada en Express.js, integrando seguridad perimetral HTTP (Helmet, CORS, compresión Gzip) y controladores delegando en casos de uso de Clean Architecture.',
    details: [
      'Se ensambló createApp() en src/presentation/app.ts aislando configuración perimetral de transporte.',
      'Se modularizaron las rutas en perfume.routes.ts, user.routes.ts y health.routes.ts.',
      'Se documentó la arquitectura C4 Nivel 2 en README.md visualizando el flujo desde el cliente HTTP hasta las entidades de dominio y repositorios.'
    ],
    files: [
      'src/presentation/app.ts',
      'src/presentation/routes/index.ts',
      'src/presentation/routes/perfume.routes.ts',
      'src/presentation/routes/user.routes.ts',
      'src/presentation/controllers/PerfumeController.ts',
      'README.md'
    ],
    verification: 'Ejecución de endpoints /api/health, /api/perfumes y /api/users respondiendo HTTP 200/201 con cabeceras de seguridad Helmet.'
  },
  {
    week: 'Semana 08',
    dates: '12–16 Oct 2026',
    tag: 'v2.1.0-zod-error-logging',
    milestone: 'Validación con Zod y Winston Logging',
    checklist: [
      'Schemas Zod validando exhaustivamente req.body, req.params y req.query en todas las rutas.',
      'Inferencia de DTOs fuertemente tipados en TypeScript con z.infer<typeof schema>.',
      'Jerarquía personalizada de excepciones operacionales (AppError con códigos semánticos 400, 401, 403, 404, 409, 500).',
      'Middleware global de captura de errores y logger estructurado JSON con Winston (marcas ISO 8601).'
    ],
    summary: 'Blindaje perimetral mediante esquemas declarativos en Zod que interceptan peticiones malformadas con HTTP 400 descriptivo y centralización de auditoría con Winston en formato JSON estructurado.',
    details: [
      'Se crearon esquemas Zod en perfume.schema.ts y user.schema.ts validando longitudes, precios positivos (>0), existencias enteras (>=0) y formato RFC de correos.',
      'Se implementó la clase base AppError y el middleware errorHandler capturando ZodError, DomainError y excepciones no controladas.',
      'Se integró logger de Winston con formato JSON para producción y formato enriquecido con marcas temporales ISO para desarrollo.'
    ],
    files: [
      'src/presentation/schemas/perfume.schema.ts',
      'src/presentation/schemas/user.schema.ts',
      'src/presentation/middlewares/validateRequest.ts',
      'src/presentation/middlewares/errorHandler.ts',
      'src/presentation/errors/AppError.ts',
      'src/infrastructure/logging/logger.ts'
    ],
    verification: 'Pruebas de supertest validando intercepción de entradas inválidas con 400 Bad Request y registro en consola estructurado.'
  },
  {
    week: 'Semana 09',
    dates: '19–23 Oct 2026',
    tag: 'v2.2.0-openapi-swagger-hateoas',
    milestone: 'Documentación Swagger y HATEOAS',
    checklist: [
      'Swagger UI / OpenAPI 3.0.3 interactivo montado y operativo en ruta pública /api/docs.',
      'Especificación exhaustiva de DTOs, parámetros, códigos de respuesta y esquemas de error.',
      'Esquema BearerAuth (JWT) configurado en Swagger para pruebas en vivo de endpoints protegidos.',
      'Hipermedios HATEOAS (_links) en respuestas del catálogo/usuarios y colección Postman exportada en docs/.'
    ],
    summary: 'Publicación de la consola interactiva Swagger UI en /api/docs bajo el estándar OpenAPI 3.0.3, integración de hipermedios navegables HATEOAS en respuestas REST y exportación de colección de pruebas Postman.',
    details: [
      'Se construyó la especificación OpenAPI en swaggerDocument.ts documentando endpoints, componentes, esquemas Zod reflejados y seguridad Bearer JWT.',
      'Se montó la UI interactiva en src/presentation/app.ts con endpoint adicional en /api/docs/swagger.json para consumo por herramientas externas.',
      'Se diseñó la clase HateoasBuilder en src/presentation/utils/hateoas.ts enriqueciendo respuestas con hipervínculos dinámicos (self, deductStock, collection, create, docs).',
      'Se exportó la colección oficial Postman en docs/BL_Fragancias.postman_collection.json y se añadió suite de pruebas automatizadas con 4 tests específicos.'
    ],
    files: [
      'src/presentation/docs/swaggerDocument.ts',
      'src/presentation/utils/hateoas.ts',
      'src/presentation/app.ts',
      'docs/BL_Fragancias.postman_collection.json',
      'tests/presentation/swagger-hateoas.spec.ts'
    ],
    verification: 'Suite de pruebas Jest pasando al 100% (20/20 tests en 5 suites) y compilación limpia npx tsc --noEmit con 0 errores.'
  }
];

function generateReportPDF(data, destPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 40, left: 45, right: 45 }
    });

    const stream = fs.createWriteStream(destPath);
    doc.pipe(stream);

    // Paleta de colores institucionales
    const primaryColor = '#0B3C5D';    // Azul UAS
    const secondaryColor = '#328CC1';  // Azul medio
    const accentColor = '#D9B310';     // Dorado / Amarillo institucional
    const darkText = '#1D2731';
    const mutedText = '#5A6B7C';
    const cardBg = '#F6F8FA';
    const borderCard = '#E1E4E8';

    // ENCABEZADO INSTITUCIONAL
    doc.rect(45, 40, 522, 60).fill(primaryColor);

    doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold')
       .text('UNIVERSIDAD AUTÓNOMA DE SINALOA', 55, 48, { align: 'center', width: 502 });
    doc.fontSize(9).font('Helvetica')
       .text('FACULTAD DE INGENIERÍA MOCHIS  |  Licenciatura en Ingeniería de Software (7.º Semestre)', 55, 63, { align: 'center', width: 502 });
    doc.fontSize(8.5).font('Helvetica-Oblique')
       .text('Desarrollo Backend de Aplicaciones  —  Titular: Dr. Herman Geovany Ayala Zúñiga', 55, 77, { align: 'center', width: 502 });

    doc.moveDown(2.5);

    // TÍTULO DEL REPORTE
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold')
       .text(`REPORTE TÉCNICO OFICIAL DE ENTREGA: ${data.week.toUpperCase()}`, 45, 115);
    doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold')
       .text(`Hito de Ingeniería: ${data.milestone} | Git Tag: ${data.tag}`, 45, 133);

    // FICHA METADATOS (CARD)
    const cardTop = 150;
    doc.roundedRect(45, cardTop, 522, 75, 4).fillAndStroke(cardBg, borderCard);

    doc.fillColor(darkText).fontSize(8.5).font('Helvetica-Bold');
    doc.text('Estudiante:', 55, cardTop + 10);
    doc.font('Helvetica').text('Alan Abraham Peña Nava (Matrícula: 23122668)', 140, cardTop + 10);

    doc.font('Helvetica-Bold').text('Proyecto Final:', 55, cardTop + 24);
    doc.font('Helvetica').text('BL FRAGANCIAS — E-Commerce y Control de Inventario', 140, cardTop + 24);

    doc.font('Helvetica-Bold').text('Periodo / Fechas:', 55, cardTop + 38);
    doc.font('Helvetica').text(`${data.dates} (Ciclo Escolar 2026-B)`, 140, cardTop + 38);

    doc.font('Helvetica-Bold').text('Estado en Git:', 55, cardTop + 52);
    doc.font('Helvetica-Bold').fillColor('#1E7E34')
       .text(`[TAG PUBLICADO EN GITHUB] -> ${data.tag}`, 140, cardTop + 52);

    // SECCIÓN 1: CHECKLIST OFICIAL AUDITABLE
    let yPos = cardTop + 90;
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('1. Checklist de Criterios Oficiales Auditados', 45, yPos);

    yPos += 16;
    data.checklist.forEach((item) => {
      doc.fillColor('#28A745').fontSize(9).font('Helvetica-Bold').text('[x]', 55, yPos);
      doc.fillColor(darkText).fontSize(8.5).font('Helvetica').text(item, 75, yPos, { width: 480 });
      yPos += 18;
    });

    // SECCIÓN 2: RESUMEN TÉCNICO Y ARQUITECTURA
    yPos += 6;
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('2. Resumen Técnico y Arquitectura de la Solución', 45, yPos);

    yPos += 16;
    doc.fillColor(darkText).fontSize(8.5).font('Helvetica')
       .text(data.summary, 45, yPos, { width: 522, align: 'justify' });

    yPos += 30;
    doc.fillColor(secondaryColor).fontSize(9.5).font('Helvetica-Bold')
       .text('Detalle de Implementación:', 45, yPos);

    yPos += 14;
    data.details.forEach((det) => {
      doc.fillColor(primaryColor).fontSize(8).text('•', 55, yPos);
      doc.fillColor(darkText).fontSize(8.5).font('Helvetica').text(det, 68, yPos, { width: 495, align: 'justify' });
      yPos += 26;
    });

    // SECCIÓN 3: ARCHIVOS Y MÓDULOS DESARROLLADOS
    yPos += 4;
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('3. Módulos y Código Fuente Entregados', 45, yPos);

    yPos += 16;
    data.files.forEach((file) => {
      doc.fillColor(darkText).fontSize(8).font('Courier-Bold').text(`- ${file}`, 55, yPos);
      yPos += 13;
    });

    // SECCIÓN 4: VERIFICACIÓN Y AUDITORÍA
    yPos += 8;
    doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold')
       .text('4. Evidencias de Verificación y Control de Calidad', 45, yPos);

    yPos += 16;
    doc.roundedRect(45, yPos, 522, 36, 4).fillAndStroke('#E8F5E9', '#A5D6A7');
    doc.fillColor('#1B5E20').fontSize(8.5).font('Helvetica-Bold')
       .text('Resultado de Auditoría Local y CI:', 55, yPos + 6);
    doc.font('Helvetica').fillColor('#2E7D32')
       .text(data.verification, 55, yPos + 18, { width: 502 });

    // PIE DE PÁGINA
    const footerY = 740;
    doc.strokeColor(borderCard).lineWidth(0.8).moveTo(45, footerY).lineTo(567, footerY).stroke();
    doc.fillColor(mutedText).fontSize(7.5).font('Helvetica')
       .text('Universidad Autónoma de Sinaloa  •  Facultad de Ingeniería Mochis  •  Checklist Oficial Proyecto Backend 2026-B', 45, footerY + 6, { align: 'center', width: 522 });

    doc.end();

    stream.on('finish', () => resolve(destPath));
    stream.on('error', (err) => reject(err));
  });
}

async function run() {
  console.log(`Generando reportes PDF en: ${outputDir}`);
  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const filename = `${report.week.replace(' ', '_')}_${report.tag}.pdf`;
    const targetFile = path.join(outputDir, filename);
    await generateReportPDF(report, targetFile);
    console.log(`Generado: ${filename}`);
  }
  console.log('Todos los PDFs fueron generados exitosamente.');
}

run().catch((err) => {
  console.error('Error al generar los reportes:', err);
  process.exit(1);
});
