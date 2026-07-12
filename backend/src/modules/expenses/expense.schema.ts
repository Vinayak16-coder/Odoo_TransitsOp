import { z } from 'zod';
import { ExpenseCategory } from '@prisma/client';

export const createExpenseSchema = z.object({
  body: z.object({
    tripId: z.string().optional(),
    vehicleId: z.string().optional(),
    category: z.nativeEnum(ExpenseCategory),
    toll: z.number().nonnegative('Toll must be non-negative').default(0),
    other: z.number().nonnegative('Other must be non-negative').default(0),
  })
});

export const updateExpenseSchema = z.object({
  body: createExpenseSchema.shape.body.partial()
});
