import { z } from 'zod';
import { insertCarSchema, cars } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  cars: {
    list: {
      method: 'GET' as const,
      path: '/api/cars',
      responses: {
        200: z.array(z.custom<typeof cars.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cars/:id',
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    // Admin/System routes mostly, but good to have
    create: {
      method: 'POST' as const,
      path: '/api/cars',
      input: insertCarSchema,
      responses: {
        201: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/cars/:id',
      input: insertCarSchema.partial(),
      responses: {
        200: z.custom<typeof cars.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/cars/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CarInput = z.infer<typeof api.cars.create.input>;
export type CarResponse = z.infer<typeof api.cars.create.responses[201]>;
export type CarUpdateInput = z.infer<typeof api.cars.update.input>;
export type CarsListResponse = z.infer<typeof api.cars.list.responses[200]>;
