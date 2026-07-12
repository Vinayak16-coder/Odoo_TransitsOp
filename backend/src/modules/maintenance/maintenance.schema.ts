import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    serviceType: z.string().min(1, 'Service type is required'),
    cost: z.number().nonnegative('Cost must be non-negative'),
    serviceDate: z.string().datetime({ message: 'Invalid date format' }),
    notes: z.string().optional(),
  })
});

export const updateMaintenanceSchema = z.object({
  body: createMaintenanceSchema.shape.body.partial()
});
