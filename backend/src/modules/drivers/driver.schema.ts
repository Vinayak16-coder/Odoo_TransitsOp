import { z } from 'zod';
import { LicenseCategory, DriverStatus } from '@prisma/client';

export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    licenseNo: z.string().min(1, 'License number is required'),
    licenseCategory: z.nativeEnum(LicenseCategory),
    licenseExpiry: z.string().datetime({ message: 'Invalid date format' }),
    contact: z.string().min(1, 'Contact is required'),
  })
});

export const updateDriverSchema = z.object({
  body: createDriverSchema.shape.body.partial()
});

export const updateDriverStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(DriverStatus),
    reason: z.string().optional(),
  })
});
