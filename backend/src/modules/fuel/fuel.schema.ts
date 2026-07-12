import { z } from 'zod';

export const createFuelSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    tripId: z.string().optional(),
    date: z.string().datetime({ message: 'Invalid date format' }),
    liters: z.number().positive('Liters must be positive'),
    cost: z.number().positive('Cost must be positive'),
  })
});

export const updateFuelSchema = z.object({
  body: createFuelSchema.shape.body.partial()
});
