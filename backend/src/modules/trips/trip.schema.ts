import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    source: z.string().min(1, 'Source is required'),
    destination: z.string().min(1, 'Destination is required'),
    cargoWeightKg: z.number().positive('Cargo weight must be positive'),
    plannedDistanceKm: z.number().positive('Planned distance must be positive'),
  })
});

export const assignTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().min(1, 'Vehicle ID is required'),
    driverId: z.string().min(1, 'Driver ID is required'),
  })
});

export const completeTripSchema = z.object({
  body: z.object({
    finalOdometerKm: z.number().nonnegative('Final odometer must be non-negative'),
    fuelConsumedLiters: z.number().positive('Fuel consumed must be positive'),
    fuelCost: z.number().positive('Fuel cost must be positive'),
    revenue: z.number().nonnegative('Revenue must be non-negative').optional(),
  })
});

export const cancelTripSchema = z.object({
  body: z.object({
    cancelReason: z.string().min(1, 'Cancel reason is required'),
  })
});
