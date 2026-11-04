# Especificación Técnica y Plan de Entregas: BL FRAGANCIAS – Perfumería Fina y Decants

**Proyecto Backend · Evaluación Bimodal Institucional 2026-I**
* **Asignatura:** Desarrollo Backend de Aplicaciones
* **Profesor Titular:** Dr. Herman Geovany Ayala Zúñiga
* **Institución:** Universidad Autónoma de Sinaloa · Facultad de Ingeniería Mochis
* **Repositorio Oficial:** `DesarrolloBackend-2026-402/23122668`
* **Proyecto Asignado:** **BL FRAGANCIAS – Perfumería Fina y Decants**
* **Descripción del Dominio:** E-commerce y control de existencias de perfumería fina: fraccionamiento en decants (3ml, 5ml, 10ml), botellas selladas y lotes batch.

Este documento establece la planeación técnica formal de 4 semanas, organizada en **2 entregables por semana (8 entregables totales)** con fechas límite indefectibles cada **Jueves** y **Domingo**.

Cada estudiante debe integrar en su proyecto los conceptos y componentes de ingeniería backend desarrollados en los materiales del curso (Capítulos 3 al 18), cubriendo la totalidad de los requerimientos funcionales y no funcionales de su propuesta y publicando las etiquetas de versión reglamentarias (tags de Git) en GitHub antes del cierre de cada hito.

> **Integración con Moodle:** Al crear cada tag y release formal en GitHub, el sistema de autograding ejecuta las pruebas de contrato sobre los endpoints y transmite la calificación automáticamente al libro de notas de Moodle (Curso ID 730).

---

## 1. Convención Oficial de Entregas, Fechas Límite e Hitos Técnicos (con RF y RNF)

| Semana | Entregable | Fecha Límite Reglamentaria | Tag Obligatorio | Hito Técnico a Implementar (RF y RNF Asociados) | Capítulos de Referencia |
| :---: | :---: | :--- | :---: | :--- | :--- |
| Semana 1 | e1.1 | **Jueves**<br>Jueves 12 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.1.0-e1.1` | **Arquitectura limpia en TypeScript, entorno Docker, patrones creacionales y autenticación con JWT**<br>• *RF:* RF01 a RF5 (Autenticación, registro, perfil de usuarios, control de credenciales y roles de acceso RBAC)<br>• *RNF:* RNF01 (Seguridad JWT y Hashing de Contraseñas), RNF05 (Mantenibilidad y Clean Architecture) | Cap. 3, 4, 5, 10, 11, 13 |
| Semana 1 | e1.2 | **Domingo**<br>Domingo 15 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.1.0-e1.2` | **Modelado de entidades de negocio, catálogos base, índices en base de datos y cadena de middlewares**<br>• *RF:* RF6 a RF6 (Modelado relacional de entidades principales, catálogos base, integridad referencial y validación de esquemas)<br>• *RNF:* RNF03 (Integridad Referencial en Base de Datos), RNF08 (Validación Estricta de Entradas con DTOs) | Cap. 6, 12, 14 |
| Semana 2 | e2.1 | **Jueves**<br>Jueves 19 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.2.0-e2.1` | **Búsqueda avanzada, paginación de resultados, optimización de consultas y caché con Redis**<br>• *RF:* RF7 a RF9 (Búsqueda avanzada multicriterio, paginación estructurada, filtros dinámicos y caché LRU en memoria)<br>• *RNF:* RNF02 (Rendimiento de Consulta < 200ms con Índices B-Tree y Redis) | Cap. 6, 7, 14 |
| Semana 2 | e2.2 | **Domingo**<br>Domingo 22 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.2.0-e2.2` | **Transacciones atómicas ACID, control de concurrencia y suite de pruebas automatizadas**<br>• *RF:* RF10 a RF12 (Operación transaccional crítica del dominio, cálculo atómico, aislamiento de bloqueos y prevención de sobreventa)<br>• *RNF:* RNF03 (Atomicidad y Consistencia ACID con Rollback Automático), RNF04 (Disponibilidad Continua) | Cap. 6, 9, 15 |
| Semana 3 | e3.1 | **Jueves**<br>Jueves 26 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.3.0-e3.1` | **Máquina de estados de negocio, procesamiento asíncrono con colas y sistema de notificaciones**<br>• *RF:* RF13 a RF15 (Máquina de estados finitos del flujo de trabajo, transiciones reglamentadas y colas de notificaciones asíncronas)<br>• *RNF:* RNF06 (Escalabilidad Horizontal con Procesamiento en Colas BullMQ) | Cap. 8, 12, 16 |
| Semana 3 | e3.2 | **Domingo**<br>Domingo 29 de noviembre de 2026, 23:59 hrs MX (UTC-6) | `v0.3.0-e3.2` | **Flujo de eventos, registro de auditoría inmutable y proyección analítica CQRS**<br>• *RF:* RF16 a RF17 (Flujo de eventos de dominio, bitácora de auditoría histórica inmutable y proyección de consultas segregadas)<br>• *RNF:* RNF09 (Trazabilidad y Registro Inmutable de Operaciones Críticas) | Cap. 16, 17 |
| Semana 4 | e4.1 | **Jueves**<br>Jueves 3 de diciembre de 2026, 23:59 hrs MX (UTC-6) | `v0.4.0-e4.1` | **Módulo de reportes analíticos, optimización del ciclo de eventos y subprocesos Worker Threads**<br>• *RF:* RF18 a RF21 (Módulo de reportes analíticos, agregaciones estadísticas complejas y descarga intensiva de cómputo)<br>• *RNF:* RNF02 (No Bloqueo del Ciclo de Eventos mediante Subprocesos Worker Threads) | Cap. 18 |
| Semana 4 | e4.2 | **Domingo**<br>Domingo 6 de diciembre de 2026, 23:59 hrs MX (UTC-6) | `v1.0.0-final` | **Versión final de producción 1.0.0, documentación OpenAPI/Swagger y suite completa de pruebas**<br>• *RF:* RF01 a RF21 (100% de Requerimientos Funcionales) (Cobertura integral de todas las operaciones del sistema, suite completa de pruebas de humo y documentación)<br>• *RNF:* RNF01 a RNF16 (100% de Requerimientos No Funcionales: Seguridad, Rendimiento, Docker y Respaldos) | Cap. 9, 10, 13 |

---

## 2. Desglose Técnico de Elementos Obligatorios a Integrar (Capítulos 3 al 18)

Los siguientes componentes técnicos deben estar integrados de forma funcional en el backend de **BL FRAGANCIAS – Perfumería Fina y Decants**, garantizando la cobertura de los requerimientos indicados:

### Semana 1: Cimientos de Arquitectura, Persistencia y Seguridad

#### Entregable 1.1 (`v0.1.0-e1.1`): Arquitectura Limpia, Docker y Autenticación JWT
* **Fecha Límite:** Jueves 12 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 3 (Express.js), Cap. 4 (Planeación de la Aplicación), Cap. 5 (Módulo de Usuarios y JWT), Cap. 10 (Docker Compose), Cap. 11 (Patrones Creacionales: Singleton), Cap. 13 (Principios SOLID y Arquitectura Limpia).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF01 a RF5` (Autenticación, registro, perfil de usuarios, control de credenciales y roles de acceso RBAC).
  - **Requerimientos No Funcionales:** `RNF01 (Seguridad JWT y Hashing de Contraseñas), RNF05 (Mantenibilidad y Clean Architecture)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Estructura modular en capas con TypeScript:** Separación estricta de controladores, servicios de aplicación, entidades de dominio y repositorios (inversión de dependencias).
  - **Entorno de contenedores:** Servicio de base de datos relacional PostgreSQL 16 y motor de caché Redis 7 orquestados mediante `docker-compose.yml` con volúmenes persistentes y variables de entorno (`.env`). Patrón Singleton para clientes de conexión.
  - **Módulo de usuarios y seguridad:** Registro, inicio de sesión seguro, hashing de contraseñas con `bcrypt` (factor de costo >= 10) y emisión/verificación de tokens `JWT`.
  - **Control de acceso basado en roles (RBAC):** Implementación estricta de los roles específicos del sistema:
    - **Administrador**
    - **Operador de Envíos / Fraccionador**
    - **Cliente**

#### Entregable 1.2 (`v0.1.0-e1.2`): Entidades de Negocio, Catálogos e Índices B-Tree
* **Fecha Límite:** Domingo 15 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 6 (Módulos de Entidades y Relaciones), Cap. 12 (Cadena de Middlewares), Cap. 14 (Motores de Almacenamiento e Índices B-Tree).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF6 a RF6` (Modelado relacional de entidades principales, catálogos base, integridad referencial y validación de esquemas).
  - **Requerimientos No Funcionales:** `RNF03 (Integridad Referencial en Base de Datos), RNF08 (Validación Estricta de Entradas con DTOs)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Modelado de entidades primarias y catálogos:** Implementación en TypeORM o QueryBuilder con llaves primarias, foráneas e integridad referencial estricta:
    - `Perfume`
    - `CasaPerfumera`
    - `PresentacionDecant`
    - `LoteBatch`
    - `Pedido`
    - `DetallePedido`
    - `GuiaEnvio`
  - **Diseño de índices B-Tree:** Creación de índices compuestos B-Tree en columnas de búsqueda y ordenamiento frecuente:
    - `perfumes(nombre, genero, casa_id)`
    - `pedidos(folio, estado)`
  - **Cadena de middlewares:** Validación estricta de esquemas de entrada (DTOs con class-validator o Zod), middleware de registro de peticiones (logger estructurado) y manejador centralizado de errores con códigos de estado HTTP estándar (200, 201, 400, 401, 403, 404, 422).

---

### Semana 2: Optimización de Consultas, Transacciones y Pruebas

#### Entregable 2.1 (`v0.2.0-e2.1`): Búsqueda Avanzada, Paginación y Caché con Redis
* **Fecha Límite:** Jueves 19 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 6 (Consultas Avanzadas), Cap. 7 (Almacenamiento en Caché de APIs con Redis), Cap. 14 (Optimización de Consultas y EXPLAIN ANALYZE).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF7 a RF9` (Búsqueda avanzada multicriterio, paginación estructurada, filtros dinámicos y caché LRU en memoria).
  - **Requerimientos No Funcionales:** `RNF02 (Rendimiento de Consulta < 200ms con Índices B-Tree y Redis)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Endpoints de búsqueda dinámica y filtros multicriterio:** /api/v1/perfumes?casa=...&familia=... y /api/v1/pedidos?cliente=....
  - **Paginación estructurada:** Implementación estándar de paginación (`page`, `limit`, `total`, `totalPages`).
  - **Análisis de rendimiento SQL:** Comprobación del plan de ejecución con `EXPLAIN ANALYZE` garantizando el uso de índices sobre escaneos secuenciales (`Seq Scan`).
  - **Capa de almacenamiento en caché con Redis:** Almacenamiento en memoria RAM para catálogos y consultas de lectura intensiva, con tiempo de expiración (`TTL`) e invalidación automática ante eventos de creación, actualización o eliminación.

#### Entregable 2.2 (`v0.2.0-e2.2`): Transacciones Atómicas ACID y Pruebas Automatizadas
* **Fecha Límite:** Domingo 22 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 6 (Transacciones ACID), Cap. 9 (Pruebas Automatizadas de APIs), Cap. 15 (Transacciones Avanzadas, Niveles de Aislamiento y Concurrencia).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF10 a RF12` (Operación transaccional crítica del dominio, cálculo atómico, aislamiento de bloqueos y prevención de sobreventa).
  - **Requerimientos No Funcionales:** `RNF03 (Atomicidad y Consistencia ACID con Rollback Automático), RNF04 (Disponibilidad Continua)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Operación transaccional crítica (ACID):**
    > **Creación de pedido de decants con descuento atómico de mililitros en lote batch de botella nodriza y generación de guía**  
    Implementada mediante `QueryRunner` con atomicidad completa y rollback automático ante cualquier fallo.
  - **Control de concurrencia y aislamiento:** Prevención de anomalías mediante niveles de aislamiento adecuados (`READ COMMITTED` / `REPEATABLE READ`) y bloqueos según aplique (`SELECT ... FOR UPDATE`).
  - **Suite de pruebas automatizadas:** Pruebas unitarias y de integración (Jest/Supertest o Mocha/Chai) validando contratos HTTP, esquemas JSON y códigos de error (200, 201, 400, 401, 403, 404, 409, 422).

---

### Semana 3: Eventos de Negocio, Mensajería y Auditoría Inmutable

#### Entregable 3.1 (`v0.3.0-e3.1`): Máquina de Estados y Procesamiento Asíncrono con Colas
* **Fecha Límite:** Jueves 26 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 8 (Módulo de Notificaciones y BullMQ), Cap. 12 (Máquinas de Estados y Patrón Observer), Cap. 16 (Patrones de Mensajería Asíncrona).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF13 a RF15` (Máquina de estados finitos del flujo de trabajo, transiciones reglamentadas y colas de notificaciones asíncronas).
  - **Requerimientos No Funcionales:** `RNF06 (Escalabilidad Horizontal con Procesamiento en Colas BullMQ)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Máquina de estados finita:** Control estricto del ciclo de vida de **Pedido** impidiendo transiciones inválidas:
    1. `Pago_Pendiente`
    2. `Confirmado_Por_Fraccionar`
    3. `Empacado_Con_Guia`
    4. `En_Transito`
    5. `Entregado`
    6. `Devuelto`
  - **Colas de procesamiento asíncrono en segundo plano:** Uso de Redis y BullMQ (o RabbitMQ) para desacoplar tareas pesadas y envío de notificaciones/alertas sin demorar la respuesta HTTP al cliente.
  - **Políticas de resiliencia:** Confirmaciones manuales (`ack` / `nack`), reintentos exponenciales y manejo de colas de mensajes fallidos (`dead letter queue`).

#### Entregable 3.2 (`v0.3.0-e3.2`): Flujo de Eventos, Registro de Auditoría y CQRS
* **Fecha Límite:** Domingo 29 de noviembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 16 (Arquitecturas Desacopladas por Eventos), Cap. 17 (Procesamiento de Flujos de Eventos y Captura de Cambios CDC).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF16 a RF17` (Flujo de eventos de dominio, bitácora de auditoría histórica inmutable y proyección de consultas segregadas).
  - **Requerimientos No Funcionales:** `RNF09 (Trazabilidad y Registro Inmutable de Operaciones Críticas)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Registro inmutable de auditoría (Audit Log):** Almacenamiento de trazas de operaciones críticas: usuario responsable, dirección IP, marca de tiempo (`timestamp`), entidad afectada y estado previo/posterior.
  - **Segregación de consultas y comandos (Patrón CQRS básico):** Separación de modelos optimizados para escritura transaccional y modelos proyectados para lecturas ultrarrápidas.

---

### Semana 4: Módulo de Reportes, Cómputo Paralelo y Versión Final 1.0.0

#### Entregable 4.1 (`v0.4.0-e4.1`): Módulo de Reportes Analíticos y Worker Threads
* **Fecha Límite:** Jueves 3 de diciembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 18 (Optimización del Ciclo de Eventos, Worker Threads y Procesos Hijo).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF18 a RF21` (Módulo de reportes analíticos, agregaciones estadísticas complejas y descarga intensiva de cómputo).
  - **Requerimientos No Funcionales:** `RNF02 (No Bloqueo del Ciclo de Eventos mediante Subprocesos Worker Threads)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Módulo de reportes analíticos:**
    > **Módulo de reportes de perfumes más vendidos por mililitro, mermas de decantación, valor de inventario por casa y ventas por canal**
  - **Cómputo paralelo con `worker_threads` (`workerpool`):** Delegación de agregaciones estadísticas complejas, cálculos analíticos y consolidación de datos a hilos trabajadores independientes para **no bloquear el ciclo de eventos principal (Event Loop)** de Node.js.
  - **Endpoints de reportes:** Rutas dedicadas protegidas para la consulta y exportación de reportes ejecutivos.

#### Entregable 4.2 (`v1.0.0-final`): Versión 1.0.0, OpenAPI/Swagger y Entrega Final
* **Fecha Límite:** Domingo 6 de diciembre de 2026, 23:59 hrs MX (UTC-6).
* **Capítulos de Referencia:** Cap. 9 (Cobertura Total de Pruebas), Cap. 10 (Despliegue en Producción), Cap. 13 (Verificación de Clean Architecture).
* **Requerimientos Cubiertos:**
  - **Requerimientos Funcionales:** `RF01 a RF21 (100% de Requerimientos Funcionales)`.
  - **Requerimientos No Funcionales:** `RNF01 a RNF16 (100% de Requerimientos No Funcionales: Seguridad, Rendimiento, Docker y Respaldos)`.
* **Elementos Específicos a Integrar en BL FRAGANCIAS – Perfumería Fina y Decants:**
  - **Documentación OpenAPI 3.0 / Swagger UI:** Interfaz interactiva en `/api/docs` con esquemas de petición, respuesta y autenticación Bearer JWT.
  - **Verificación de pruebas de humo:** Ejecución exitosa de `node scripts/smoke_test.js` previo a la liberación.
  - **Release formal en GitHub:** Publicación reglamentaria de la versión `v1.0.0-final` en la sección de releases de GitHub con notas de versión completas (changelog).

---

## 3. Matriz de Trazabilidad Integral de Requerimientos (100% de Cobertura)

Esta matriz certifica que la totalidad de los requerimientos funcionales y no funcionales especificados para **BL FRAGANCIAS – Perfumería Fina y Decants** están debidamente vinculados a un entregable y mecanismo de verificación automatizado:

| Código Requerimiento | Clasificación | Alcance en el Dominio de BL FRAGANCIAS – Perfumería Fina y Decants | Entregable Asignado | Tag Oficial | Mecanismo de Validación |
| :---: | :---: | :--- | :---: | :---: | :--- |
| **RF01 a RF5** | Funcional | Autenticación, registro, perfil de usuarios, control de credenciales y roles de acceso RBAC | e1.1 (Semana 1) | `v0.1.0-e1.1` | Pruebas de autenticación y endpoints RBAC (`/api/v1/auth`) |
| **RF6 a RF6** | Funcional | Modelado relacional de entidades principales, catálogos base, integridad referencial y validación de esquemas | e1.2 (Semana 1) | `v0.1.0-e1.2` | Validación de esquemas DTO y consultas a catálogos base |
| **RF7 a RF9** | Funcional | Búsqueda avanzada multicriterio, paginación estructurada, filtros dinámicos y caché LRU en memoria | e2.1 (Semana 2) | `v0.2.0-e2.1` | Pruebas de carga con caché Redis y planes `EXPLAIN ANALYZE` |
| **RF10 a RF12** | Funcional | Operación transaccional crítica del dominio, cálculo atómico, aislamiento de bloqueos y prevención de sobreventa | e2.2 (Semana 2) | `v0.2.0-e2.2` | Pruebas de concurrencia y atomicidad ACID con rollback |
| **RF13 a RF15** | Funcional | Máquina de estados finitos del flujo de trabajo, transiciones reglamentadas y colas de notificaciones asíncronas | e3.1 (Semana 3) | `v0.3.0-e3.1` | Validación de transiciones de estado y consumo en cola BullMQ |
| **RF16 a RF17** | Funcional | Flujo de eventos de dominio, bitácora de auditoría histórica inmutable y proyección de consultas segregadas | e3.2 (Semana 3) | `v0.3.0-e3.2` | Auditoría inmutable de eventos y consistencia en lectura CQRS |
| **RF18 a RF21** | Funcional | Módulo de reportes analíticos, agregaciones estadísticas complejas y descarga intensiva de cómputo | e4.1 (Semana 4) | `v0.4.0-e4.1` | Pruebas de no bloqueo del ciclo de eventos con Worker Threads |
| **RF01 a RF21 (100% de Requerimientos Funcionales)** | Funcional | Cobertura integral de todas las operaciones del sistema | e4.2 (Semana 4) | `v1.0.0-final` | Suite completa de pruebas de humo y especificación Swagger UI |
| **RNF01, RNF05** | No Funcional | Seguridad de credenciales, cifrado Bcrypt y Clean Architecture | e1.1 / e4.2 | `v0.1.0-e1.1` | Inspección estática de código y análisis de dependencias |
| **RNF03, RNF08** | No Funcional | Integridad referencial y validación estricta de payloads JSON | e1.2 / e2.2 | `v0.1.0-e1.2` | Pruebas de contrato con datos inválidos (código 400 y 422) |
| **RNF02, RNF06** | No Funcional | Rendimiento óptimo (<200ms) y escalabilidad asíncrona | e2.1 / e4.1 | `v0.2.0-e2.1` | Métricas de latencia con Redis y Workers paralelos |
| **RNF04, RNF09** | No Funcional | Disponibilidad continua, trazabilidad e inmutabilidad de logs | e2.2 / e3.2 | `v0.3.0-e3.2` | Verificación de bitácora histórica y persistencia en fallos |
| **RNF07, RNF10** | No Funcional | Despliegue reproducible en Docker y respaldo de base de datos | e1.1 / e4.2 | `v1.0.0-final` | Despliegue en contenedor Docker y pruebas de humo integradas |

---

## 4. Contratos de API REST Principales de BL FRAGANCIAS – Perfumería Fina y Decants

* `POST /api/v1/auth/login (200, 401)`
* `GET /api/v1/perfumes (200)`
* `POST /api/v1/pedidos (201, 400, 409, 422)`
* `PATCH /api/v1/pedidos/:id/guia (200, 400)`
* `GET /api/v1/reportes/ventas-fragancias (200, 403)`

---

## 5. Política de Evaluación, Fechas de Vencimiento y Régimen de Penalizaciones

### 5.1 Calendario Oficial de Fechas Límite (Jueves y Domingos)
Las entregas se cierran indefectiblemente los días **Jueves** (Entregable .1) y **Domingos** (Entregable .2) a las **23:59:59 hrs (Hora Central de México / UTC-6)**:
- **Semana 1:** Jueves 12 de noviembre de 2026 (`e1.1`) y Domingo 15 de noviembre de 2026 (`e1.2`).
- **Semana 2:** Jueves 19 de noviembre de 2026 (`e2.1`) y Domingo 22 de noviembre de 2026 (`e2.2`).
- **Semana 3:** Jueves 26 de noviembre de 2026 (`e3.1`) y Domingo 29 de noviembre de 2026 (`e3.2`).
- **Semana 4:** Jueves 3 de diciembre de 2026 (`e4.1`) y Domingo 6 de diciembre de 2026 (`e4.2`).

### 5.2 Ponderación de Evaluación Automatizada

| Rubro de Evaluación | Peso | Mecanismo de Verificación |
| :--- | :---: | :--- |
| **Cumplimiento de Contratos HTTP y Esquemas** | 35% | Verificación de rutas, métodos, payloads JSON, validaciones de entrada y códigos de estado (200, 201, 400, 401, 403, 404, 409, 422). |
| **Seguridad, Autenticación y Roles** | 25% | Protección de rutas, validación de tokens JWT y control de acceso basado en roles (Administrador, Operador de Envíos / Fraccionador, Cliente). |
| **Persistencia, Integridad y Transacciones** | 20% | Relaciones foráneas, índices B-Tree, atomicidad en transacciones críticas ACID y prevención de inconsistencias. |
| **Releases de GitHub y Control de Versiones** | 20% | Existencia del tag reglamentario exacto y notas de versión (changelog) en GitHub Releases. |

### 5.3 Régimen de Penalización por Entrega Tardía (Extemporánea)
La fecha y hora oficial de entrega se determina mediante el timestamp criptográfico del tag publicado en GitHub:
1. **Retraso de 1 minuto a 24 horas:** Penalización de **-15 puntos** sobre la nota final del entregable.
2. **Retraso de 24 horas y 1 minuto a 48 horas:** Penalización de **-30 puntos** sobre la nota final del entregable.
3. **Posterior a 48 horas de retraso:** **Sin derecho a evaluación (calificación 0 / 100)**. El entregable se registra como no presentado.

### 5.4 Régimen de Reentrega por Fallas (Segunda Oportunidad con sufijo `-rev`)
Si la calificación obtenida en la revisión automatizada es inferior a **80 puntos** o el entregable reprueba pruebas de contrato o humo:
1. El estudiante dispone de una ventana improrrogable de **48 horas** a partir del informe emitido en Moodle para corregir las observaciones técnicas.
2. Deberá publicar una etiqueta reglamentaria con el sufijo oficial (ejemplo: `v0.1.1-e1.1-rev`).
3. **Tope de calificación:** La calificación máxima alcanzable en una segunda oportunidad por corrección de fallas es de **85 puntos** (deducción fija de 15 puntos por reproceso técnico respecto a quienes acreditaron en tiempo y forma a la primera oportunidad).

---

## 6. Rúbrica y Criterios Docentes para la Evaluación Continua

Para la acreditación de cada entrega, el equipo docente y los evaluadores automáticos verificarán los siguientes 5 pilares de ingeniería:

1. **Arquitectura y Estructura en Capas (20%):** Separación limpia entre controladores, casos de uso, entidades de dominio y repositorios de infraestructura. Prohibido mezclar lógica SQL en controladores. Tipado estricto en TypeScript sin uso de `any`.
2. **Seguridad y Control de Acceso RBAC (20%):** Implementación rigurosa de JWT con expiración estricta y rotación de tokens. Middleware de autenticación y autorización que valide el rol del usuario antes de ejecutar la lógica de negocio. Contraseñas protegidas mediante `bcrypt`.
3. **Persistencia e Integridad Transaccional ACID (20%):** Integridad referencial en PostgreSQL, índices B-Tree compuestos que eviten lecturas secuenciales completas (`Seq Scan`), transacciones atómicas con `QueryRunner` para operaciones críticas de múltiples tablas y control de concurrencia.
4. **Rendimiento, Optimización del Ciclo de Eventos y Asincronía (20%):** Uso de Redis para caché de catálogos e invalidación ante escrituras. Descarga de cómputos analíticos pesados a **subprocesos Worker Threads** para garantizar que el **ciclo de eventos (Event Loop)** de Node.js nunca se bloquee. Procesamiento de colas en segundo plano con BullMQ.
5. **Calidad de Pruebas, Documentación OpenAPI y Disciplina Git (20%):** Pruebas automatizadas de integración y unitarias que validen códigos de éxito y casos de error. Documentación interactiva Swagger UI en `/api/docs`. Commits atómicos con formato convencional y releases formales con notas de versión.
