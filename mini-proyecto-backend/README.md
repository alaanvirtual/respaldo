# Capítulo 4: Planeación de la Aplicación — PMS Backend

Este proyecto implementa la arquitectura base, diseño relacional de datos y planeación completa para el **Sistema de Gestión de Proyectos (PMS - Project Management System)**, desarrollado en **Node.js, Express, TypeScript, TypeORM y PostgreSQL**, conforme a las especificaciones del **Capítulo 4: Planeación de la Aplicación**.

---

## 📋 Resumen del Capítulo y Objetivos Técnicos

| Sección Oficial | Descripción y Objetivos Técnicos |
| :--- | :--- |
| **1. Introducción & Caso de Estudio** | Adopción de Node.js en infraestructuras de alto rendimiento (Netflix, Uber, PayPal). Presentación del caso de estudio transversal: Sistema de Gestión de Proyectos (PMS). |
| **2. Alcance & Módulos** | Definición de los 4 módulos esenciales: **Users**, **Projects**, **Tasks** y **Comments**, junto con roles y permisos granulares. |
| **3. Diseño Relacional (DER)** | Esquema relacional normalizado en PostgreSQL con 5 entidades: `roles`, `users`, `projects`, `tasks`, y `comments` con relaciones Many-to-One y One-to-Many. |
| **4. Arquitectura de Carpetas** | Adopción del patrón empresarial **'Package by Component'**, agrupando entidades, controladores y rutas por dominio funcional. |
| **5. Servidor con Módulo Cluster** | Aprovechamiento de todos los núcleos de CPU del host mediante `cluster.fork()` y mecanismo de apagado seguro (**Graceful Shutdown**) ante `SIGINT` y `SIGTERM`. |
| **6. Modelos TypeORM & Pool** | Mapeo objeto-relacional (ORM) con decoradores de TypeScript (`@Entity`, `@PrimaryGeneratedColumn`, `@Column`, `@ManyToOne`, `@JoinColumn`), y pool de conexiones vía `DataSource`. |
| **7. Enrutamiento Modular** | Desacoplamiento de rutas por componente (`/api/roles`, `/api/users`, `/api/projects`, `/api/tasks`, `/api/comments`) y agregador centralizado en `src/routes/index.ts`. |

---

## 📁 Estructura del Proyecto ('Package by Component')

```text
pms-backend/
├── dist/                          # Código TypeScript compilado a JavaScript (tsc)
├── src/
│   ├── components/                # Módulos organizados por componentes
│   │   ├── roles/
│   │   │   ├── roles_entity.ts    # [Entidad TypeORM] Tabla 'roles' (UUID, name, rights, etc.)
│   │   │   ├── roles_controller.ts# [Controlador Express] Handlers CRUD (Capítulo 5)
│   │   │   └── roles_routes.ts    # [Rutas] Endpoints /api/roles y /api/roles/:id
│   │   ├── users/
│   │   │   ├── users_entity.ts    # [Entidad TypeORM] Tabla 'users' (ManyToOne con Roles)
│   │   │   ├── users_controller.ts# [Controlador Express] Handlers de usuarios
│   │   │   └── users_routes.ts    # [Rutas] Endpoints /api/users y /api/users/:id
│   │   ├── projects/
│   │   │   ├── projects_entity.ts # [Entidad TypeORM] Tabla 'projects' (UUID, user_ids, fechas)
│   │   │   ├── project_controller.ts# [Controlador Express] Handlers de proyectos
│   │   │   └── projects_routes.ts # [Rutas] Endpoints /api/projects y /api/projects/:id
│   │   ├── tasks/
│   │   │   ├── tasks_entity.ts    # [Entidad TypeORM] Tabla 'tasks' (Enums Status, Priority)
│   │   │   ├── tasks_controller.ts# [Controlador Express] Handlers de tareas
│   │   │   └── tasks_routes.ts    # [Rutas] Endpoints /api/tasks y /api/tasks/:id
│   │   └── comments/
│   │       ├── comments_entity.ts # [Entidad TypeORM] Tabla 'comments' (ManyToOne con Tasks y Users)
│   │       ├── comments_controller.ts# [Controlador Express] Handlers de comentarios
│   │       └── comments_routes.ts # [Rutas] Endpoints /api/comments y /api/comments/:id
│   ├── routes/
│   │   └── index.ts               # Agregador centralizado de todas las clases de rutas
│   ├── utils/
│   │   ├── config.ts              # Interfaz de configuración del servidor (IServerConfig)
│   │   └── db.ts                  # Inicialización y DataSource de TypeORM
│   ├── express_server.ts          # Configuración del servidor Express e integración de rutas
│   ├── express_server_standalone.ts # Launcher en proceso individual para pruebas directas
│   └── main.ts                    # Punto de entrada principal con cluster multihilo
├── test/
│   └── test-pms.js                # Suite de pruebas automatizadas de endpoints
├── .env                           # Variables de entorno locales
├── .gitignore                     # Exclusión de artefactos de compilación y node_modules
├── package.json                   # Manifiesto del proyecto y scripts npm
├── server_config.json             # Parámetros de puerto y base de datos PostgreSQL
└── tsconfig.json                  # Configuración de compilador TypeScript con decoradores
```

---

## 🗄️ Esquema Relacional de la Base de Datos

### 1. `roles`
* `role_id`: UUID (PK)
* `name`: varchar(60), Unique, Not Null
* `description`: varchar(200), Nullable
* `rights`: text, Not Null (JSON/Texto con permisos granulares)
* `created_at` / `updated_at`: timestamps

### 2. `users`
* `user_id`: UUID (PK)
* `fullname`: varchar(50), Nullable
* `username`: varchar(30), Unique, Not Null
* `email`: varchar(60), Unique, Not Null
* `password`: varchar, Not Null (Hash encriptado)
* `role_id`: Foreign Key Many-to-One hacia `roles.role_id`
* `created_at` / `updated_at`: timestamps

### 3. `projects`
* `project_id`: UUID (PK)
* `name`: varchar(30), Unique, Not Null
* `description`: varchar(500), Nullable
* `user_ids`: text[] / uuid[] (Array de miembros asignados)
* `start_time` / `end_time`: timestamps
* `created_at` / `updated_at`: timestamps

### 4. `tasks`
* `task_id`: UUID (PK)
* `name`: varchar(30), Unique, Not Null
* `description`: varchar(500), Nullable
* `project_id`: Foreign Key Many-to-One hacia `projects.project_id`
* `user_id`: Foreign Key Many-to-One hacia `users.user_id`
* `estimated_start_time` / `estimated_end_time`
* `actual_start_time` / `actual_end_time`
* `priority`: Enum (`Low`, `Medium`, `High`)
* `status`: Enum (`Not-Started`, `In-Progress`, `Completed`)
* `supported_files`: text, Nullable
* `created_at` / `updated_at`: timestamps

### 5. `comments`
* `comment_id`: UUID (PK)
* `comment`: text, Not Null
* `task_id`: Foreign Key Many-to-One hacia `tasks.task_id`
* `user_id`: Foreign Key Many-to-One hacia `users.user_id`
* `supported_files`: text, Nullable
* `created_at` / `updated_at`: timestamps

---

## 🛠️ Comandos de Instalación y Compilación

1. **Instalar dependencias del proyecto:**
   ```bash
   cd pms-backend
   npm install
   ```

2. **Compilar código TypeScript:**
   ```bash
   npm run build
   ```

---

## 🚀 Guía de Ejecución

### 1. Ejecución con Módulo Cluster (Sección 5.4)
Aprovecha todos los núcleos de la CPU creando procesos trabajadores (*workers*) mediante `cluster.fork()`:

```bash
# Modo desarrollo con recarga en caliente:
npm run dev

# Modo producción (utiliza dist/):
npm start
```

Salida esperada en consola:
```text
Master process 16840 is running. Forking for 4 CPUs...
Router : RoleRoutes - Connected
Router : UserRoutes - Connected
Router : ProjectRoutes - Connected
Router : TaskRoutes - Connected
Router : CommentRoutes - Connected
Server Routes started for server
Server is running on port 3000 with pid = 16847
Connected to the database with all entities synchronized
```

### 2. Ejecución en Proceso Único (Desarrollo & Pruebas)
Ideal para depuración rápida sin bifurcación de múltiples hilos:

```bash
npm run dev:single
```

---

## 🧪 Pruebas Automatizadas

Se incluye un script de validación que inicia el servidor, consulta los endpoints base y verifica el comportamiento HTTP:

```bash
npm test
```

Verifica:
* `GET /ping` → `pong`
* `GET` y `POST` `/api/roles`
* `GET` `/api/users`
* `GET` `/api/projects`
* `GET` `/api/tasks` y `PUT /api/tasks/:id`
* `GET` `/api/comments`
