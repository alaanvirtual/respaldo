# especificación técnica y plan de entregas: bl fragancias - backend de perfumería fina y decants

este documento establece el plan de trabajo de 4 semanas, dividido en **2 entregables por semana (8 entregables en total)**, para el desarrollo e implementación del backend del proyecto **bl fragancias - backend de perfumería fina y decants**.

la evaluación de cada entrega se realiza de forma técnica y automatizada mediante pruebas de contrato sobre los endpoints, esquemas json, códigos de estado http y la publicación de **releases formales en github**.

> **integración con moodle:** al crear cada tag y release en github, se ejecutan las validaciones correspondientes y la calificación se transmite directamente a la actividad asociada en el libro de calificaciones de moodle.

---

## 1. convención de releases en github

cada estudiante debe publicar en la sección de releases de su repositorio el tag correspondiente a cada entrega antes de la fecha límite:

| semana | entregable | tag obligatorio de github | hito del sistema |
| :---: | :---: | :---: | :--- |
| **semana 1** | e1.1 | `v0.1.0-e1.1` | arquitectura base, base de datos y autenticación |
| **semana 1** | e1.2 | `v0.1.0-e1.2` | clientes, administradores, familias olfativas y marcas de perfumes |
| **semana 2** | e2.1 | `v0.2.0-e2.1` | catálogo de fragancias con variantes (botella completa vs decants de 3ml, 5ml, 10ml) (fase 1) |
| **semana 2** | e2.2 | `v0.2.0-e2.2` | catálogo de fragancias con variantes (botella completa vs decants de 3ml, 5ml, 10ml) (fase 2 y contratos transaccionales) |
| **semana 3** | e3.1 | `v0.3.0-e3.1` | carrito de compras con cálculo de stock por mililitros y órdenes de compra |
| **semana 3** | e3.2 | `v0.3.0-e3.2` | carrito de compras con cálculo de stock por mililitros y órdenes de compra (reglas de validación y control de estados) |
| **semana 4** | e4.1 | `v0.4.0-e4.1` | pasarela de pagos simulada, guías de envío y cálculo de mermas |
| **semana 4** | e4.2 | `v1.0.0-final` | versión final: optimización, suite de pruebas y documentación openapi |

---

## 2. desglose semanal y checklist técnico

### semana 1: base arquitectónica, seguridad y entidades fundamentales

#### entregable 1.1: infraestructura base y autenticación segura
* **tag release:** `v0.1.0-e1.1`
* **descripción del hito:** inicialización del servidor backend, configuración de entorno y sistema seguro de sesiones/tokens.
* **checklist técnico:**
  - [ ] estructura de carpetas modular (controladores, servicios, modelos, rutas, middlewares).
  - [ ] archivo `.env.example` con variables requeridas (`PORT`, `DATABASE_URL`, `JWT_SECRET`, etc.).
  - [ ] migraciones iniciales de base de datos para usuarios y roles.
  - [ ] hashing seguro de contraseñas con bcrypt o argon2.
  - [ ] middleware de autenticación jwt y validación de expiración de token.
* **contratos de api a implementar:**
  - `POST /api/v1/auth/register` -> `200 OK` o `201 Created` con token jwt o id de usuario.
  - `POST /api/v1/auth/login` -> `200 OK` o `201 Created`.
  - `GET /api/v1/users/profile` -> `200 OK` (requiere cabecera `Authorization: Bearer <token>`).
* **criterios de evaluación y verificación técnica:**
  * respuesta estricta con código `400 Bad Request` ante payload incompleto o formato de correo inválido.
  * bloqueo de rutas protegidas con código `401 Unauthorized` ante ausencia de token o token manipulado.

#### entregable 1.2: modelado y persistencia de catálogos base
* **tag release:** `v0.1.0-e1.2`
* **descripción del hito:** implementación de las entidades primarias: clientes, administradores, familias olfativas y marcas de perfumes.
* **checklist técnico:**
  - [ ] creación de modelos y tablas relacionadas con claves foráneas e integridad referencial.
  - [ ] endpoints crud para catálogos y perfiles iniciales del sistema.
  - [ ] middleware para validación de permisos por rol de usuario.
* **contratos de api a implementar:**
  - `POST /api/v1/fragrances` -> `200 OK` o `201 Created`.
  - `GET /api/v1/fragrances` -> `200 OK`.
  - `POST /api/v1/fragrances/:id/variants` -> `200 OK` o `204 No Content`.
* **criterios de evaluación y verificación técnica:**
  * verificación de códigos de estado correctos: `201 Created` en inserción y `404 Not Found` si el recurso no existe.
  * protección contra inyecciones sql o no-sql utilizando parámetros tipados u orm/query builder.

---

### semana 2: lógica de negocio principal y transacciones

#### entregable 2.1: motor de operaciones y consultas
* **tag release:** `v0.2.0-e2.1`
* **descripción del hito:** desarrollo de la primera fase de: catálogo de fragancias con variantes (botella completa vs decants de 3ml, 5ml, 10ml).
* **checklist técnico:**
  - [ ] endpoints con filtros dinámicos y paginación estructurada (`page`, `limit`, `sortBy`).
  - [ ] capa de servicio con validaciones de negocio antes de la persistencia.
* **contratos de api a implementar:**
  - `GET /api/v1/catalog/filter?family=oriental&brand=...` -> `200 OK` con arreglo de resultados.
  - `GET /api/v1/fragrances/:id` -> `200 OK` o `201 Created`.
  - `GET /api/v1/resources/search` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * tiempos de respuesta menores a 2 segundos en consultas con filtros.
  * validación de parámetros de consulta; tipos incompatibles deben retornar `422 Unprocessable Entity`.

#### entregable 2.2: procesamiento de transacciones y cálculo de reglas
* **tag release:** `v0.2.0-e2.2`
* **descripción del hito:** culminación de la lógica transaccional: catálogo de fragancias con variantes (botella completa vs decants de 3ml, 5ml, 10ml).
* **checklist técnico:**
  - [ ] manejo de transacciones atómicas (rollback automático en caso de fallo intermedio).
  - [ ] generación de identificadores únicos legibles o folios consecutivos de control.
* **contratos de api a implementar:**
  - `POST /api/v1/cart/items` -> `201 Created` con payload del recurso creado.
  - `GET /api/v1/cart` -> `200 OK`.
  - `DELETE /api/v1/cart/items/:id` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * consistencia estricta en base de datos: ninguna operación fallida debe dejar registros huérfanos.
  * códigos de respuesta conformes al estándar rest (`409 Conflict` ante duplicados o estados incompatibles).

---

### semana 3: integración avanzada, estados y comunicación

#### entregable 3.1: máquina de estados y ciclo de vida de operaciones
* **tag release:** `v0.3.0-e3.1`
* **descripción del hito:** implementación de: carrito de compras con cálculo de stock por mililitros y órdenes de compra.
* **checklist técnico:**
  - [ ] transiciones de estado restringidas (máquina de estados finita).
  - [ ] registro cronológico de cambios de estado y usuario autor.
* **contratos de api a implementar:**
  - `POST /api/v1/checkout/orders` -> `200 OK` o `201 Created`.
  - `GET /api/v1/orders/my-orders` -> `200 OK`.
  - `GET /api/v1/orders/:id` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * retorno de error `409 Conflict` o `400 Bad Request` ante transiciones de estado no permitidas.
  * validación estricta de la identidad del usuario que realiza la acción (`403 Forbidden`).

#### entregable 3.2: servicios complementarios y políticas de privacidad
* **tag release:** `v0.3.0-e3.2`
* **descripción del hito:** módulos de control, balance y notificaciones asociados a: carrito de compras con cálculo de stock por mililitros y órdenes de compra.
* **checklist técnico:**
  - [ ] endpoints para consulta de resúmenes, saldos o historiales vinculados.
  - [ ] filtrado de información sensible según nivel de autorización.
* **contratos de api a implementar:**
  - `POST /api/v1/orders/:id/process-payment` -> `200 OK` o `201 Created`.
  - `PATCH /api/v1/orders/:id/shipping-status` -> `200 OK`.
  - `GET /api/v1/summary/status` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * verificación de políticas de acceso y confidencialidad de datos.
  * sanitización de entradas para prevención de ataques xss o inyecciones de datos.

---

### semana 4: reportería, calidad, optimización y release final 1.0.0

#### entregable 4.1: analítica, reportes y módulo de administración
* **tag release:** `v0.4.0-e4.1`
* **descripción del hito:** cierre de funciones analíticas y administrativas: pasarela de pagos simulada, guías de envío y cálculo de mermas.
* **checklist técnico:**
  - [ ] endpoints con agregaciones y resúmenes estadísticos.
  - [ ] panel o rutas exclusivas para el rol de administrador.
  - [ ] exportación de datos en formato json estructurado o descargable.
* **contratos de api a implementar:**
  - `GET /api/v1/inventory/milliliter-stock` -> `200 OK`.
  - `GET /api/v1/reports/best-selling-decants` -> `200 OK`.
  - `GET /api/v1/admin/dashboard` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * verificación de índices de base de datos para que consultas analíticas complejas no bloqueen el servidor.
  * denegación estricta a usuarios sin rol de administración (`403 Forbidden`).

#### entregable 4.2: suite de pruebas, documentación openapi y release final
* **tag release:** `v1.0.0-final`
* **descripción del hito:** consolidación final de la api, suite de pruebas automatizadas y documentación interactiva.
* **checklist técnico:**
  - [ ] documentación de la api completa mediante openapi / swagger disponible en `/api/docs`.
  - [ ] endpoint de salud de la aplicación (`/api/v1/health`) con estado de conexión a base de datos.
  - [ ] suite de pruebas automatizadas (tests de integración y unitarios) con cobertura mínima del 70%.
  - [ ] publicación del release final `v1.0.0-final` con changelog detallado en github.
* **contratos de api a implementar:**
  - `GET /api/docs` -> `200 OK` (documentación o exportación).
  - `GET /api/v1/health` -> `200 OK` con json `{ status: "ok", timestamp: "..." }`.
  - `GET /api/v1/fragrances/recommendations` -> `200 OK`.
* **criterios de evaluación y verificación técnica:**
  * ejecución de la suite de pruebas sin fallos de aserción (`exit code 0`).
  * concordancia total entre la documentación openapi y el comportamiento real de los endpoints.

---

## 3. tabla de criterios de evaluación automatizada

| rubro de evaluación | peso | mecanismo de verificación |
| :--- | :---: | :--- |
| **cumplimiento de contratos http y esquemas** | 35% | verificación de rutas, métodos, payloads y códigos de estado (200, 201, 400, 401, 403, 404, 422). |
| **seguridad, autenticación y roles** | 25% | pruebas de bloqueo de rutas protegidas y control de acceso basado en roles. |
| **persistencia, integridad y transacciones** | 20% | verificación de relaciones de base de datos, atomicidad y prevención de registros huérfanos. |
| **releases de github y control de versiones** | 20% | existencia del tag exacto en github dentro de los plazos establecidos y notas de versión. |
