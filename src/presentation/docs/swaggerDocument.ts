export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BL FRAGANCIAS API — Plataforma de Perfumería Fina e Inventario',
    version: '2.2.0',
    description:
      'Documentación técnica interactiva oficial del sistema backend de **BL FRAGANCIAS**.\n\nConstruido bajo **Clean Architecture**, **TypeScript estricto**, validación perimetral con **Zod**, logging estructurado con **Winston** e hipermedios navegables **HATEOAS**.',
    contact: {
      name: 'Alan Abraham Peña Nava (23122668)',
      email: 'alanmasterpro25@gmail.com',
    },
    license: {
      name: 'UAS — Licenciatura en Ingeniería de Software (7.º Semestre)',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Entorno de Desarrollo Local / AWS EC2',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Diagnóstico operacional y verificación de estado del backend',
    },
    {
      name: 'Perfumes',
      description:
        'Gestión del catálogo maestro, búsqueda parametrizada y deducción de existencias',
    },
    {
      name: 'Users',
      description: 'Administración de usuarios, control de perfiles y roles (RBAC)',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT obtenido tras iniciar sesión. Formato: `Bearer <token>`',
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          system: { type: 'string', example: 'BL FRAGANCIAS API' },
          timestamp: { type: 'string', format: 'date-time', example: '2026-10-23T15:00:00.000Z' },
          uptimeSeconds: { type: 'number', example: 124.5 },
          environment: { type: 'string', example: 'development' },
        },
      },
      ConcentrationEnum: {
        type: 'string',
        enum: ['EDT', 'EDP', 'Parfum', 'Extrait'],
        example: 'EDP',
      },
      RoleEnum: {
        type: 'string',
        enum: ['Admin', 'Customer'],
        example: 'Admin',
      },
      Perfume: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'prf_8a1f4b3c9d2e7' },
          name: { type: 'string', example: 'Layton' },
          brand: { type: 'string', example: 'Parfums de Marly' },
          concentration: { $ref: '#/components/schemas/ConcentrationEnum' },
          sizeMl: { type: 'integer', example: 125 },
          price: { type: 'number', format: 'float', example: 6800.0 },
          stock: { type: 'integer', example: 15 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-20T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-20T10:00:00.000Z' },
        },
      },
      CreatePerfumeRequest: {
        type: 'object',
        required: ['name', 'brand', 'concentration', 'sizeMl', 'price', 'stock'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Aventus' },
          brand: { type: 'string', minLength: 2, maxLength: 80, example: 'Creed' },
          concentration: { $ref: '#/components/schemas/ConcentrationEnum' },
          sizeMl: { type: 'integer', minimum: 1, example: 100 },
          price: { type: 'number', minimum: 0.01, example: 8500.0 },
          stock: { type: 'integer', minimum: 0, example: 20 },
        },
      },
      DeductStockRequest: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1, example: 2 },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_5i46rd1w2mw0zo50n' },
          fullname: { type: 'string', example: 'Alan Abraham Peña Nava' },
          username: { type: 'string', example: 'alanmasterpro' },
          email: { type: 'string', format: 'email', example: 'alanmasterpro25@gmail.com' },
          role: { $ref: '#/components/schemas/RoleEnum' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-10-20T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-10-20T10:00:00.000Z' },
        },
      },
      CreateUserRequest: {
        type: 'object',
        required: ['fullname', 'username', 'email', 'password', 'role'],
        properties: {
          fullname: {
            type: 'string',
            minLength: 3,
            maxLength: 80,
            example: 'Alan Abraham Peña Nava',
          },
          username: { type: 'string', minLength: 3, maxLength: 30, example: 'alanmasterpro' },
          email: { type: 'string', format: 'email', example: 'alanmasterpro25@gmail.com' },
          password: { type: 'string', minLength: 8, example: 'PasswordSeguro2026!' },
          role: { $ref: '#/components/schemas/RoleEnum' },
        },
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          fullname: {
            type: 'string',
            minLength: 3,
            maxLength: 80,
            example: 'Alan Peña Actualizado',
          },
          email: { type: 'string', format: 'email', example: 'alan.nuevo@blfragancias.com' },
        },
      },
      HateoasLink: {
        type: 'object',
        properties: {
          href: { type: 'string', example: '/api/perfumes/prf_8a1f4b3c9d2e7' },
          method: { type: 'string', example: 'GET' },
          description: { type: 'string', example: 'Consulta individual de este recurso' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Fallo en la validación de la solicitud' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'price' },
                message: { type: 'string', example: 'El precio debe ser mayor a 0' },
                code: { type: 'string', example: 'too_small' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificación de salud operacional del backend',
        description:
          'Retorna el estado de disponibilidad del servidor, tiempo de actividad y entorno de ejecución.',
        responses: {
          '200': {
            description: 'Servicio operando normalmente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/perfumes': {
      get: {
        tags: ['Perfumes'],
        summary: 'Consultar catálogo con filtros concurrentes y soporte HATEOAS',
        description:
          'Obtiene la lista de fragancias disponibles con filtrado por marca, concentración, rango de precios y existencias.',
        parameters: [
          {
            name: 'brand',
            in: 'query',
            description: 'Filtrar por marca o casa de perfumería',
            schema: { type: 'string' },
            example: 'Creed',
          },
          {
            name: 'concentration',
            in: 'query',
            description: 'Filtrar por concentración aromática',
            schema: { $ref: '#/components/schemas/ConcentrationEnum' },
          },
          {
            name: 'minPrice',
            in: 'query',
            description: 'Precio mínimo de búsqueda',
            schema: { type: 'number' },
            example: 1000,
          },
          {
            name: 'maxPrice',
            in: 'query',
            description: 'Precio máximo de búsqueda',
            schema: { type: 'number' },
            example: 9000,
          },
          {
            name: 'inStockOnly',
            in: 'query',
            description: 'Filtrar únicamente productos con existencias disponibles',
            schema: { type: 'boolean' },
            example: true,
          },
        ],
        responses: {
          '200': {
            description: 'Catálogo de fragancias recuperado exitosamente con hipermedios HATEOAS',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer', example: 1 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Perfume' },
                    },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Perfumes'],
        summary: 'Registrar una nueva fragancia en el catálogo maestro',
        description:
          'Da de alta un perfume con validación perimetral Zod estricta y emite evento reactivo WebSockets.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePerfumeRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Fragancia registrada exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Perfume' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Fallo en la validación perimetral de datos (ZodError)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/perfumes/{id}': {
      get: {
        tags: ['Perfumes'],
        summary: 'Obtener detalle completo de una fragancia por su identificador',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único del perfume',
            schema: { type: 'string' },
            example: 'prf_8a1f4b3c9d2e7',
          },
        ],
        responses: {
          '200': {
            description: 'Detalle de la fragancia con enlaces HATEOAS',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Perfume' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Fragancia no encontrada en el inventario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/perfumes/{id}/deduct-stock': {
      post: {
        tags: ['Perfumes'],
        summary: 'Deducir stock transaccional con control de invariante de dominio',
        description:
          'Reduce la cantidad disponible de un perfume. Si la cantidad solicitada excede las existencias, aborta con HTTP 409 Conflict.',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador del perfume a descontar',
            schema: { type: 'string' },
            example: 'prf_8a1f4b3c9d2e7',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeductStockRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Stock deducido satisfactoriamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Se dedujeron 2 unidades correctamente.' },
                    data: { $ref: '#/components/schemas/Perfume' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cantidad inválida o formato erróneo',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Perfume no encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'Conflicto de dominio: Existencias insuficientes en inventario',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios registrados en la plataforma',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Listado de usuarios con hipermedios HATEOAS',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer', example: 1 },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Registrar nuevo usuario con hashing seguro de contraseña',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuario registrado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Usuario registrado exitosamente' },
                    data: { $ref: '#/components/schemas/User' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Datos de usuario inválidos o correo ya registrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por su identificador',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'usr_5i46rd1w2mw0zo50n',
          },
        ],
        responses: {
          '200': {
            description: 'Detalle del usuario con enlaces HATEOAS',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/User' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Usuario no encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Actualizar perfil de usuario',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'usr_5i46rd1w2mw0zo50n',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Perfil de usuario actualizado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Usuario actualizado exitosamente' },
                    data: { $ref: '#/components/schemas/User' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Parámetros inválidos',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Usuario no encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Eliminar cuenta de usuario',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: 'usr_5i46rd1w2mw0zo50n',
          },
        ],
        responses: {
          '200': {
            description: 'Usuario eliminado satisfactoriamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Usuario eliminado exitosamente' },
                    _links: {
                      type: 'object',
                      additionalProperties: { $ref: '#/components/schemas/HateoasLink' },
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Usuario no encontrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
};
