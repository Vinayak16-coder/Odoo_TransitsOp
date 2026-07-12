import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(Role),
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.nativeEnum(Role).optional(),
    isActive: z.boolean().optional(),
  })
});
