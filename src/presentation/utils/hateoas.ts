export interface HateoasLink {
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description?: string;
}

export type HateoasLinks = Record<string, HateoasLink>;

export class HateoasBuilder {
  public static forPerfume(perfumeId: string): HateoasLinks {
    return {
      self: {
        href: `/api/perfumes/${perfumeId}`,
        method: 'GET',
        description: 'Consultar el detalle de esta fragancia',
      },
      deductStock: {
        href: `/api/perfumes/${perfumeId}/deduct-stock`,
        method: 'POST',
        description: 'Deducir unidades del stock disponible tras una venta',
      },
      collection: {
        href: '/api/perfumes',
        method: 'GET',
        description: 'Listado y búsqueda de fragancias en el catálogo maestro',
      },
      create: {
        href: '/api/perfumes',
        method: 'POST',
        description: 'Registrar una nueva fragancia (requiere rol Admin)',
      },
    };
  }

  public static forPerfumeCollection(): HateoasLinks {
    return {
      self: {
        href: '/api/perfumes',
        method: 'GET',
        description: 'Colección de perfumes del catálogo',
      },
      create: {
        href: '/api/perfumes',
        method: 'POST',
        description: 'Alta de nueva fragancia en inventario',
      },
      health: {
        href: '/api/health',
        method: 'GET',
        description: 'Verificación del estado del backend',
      },
      docs: {
        href: '/api/docs',
        method: 'GET',
        description: 'Documentación interactiva Swagger UI',
      },
    };
  }

  public static forUser(userId: string): HateoasLinks {
    return {
      self: {
        href: `/api/users/${userId}`,
        method: 'GET',
        description: 'Consultar perfil de este usuario',
      },
      update: {
        href: `/api/users/${userId}`,
        method: 'PUT',
        description: 'Modificar datos de contacto del usuario',
      },
      delete: {
        href: `/api/users/${userId}`,
        method: 'DELETE',
        description: 'Eliminar cuenta de usuario del sistema',
      },
      collection: {
        href: '/api/users',
        method: 'GET',
        description: 'Listado general de usuarios registrados',
      },
    };
  }

  public static forUserCollection(): HateoasLinks {
    return {
      self: {
        href: '/api/users',
        method: 'GET',
        description: 'Colección de usuarios de la plataforma',
      },
      create: {
        href: '/api/users',
        method: 'POST',
        description: 'Registrar nuevo usuario',
      },
      docs: {
        href: '/api/docs',
        method: 'GET',
        description: 'Documentación interactiva OpenAPI',
      },
    };
  }
}
