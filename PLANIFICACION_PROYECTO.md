# especificación técnica y plan de entregas: BL FRAGANCIAS – Perfumería Fina y Decants

**proyecto backend · evaluación bimodal institucional 2026-I**
* **asignatura:** Desarrollo Backend de Aplicaciones
* **profesor titular:** Dr. Herman Geovany Ayala Zúñiga
* **institución:** Universidad Autónoma de Sinaloa · Facultad de Ingeniería Mochis
* **repositorio:** `DesarrolloBackend-2026-402/23122668`
* **proyecto del estudiante:** BL FRAGANCIAS – Perfumería Fina y Decants

este documento establece la planeación técnica formal de 4 semanas, organizada en **2 entregables por semana (8 entregables totales)**.

cada estudiante debe integrar en su proyecto los conceptos y componentes de ingeniería backend desarrollados en los materiales del curso (capítulos 3 al 18), publicando las etiquetas de versión reglamentarias (tags de git) en github antes del cierre de cada hito.

> **integración con moodle:** al crear cada tag y release formal en github, el sistema de autograding ejecuta las pruebas de contrato sobre los endpoints y transmite la calificación automáticamente al libro de notas de moodle (curso id 730).

---

## 1. convención oficial de entregas y releases en github

| semana | entregable | tag obligatorio | hito técnico a implementar | capítulos de referencia |
| :---: | :---: | :---: | :--- | :--- |
| semana 1 | e1.1 | `v0.1.0-e1.1` | Arquitectura limpia en TypeScript, entorno Docker, patrones creacionales y autenticación con JWT | Cap. 3, 4, 5, 10, 11, 13 |
| semana 1 | e1.2 | `v0.1.0-e1.2` | Modelado de entidades de negocio, catálogos base, índices en base de datos y cadena de middlewares | Cap. 6, 12, 14 |
| semana 2 | e2.1 | `v0.2.0-e2.1` | Búsqueda avanzada, paginación de resultados, optimización de consultas y caché con Redis | Cap. 6, 7, 14 |
| semana 2 | e2.2 | `v0.2.0-e2.2` | Transacciones atómicas ACID, control de concurrencia y suite de pruebas automatizadas | Cap. 6, 9, 15 |
| semana 3 | e3.1 | `v0.3.0-e3.1` | Máquina de estados de negocio, procesamiento asíncrono con colas y sistema de notificaciones | Cap. 8, 12, 16 |
| semana 3 | e3.2 | `v0.3.0-e3.2` | Flujo de eventos, registro de auditoría inmutable y proyección analítica CQRS | Cap. 16, 17 |
| semana 4 | e4.1 | `v0.4.0-e4.1` | Módulo de reportes analíticos, optimización del bucle de eventos y subprocesos Worker Threads | Cap. 18 |
| semana 4 | e4.2 | `v1.0.0-final` | Versión final de producción 1.0.0, documentación OpenAPI/Swagger y suite completa de pruebas | Cap. 9, 10, 13 |

---

## 2. desglose técnico de elementos obligatorios a integrar

los siguientes componentes técnicos (desarrollados a lo largo de los capítulos 3 al 18) deben estar integrados de forma funcional en el backend del proyecto:

### semana 1: cimientos de arquitectura, persistencia y seguridad

#### entregable 1.1 (`v0.1.0-e1.1`): arquitectura limpia, docker y autenticación jwt
* **capítulos de referencia:** cap. 3 (express.js), cap. 4 (planeación de la aplicación), cap. 5 (módulo de usuarios y jwt), cap. 10 (docker compose), cap. 11 (patrones creacionales: singleton), cap. 13 (principios solid y arquitectura limpia).
* **elementos obligatorios a integrar en el proyecto:**
  - estructura modular en capas con typescript: separación estricta de controladores, servicios de aplicación, entidades de dominio y repositorios.
  - contenedor de base de datos relacional (postgresql 16) y caché (redis 7) orquestados mediante `docker-compose.yml` con volúmenes persistentes y variables de entorno (`.env`).
  - módulo de usuarios con hashing seguro de contraseñas (`bcrypt` factor >= 10), registro, inicio de sesión y emisión/verificación de tokens `jwt`.
  - control de acceso basado en roles (`rbac`: administrador, operador/empleado, cliente/usuario general).

#### entregable 1.2 (`v0.1.0-e1.2`): entidades de negocio, catálogos e índices b-tree
* **capítulos de referencia:** cap. 6 (módulos de entidades y relaciones), cap. 12 (cadena de middlewares), cap. 14 (motores de almacenamiento e índices b-tree).
* **elementos obligatorios a integrar en el proyecto:**
  - modelado de entidades principales y catálogos base del negocio con typeorm o querybuilder.
  - llaves foráneas explícitas, restricciones de unicidad e integridad referencial (evitar registros huérfanos).
  - diseño y creación de índices b-tree en columnas de búsqueda y filtrado frecuente.
  - cadena de middlewares: validación estricta de esquemas de entrada (con zod o joi), middleware de registro de peticiones (logger) y manejador centralizado de errores con códigos de estado http (200, 201, 400, 401, 403, 404, 422).

---

### semana 2: optimización de consultas, transacciones y pruebas

#### entregable 2.1 (`v0.2.0-e2.1`): búsqueda avanzada, paginación y caché con redis
* **capítulos de referencia:** cap. 6 (consultas avanzadas), cap. 7 (almacenamiento en caché de apis con redis), cap. 14 (optimización de consultas).
* **elementos obligatorios a integrar en el proyecto:**
  - endpoints de búsqueda dinámica con filtros combinados y ordenamiento multicriterio.
  - paginación estructurada de resultados (`page`, `limit`, `total`, `totalPages`).
  - análisis de rendimiento de consultas sql mediante `explain analyze` para validar el uso correcto de índices.
  - capa de almacenamiento en caché en memoria ram con redis para endpoints de lectura frecuente (catálogos, listas principales) con tiempo de vida (`ttl`) e invalidación automática ante modificaciones.

#### entregable 2.2 (`v0.2.0-e2.2`): transacciones atómicas acid y pruebas automatizadas
* **capítulos de referencia:** cap. 6 (transacciones acid), cap. 9 (pruebas automatizadas de apis), cap. 15 (transacciones avanzadas, aislamiento y concurrencia).
* **elementos obligatorios a integrar en el proyecto:**
  - operaciones transaccionales compuestas (ejemplo: venta con descuento de inventario, reserva con bloqueo de horario) ejecutadas bajo transacciones atómicas acid (`queryrunner` / transacciones de base de datos) con rollback automático ante fallos.
  - control de concurrencia y prevención de anomalías mediante bloqueos adecuados (optimista o pesimista `select for update`).
  - suite de pruebas automatizadas (pruebas unitarias y de integración) con jest/supertest o mocha validando contratos http, esquemas de respuesta y códigos de error.

---

### semana 3: eventos de negocio, mensajería y auditoría inmutable

#### entregable 3.1 (`v0.3.0-e3.1`): máquina de estados y procesamiento asíncrono con colas
* **capítulos de referencia:** cap. 8 (módulo de notificaciones y bullmq), cap. 12 (máquinas de estados y patrón observer), cap. 16 (patrones de mensajería asíncrona).
* **elementos obligatorios a integrar en el proyecto:**
  - máquina de estados finita para controlar el ciclo de vida de las operaciones clave (ej. pendiente -> en proceso -> completado / cancelado) impidiendo transiciones inválidas.
  - desacoplamiento de tareas en segundo plano mediante colas de trabajo con redis y bullmq (o rabbitmq): envío de notificaciones, alertas de inventario o comprobantes por correo.
  - confirmación manual de procesamiento (`ack` / `nack`) y políticas de reintento ante caídas temporales.

#### entregable 3.2 (`v0.3.0-e3.2`): flujo de eventos, registro de auditoría y cqrs
* **capítulos de referencia:** cap. 16 (arquitecturas desacopladas por eventos), cap. 17 (procesamiento de flujos de eventos y captura de cambios cdc).
* **elementos obligatorios a integrar en el proyecto:**
  - registro inmutable de auditoría (audit log): almacenamiento de eventos de modificación con usuario responsable, marca de tiempo y estado previo/posterior.
  - patrón básico de segregación de responsabilidades de consulta y comando (`cqrs`): separación de modelos optimizados para escritura y vistas precalculadas o consultas analíticas directas.

---

### semana 4: módulo de reportes, cómputo paralelo y versión final 1.0.0

#### entregable 4.1 (`v0.4.0-e4.1`): módulo de reportes analíticos y worker threads
* **capítulos de referencia:** cap. 18 (optimización del event loop, worker threads y procesos hijo).
* **elementos obligatorios a integrar en el proyecto:**
  - **módulo de reportes analíticos:** generación de resúmenes estadísticos, totales agregados por periodo (diario, semanal, mensual), métricas clave de desempeño y estados consolidados del negocio.
  - uso de subprocesos `worker_threads` (workerpool) para delegar cálculos numéricos intensivos, generación de reportes y agregaciones analíticas complejas sin bloquear el bucle de eventos principal (event loop) de express.
  - endpoints protegidos para consulta y descarga de reportes ejecutivos.

#### entregable 4.2 (`v1.0.0-final`): versión 1.0.0, openapi/swagger y entrega final
* **capítulos de referencia:** cap. 9 (cobertura total de pruebas), cap. 10 (despliegue en producción), cap. 13 (verificación de arquitectura limpia).
* **elementos obligatorios a integrar en el proyecto:**
  - documentación interactiva y estandarizada de toda la api mediante openapi 3.0 / swagger ui (`/api/docs`).
  - verificación completa de la suite de pruebas locales ejecutando `node scripts/smoke_test.js` y pruebas automatizadas con cobertura verificada.
  - entorno de producción configurado: scripts de compilación (`npm run build`), variables de entorno listas y orquestación estable con docker compose.
  - publicación formal del release `v1.0.0-final` en github con notas de versión completas (changelog).

---

## 3. criterios y ponderación de evaluación automatizada

| rubro de evaluación | peso | mecanismo de verificación |
| :--- | :---: | :--- |
| **cumplimiento de contratos http y esquemas** | 35% | verificación de rutas, métodos, payloads json, validaciones y códigos de estado (200, 201, 400, 401, 403, 404, 409, 422). |
| **seguridad, autenticación y roles** | 25% | protección de rutas, validación de tokens jwt y control de acceso basado en roles (rbac). |
| **persistencia, integridad y transacciones** | 20% | relaciones foráneas, índices b-tree, atomicidad transaccional acid y prevención de inconsistencias. |
| **releases de github y control de versiones** | 20% | existencia del tag reglamentario exacto y notas de versión (changelog) en los releases de github. |

---

## 4. política de segunda oportunidad (-rev)

si la calificación obtenida en la revisión automatizada de un entregable es menor a **80 puntos**, el estudiante dispone de una ventana de **48 horas** para corregir las observaciones y publicar una etiqueta de revisión con el sufijo oficial (ejemplo: `v0.1.1-e1.1-rev`). el autograding recalculará la nota y actualizará la calificación en moodle.
