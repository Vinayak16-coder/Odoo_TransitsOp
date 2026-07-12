import { z } from 'zod';
import { VehicleType, VehicleStatus } from '@prisma/client';

export const createVehicleSchema = z.object({
  body: z.object({
    regNo: z.string().min(1, 'Registration number is required'),
    nameModel: z.string().min(1, 'Model name is required'),
    type: z.nativeEnum(VehicleType),
    capacityKg: z.number().positive('Capacity must be a positive number'),
    acquisitionCost: z.number().positive('Acquisition cost must be strictly greater than 0'),
    region: z.string().optional(),
  })
});

export const updateVehicleSchema = z.object({
  body: createVehicleSchema.shape.body.partial()
});

export const updateVehicleStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(VehicleStatus),
    reason: z.string().optional(),
  })
});
