# Especificación de Requisitos de Software (SRS)

**Proyecto:** BL FRAGANCIAS — Sistema Backend de Comercio Electrónico y Control de Inventario de Perfumería Fina  
**Institución:** Universidad Autónoma de Sinaloa — Facultad de Ingeniería Mochis  
**Programa Educativo:** Licenciatura en Ingeniería de Software (7.º Semestre)  
**Materia:** Desarrollo Backend de Aplicaciones  
**Titular de la Asignatura:** Dr. Herman Geovany Ayala Zúñiga  
**Estudiante:** Alan Abraham Peña Nava  
**Matrícula:** 23122668  
**Fecha de Emisión:** Octubre 2026  
**Versión:** 1.1.0  

---

## 1. Introducción y Alcance

### 1.1. Propósito
El presente documento define la especificación formal de los **Requisitos Funcionales (RF)** y **Requisitos No Funcionales (RNF)** para el sistema backend de **BL FRAGANCIAS**, una plataforma especializada en la comercialización, gestión de pedidos y administración precisa de inventario de perfumería fina de alta gama.

### 1.2. Alcance del Sistema
El sistema backend provee una interfaz de programación de aplicaciones (API RESTful) y un canal de comunicación bidireccional en tiempo real (WebSockets). Está construido bajo los fundamentos de **Clean Architecture (Arquitectura Limpia)**, **Domain-Driven Design (DDD)** y tipado estricto con TypeScript, garantizando alta cohesión, bajo acoplamiento e independencia tecnológica entre reglas de negocio, casos de uso, persistencia e interfaces de transporte.

---

## 2. Requisitos Funcionales (RF)

Los requisitos funcionales detallan el comportamiento, las reglas de negocio y los servicios que el backend suministra a los clientes del sistema.

### Módulo 1: Catálogo e Inventario de Perfumería Fina

* **RF-01: Registro de Fragancias en Catálogo**
  * **Descripción:** El sistema debe permitir el alta de nuevos perfumes en el catálogo maestro.
  * **Datos requeridos:** Nombre (`name`), marca o casa perfumista (`brand`), concentración (`concentration`: 'EDT', 'EDP', 'Parfum', 'Extrait'), tamaño en mililitros (`sizeMl`), precio unitario (`price`) y unidades en inventario (`stock`).
  * **Reglas de Negocio:** No se permite registrar una fragancia con la misma combinación de nombre y marca de forma duplicada. El precio debe ser un número positivo mayor a 0, el tamaño mayor a 0 ml y el stock un entero no negativo (>= 0).
  * **Capa:** Dominio (`Perfume.ts`) / Aplicación (`CreatePerfumeUseCase.ts`) / Presentación (`POST /api/perfumes`).

* **RF-02: Consulta, Búsqueda Parametrizada y Paginación de Fragancias**
  * **Descripción:** El sistema debe suministrar la lista de fragancias disponibles, permitiendo filtros concurrentes, ordenamiento y paginación para mitigar sobrecarga en transferencias masivas.
  * **Parámetros de filtrado:** Marca (`brand`), concentración (`concentration`), rango de precios (`minPrice`, `maxPrice`) y disponibilidad (`inStockOnly`).
  * **Paginación y Ordenamiento:** Parámetros `page` (número de página, por defecto 1), `limit` (elementos por página, por defecto 10), `sortBy` (`price`, `name`, `createdAt`) y `order` (`asc`, `desc`).
  * **Capa:** Aplicación (`ListPerfumesUseCase.ts`) / Presentación (`GET /api/perfumes`).

* **RF-03: Consulta Detallada de Fragancia por Identificador**
  * **Descripción:** El sistema debe retornar la información completa de una fragancia a partir de su ID único (`id`).
  * **Reglas de Negocio:** Si el identificador no existe en el catálogo, el sistema debe emitir un error semántico `404 Not Found`.
  * **Capa:** Aplicación (`GetPerfumeByIdUseCase.ts`) / Presentación (`GET /api/perfumes/:id`).

* **RF-04: Deducción Transaccional de Existencias (Control de Stock)**
  * **Descripción:** El sistema debe decrementar de manera controlada y atómica el inventario de una fragancia específica tras una venta o ajuste.
  * **Reglas de Negocio (Invariante de Dominio):** La cantidad a deducir debe ser un entero positivo mayor a cero. Si la cantidad solicitada excede las existencias disponibles (`stock < quantity`), la entidad de dominio debe abortar la operación lanzando `InsufficientStockError`, traduciéndose en una respuesta HTTP `409 Conflict`.
  * **Capa:** Dominio (`Perfume.deductStock`) / Aplicación (`DeductStockUseCase.ts`) / Presentación (`POST /api/perfumes/:id/deduct-stock`).

* **RF-05: Reabastecimiento de Existencias (Ingreso a Inventario)**
  * **Descripción:** El sistema debe permitir el incremento de existencias de un perfume derivado de recepciones de lote o compras a proveedores.
  * **Reglas de Negocio:** La cantidad a ingresar debe ser un entero estrictamente positivo (> 0).
  * **Capa:** Dominio (`Perfume.addStock`).

* **RF-06: Actualización de Precios Comerciales**
  * **Descripción:** El sistema debe permitir la actualización del precio unitario de venta de cualquier fragancia.
  * **Reglas de Negocio:** El nuevo precio debe ser estrictamente superior a cero y registrar automáticamente la marca temporal de actualización (`updatedAt`).
  * **Capa:** Dominio (`Perfume.updatePrice`).

* **RF-07: Eliminación y Depuración de Fragancias**
  * **Descripción:** El sistema debe permitir la baja física o lógica de una fragancia del inventario mediante su identificador único.
  * **Capa:** Infraestructura (`IPerfumeRepository.delete`).

* **RF-08: Kardex y Trazabilidad Histórica de Movimientos de Inventario**
  * **Descripción:** El sistema debe registrar un historial inmutable de auditoría para cada afectación de stock realizada sobre una fragancia.
  * **Datos requeridos:** Identificador de movimiento, identificador de fragancia (`perfumeId`), tipo de movimiento (`VENTA`, `REABASTECIMIENTO`, `MERMA`, `AJUSTE`), cantidad involucrada, existencias resultantes, marca temporal y usuario responsable.
  * **Capa:** Dominio (`InventoryMovement`) / Infraestructura (Persistencia).

* **RF-09: Monitoreo y Alerta Proactiva de Stock Mínimo**
  * **Descripción:** El sistema debe evaluar de forma reactiva las existencias tras cada deducción de inventario, detectando cuando el nivel caiga por debajo o igual al umbral crítico configurado (ej. $\le 5$ unidades).
  * **Reglas de Negocio:** Al alcanzarse el umbral de agotamiento, se debe disparar automáticamente un evento de advertencia en tiempo real (`LOW_STOCK_WARNING`) para notificar a los operadores del almacén.
  * **Capa:** Dominio (`Perfume`) / Presentación (`WebSocketServer`).

---

### Módulo 2: Gestión de Usuarios, Autenticación y Seguridad de Accesos

* **RF-10: Registro de Usuarios en Plataforma**
  * **Descripción:** El sistema debe registrar usuarios asignándoles un identificador único, nombre completo, nombre de usuario, correo electrónico, rol y credencial protegida.
  * **Reglas de Negocio:** El correo electrónico y el nombre de usuario deben ser únicos en el sistema. El correo debe cumplir con el estándar RFC 5322. La contraseña debe recibirse en texto plano para ser sometida a un algoritmo de hashing criptográfico unidireccional antes de su almacenamiento.
  * **Capa:** Dominio (`User.ts`) / Infraestructura (`PasswordHasher.ts`) / Aplicación (`CreateUserUseCase.ts`) / Presentación (`POST /api/users`).

* **RF-11: Autenticación de Usuarios e Inicio de Sesión (Login JWT)**
  * **Descripción:** El sistema debe permitir a los usuarios autenticarse proporcionando su identificador (correo electrónico o nombre de usuario) y contraseña en texto claro.
  * **Reglas de Negocio:**
    - El sistema verifica la existencia del usuario y compara la contraseña contra el hash almacenado mediante `PasswordHasher.compare()`.
    - En caso de coincidencia exitosa, genera y responde con un token de acceso firmado en formato JWT (`accessToken`) que encapsula la identidad y rol del usuario, con expiración programada.
    - Si las credenciales no coinciden o el usuario no existe, responde con código semántico `401 Unauthorized` con mensaje genérico para evitar divulgación de información.
  * **Capa:** Infraestructura (`JwtService.ts`, `PasswordHasher.ts`) / Aplicación (`LoginUseCase.ts`) / Presentación (`POST /api/auth/login`).

* **RF-12: Autorización y Control de Acceso Basado en Roles (RBAC)**
  * **Descripción:** El sistema debe restringir el acceso a los recursos protegidos validando la validez del token JWT y el rol del usuario autenticado a través de middlewares interceptores.
  * **Reglas de Negocio:**
    - Operaciones administrativas (crear perfume, actualizar precio, reabastecer stock, eliminar fragancias o eliminar usuarios) requieren de forma mandatoria el rol `'Admin'`.
    - Operaciones de cliente (consultar catálogo, actualizar su propio perfil, crear pedidos) son accesibles para el rol `'Customer'`.
    - Un intento de acceso sin token o con token expirado/malformado debe rechazar la solicitud con `401 Unauthorized`.
    - Un usuario autenticado con permisos insuficientes para la ruta invocada debe ser denegado con `403 Forbidden`.
  * **Capa:** Presentación (`authMiddleware.ts`, `roleMiddleware.ts`).

* **RF-13: Consulta y Búsqueda de Usuarios**
  * **Descripción:** El sistema debe permitir la obtención del listado de usuarios y la búsqueda individual por identificador único (`id`), correo electrónico (`email`) o nombre de usuario (`username`).
  * **Capa:** Aplicación (`ListUsersUseCase.ts`, `GetUserByIdUseCase.ts`) / Presentación (`GET /api/users`, `GET /api/users/:id`).

* **RF-14: Actualización de Perfil de Usuario**
  * **Descripción:** El sistema debe permitir la modificación de los datos de contacto del usuario (nombre completo y correo electrónico).
  * **Reglas de Negocio:** Valida la estructura válida del nuevo correo y la no vacuidad del nombre.
  * **Capa:** Dominio (`User.updateProfile`) / Aplicación (`UpdateUserUseCase.ts`) / Presentación (`PUT /api/users/:id`).

* **RF-15: Asignación y Control de Roles de Usuario**
  * **Descripción:** El sistema debe restringir los roles a valores definidos: `'Admin'` o `'Customer'`.
  * **Reglas de Negocio:** Cualquier intento de asignar un rol ajeno a la enumeración debe ser rechazado en la capa de dominio arrojando `InvalidUserDataError`.
  * **Capa:** Dominio (`User.changeRole`).

* **RF-16: Eliminación de Cuentas de Usuario**
  * **Descripción:** El sistema debe permitir la baja de un registro de usuario a través de su identificador.
  * **Capa:** Aplicación (`DeleteUserUseCase.ts`) / Presentación (`DELETE /api/users/:id`).

---

### Módulo 3: Procesamiento de Pedidos y Ventas (E-Commerce)

* **RF-17: Creación de Órdenes de Compra con Cálculo de Importes**
  * **Descripción:** El sistema debe permitir la generación de una orden de compra vinculada a un cliente (`customerId`) conteniendo una o múltiples líneas de detalle (`items`).
  * **Reglas de Negocio:** Cada línea de ítem debe contener `perfumeId`, `quantity` (> 0) y `unitPrice` (> 0). El sistema calcula automáticamente el subtotal por ítem y la sumatoria total de la orden (`totalAmount`) con redondeo bancario a 2 decimales.
  * **Capa:** Dominio (`Order.create`).

* **RF-18: Máquina de Estados Finitos de Pedidos**
  * **Descripción:** El sistema debe gobernar el ciclo de vida de una orden mediante transiciones de estado estrictas y secuenciales:
    $$\text{PENDING} \longrightarrow \text{PAID} \longrightarrow \text{SHIPPED} \longrightarrow \text{DELIVERED}$$
  * **Reglas de Negocio:**
    - Una orden solo puede marcarse como pagada (`markAsPaid`) si su estado actual es `PENDING`.
    - Una orden solo puede marcarse como enviada (`ship`) si su estado actual es `PAID`.
    - Una orden solo puede marcarse como entregada (`deliver`) si su estado actual es `SHIPPED`.
    - Cualquier transición fuera de secuencia debe ser abortada arrojando `InvalidOrderOperationError`.
  * **Capa:** Dominio (`Order.ts`).

* **RF-19: Cancelación de Órdenes y Restitución Automatizada de Inventario**
  * **Descripción:** El sistema debe permitir la cancelación de una orden antes de su despacho (`PENDING` o `PAID`).
  * **Reglas de Negocio:**
    - El estado de la orden transita a `CANCELLED`.
    - Si la orden ya había reservado o deducido stock comercial, el sistema debe reintegrar automáticamente las unidades correspondientes a cada perfume en el catálogo invocando `Perfume.addStock()`.
    - No se permite cancelar órdenes que ya hayan alcanzado los estados `SHIPPED` o `DELIVERED`.
  * **Capa:** Dominio (`Order.cancel`) / Aplicación (`CancelOrderUseCase.ts`).

---

### Módulo 4: Notificaciones y Monitoreo del Sistema

* **RF-20: Emisión de Notificaciones en Tiempo Real (WebSockets)**
  * **Descripción:** El sistema debe emitir eventos estructurados a través del canal WebSocket `/ws` para mantener sincronizados a los clientes conectados.
  * **Eventos obligatorios:**
    - `SYSTEM_CONNECTED`: Emite mensaje de bienvenida al establecerse el handshake.
    - `PERFUME_CREATED`: Emite la carga útil de la nueva fragancia registrada.
    - `PERFUME_STOCK_DEDUCTED`: Emite el identificador del producto, la cantidad descontada y las existencias remanentes.
    - `LOW_STOCK_WARNING`: Emite aviso de inventario crítico cuando el stock remanente sea menor o igual al umbral fijado.
    - `ORDER_STATUS_CHANGED`: Emite la transición de estado de una orden hacia el cliente suscriptor.
  * **Capa:** Presentación (`WebSocketServer.ts`, `PerfumeController.ts`).

* **RF-21: Verificación de Salud Operacional (Health Check)**
  * **Descripción:** El sistema debe exponer un endpoint público accesible que informe el estado de operatividad del backend.
  * **Respuesta obligatoria:** Objeto JSON con `{ status: "success", system: "BL FRAGANCIAS API", timestamp, uptimeSeconds, environment }`.
  * **Capa:** Presentación (`health.routes.ts`, `GET /api/health`).

---

## 3. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen los atributos de calidad, restricciones arquitectónicas, desempeño, seguridad y estándares de ingeniería aplicados.

### RNF-01: Arquitectura de Software y Desacoplamiento (Clean Architecture)
* **Categoría:** Mantenibilidad y Modularidad (ISO/IEC 25010).
* **Especificación:** El sistema debe organizar estrictamente su código en 4 capas concéntricas (`src/domain`, `src/application`, `src/infrastructure`, `src/presentation`).
* **Criterio de Aceptación:** La capa de Dominio debe mantener una pureza de cero dependencias externas; queda prohibido cualquier importación proveniente de Express, TypeORM u otras bibliotecas de infraestructura en `src/domain/`. La capa de Aplicación solo debe comunicarse con la infraestructura mediante Inversión de Dependencias (interfaces abstractas).

### RNF-02: Calidad de Tipado Estricto (TypeScript Strictness)
* **Categoría:** Fiabilidad y Robustez.
* **Especificación:** El proyecto debe compilarse bajo TypeScript con los modificadores más rigurosos activados: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUnusedLocals: true`, `noUnusedParameters: true` y `noImplicitReturns: true`.
* **Criterio de Aceptación:** La ejecución del comando `npx tsc --noEmit` debe finalizar con código de salida `0` y cero advertencias o tipos `any` injustificados.

### RNF-03: Seguridad Perimetral y Cabeceras HTTP
* **Categoría:** Seguridad.
* **Especificación:** El servidor HTTP debe implementar la suite **Helmet** para configurar defensas contra vectores de ataque web comunes.
* **Criterio de Aceptación:** Cada respuesta HTTP debe incluir cabeceras de protección: `X-Content-Type-Options: nosniff`, `Strict-Transport-Security` (HSTS), `X-Frame-Options: SAMEORIGIN` y supresión de la cabecera delatórica `X-Powered-By`.

### RNF-04: Control de Acceso y Política de Orígenes (CORS)
* **Categoría:** Seguridad e Interoperabilidad.
* **Especificación:** El sistema debe integrar un middleware perimetral para el control de recursos de origen cruzado (**Cross-Origin Resource Sharing**), permitiendo métodos HTTP estándar (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`).

### RNF-05: Validación Perimetral Estricta (Zod Schema Validation)
* **Categoría:** Fiabilidad y Tolerancia a Fallos.
* **Especificación:** Todas las entradas que crucen el perímetro de la API (cuerpo de la petición `req.body`, parámetros de ruta `req.params` y cadenas de consulta `req.query`) deben ser convalidadas mediante esquemas declarativos en **Zod** antes de ser despachadas a los casos de uso.
* **Criterio de Aceptación:** Si los datos no satisfacen el esquema, la petición es interceptada retornando código HTTP `400 Bad Request` con un arreglo normalizado de errores de validación sin comprometer la estabilidad del proceso.

### RNF-06: Manejo Centralizado de Errores y Semántica HTTP
* **Categoría:** Mantenibilidad y Seguridad.
* **Especificación:** Todo fallo en el sistema debe canalizarse a través de un middleware de captura global de errores (`errorHandler.ts`) que mapee excepciones a códigos HTTP estándar mediante la clase base `AppError`.
* **Criterio de Aceptación:**
  - `400 Bad Request`: Errores de sintaxis o fallos de validación Zod.
  - `401 Unauthorized`: Ausencia o invalidez de credenciales de autenticación.
  - `403 Forbidden`: Privilegios insuficientes para el recurso invocado.
  - `404 Not Found`: Rutas no registradas o recursos inexistentes.
  - `409 Conflict`: Violaciones de reglas de negocio o falta de existencias (`InsufficientStockError`).
  - `429 Too Many Requests`: Exceso de peticiones en ventanas de tasa restringida.
  - `500 Internal Server Error`: Excepciones no controladas.
  - En entorno de producción (`NODE_ENV=production`), los volcados de pila (*stack traces*) no deben ser expuestos al cliente.

### RNF-07: Seguridad Criptográfica y Autenticación Stateless
* **Categoría:** Confidencialidad e Integridad.
* **Especificación:**
  - **Hashing de Contraseñas:** El almacenamiento de contraseñas debe realizarse mediante **Bcrypt** con un factor de trabajo (*cost factor*) no menor a 10 rondas de salt, garantizando resistencia ante ataques de fuerza bruta y tablas arcoíris.
  - **Autenticación Stateless:** La emisión de credenciales de sesión debe basarse en tokens **JWT (JSON Web Tokens)** firmados con algoritmos criptográficos robustos (HMAC-SHA256) y expiración configurable.

### RNF-08: Rendimiento y Optimización de Transporte (Compresión)
* **Categoría:** Eficiencia de Desempeño.
* **Especificación:** Las respuestas salientes del servidor deben ser procesadas por un middleware de compresión (**Gzip / Deflate**) para optimizar el tamaño de los paquetes transferidos a través de la red y disminuir la latencia percibida por el cliente.

### RNF-09: Rendimiento de Acceso a Datos mediante Caché (Patrón Cache-Aside)
* **Categoría:** Eficiencia de Desempeño y Escalabilidad.
* **Especificación:** El sistema debe suministrar una capa de aceleración de lecturas estructurada bajo el patrón de diseño **Cache-Aside** con tiempos de vida útiles (**TTL - Time-To-Live**) definibles, mitigando la contención sobre el almacenamiento persistente.

### RNF-10: Observabilidad y Trazabilidad (Logging Estructurado Winston)
* **Categoría:** Operabilidad y Facilidad de Diagnóstico.
* **Especificación:** Todo evento relevante del ciclo de vida del servidor y de las transacciones HTTP debe ser registrado por una instancia de **Winston**.
* **Criterio de Aceptación:** Los registros deben incluir nivel de severidad (`debug`, `info`, `warn`, `error`), marca temporal en formato ISO 8601 (`YYYY-MM-DD HH:mm:ss`), metadatos contextuales y diferenciación de formato (legible para desarrollador en entorno local y JSON estandarizado en entornos de staging/producción).

### RNF-11: Comunicación Asíncrona en Tiempo Real de Baja Latencia
* **Categoría:** Eficiencia y Usabilidad Técnica.
* **Especificación:** La infraestructura debe soportar conexiones persistentes full-duplex vía **WebSockets** (`ws`) operando sobre el mismo puerto que el servidor HTTP (`/ws`), permitiendo multidifusión reactiva (*broadcast*) con mínima sobrecarga computacional.

### RNF-12: Verificabilidad y Pruebas Automatizadas (Unit & Integration Testing)
* **Categoría:** Confiabilidad y Mantenibilidad.
* **Especificación:** El sistema debe disponer de una batería de pruebas automatizadas ejecutable mediante **Jest** y `ts-jest`.
* **Criterio de Aceptación:** Las pruebas unitarias deben validar el 100% de las invariantes de las entidades de dominio y las pruebas de integración deben certificar los endpoints principales de la API, completando la suite con 0 fallas (`PASS`).

### RNF-13: Limitación de Tasa de Peticiones y Mitigación de Fuerza Bruta (Rate Limiting)
* **Categoría:** Seguridad y Resiliencia.
* **Especificación:** La API debe restringir ráfagas y abusos mediante limitadores de tráfico basados en ventanas de tiempo.
* **Criterio de Aceptación:** Límite global de 100 peticiones por ventana de 15 minutos por IP para rutas convencionales, y una política estricta de máximo 5 intentos erróneos por minuto en rutas de autenticación (`/api/auth/login`), respondiendo con código HTTP `429 Too Many Requests`.

### RNF-14: Contenedorización y Orquestación Multi-Servicio (Docker & Docker Compose)
* **Categoría:** Portabilidad y Despliegue.
* **Especificación:** El sistema backend y sus componentes de soporte (base de datos relacional PostgreSQL y motor en memoria Redis) deben estar completamente orquestados y encapsulados mediante contenedores.
* **Criterio de Aceptación:** Disponer de un `Dockerfile` multi-stage optimizado para producción y un archivo `docker-compose.yml` que permita levantar la infraestructura completa de manera reproducible con variables de entorno centralizadas.

### RNF-15: Documentación Interactiva y Contratos de Interfaz (OpenAPI 3.0 / Swagger)
* **Categoría:** Usabilidad y Mantenibilidad Técnica.
* **Especificación:** Los contratos de interfaz de la API deben documentarse bajo el estándar formal OpenAPI 3.0, exponiendo una consola interactiva en `/api/docs`.
* **Criterio de Aceptación:** Cada endpoint debe exhibir sus métodos, parámetros, esquemas Zod de carga útil (`body`), códigos de retorno HTTP y esquemas de respuesta JSON.

### RNF-16: Control de Calidad en Repositorio y Git Hooks (Husky, Lint-Staged y Commitlint)
* **Categoría:** Calidad de Ingeniería de Software.
* **Especificación:** El repositorio de código fuente debe automatizar el aseguramiento de calidad antes de registrar cambios en el árbol de Git.
* **Criterio de Aceptación:** Configuración de hooks pre-commit (`husky` y `lint-staged`) para formateo y linter obligatorio (`prettier`, `eslint`), y validación estricta del estándar Conventional Commits (`commitlint`) en el hook commit-msg.
