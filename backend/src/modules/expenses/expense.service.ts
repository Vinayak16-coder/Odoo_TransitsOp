import { PrismaClient, Prisma } from '@prisma/client';
import { recalculateVehicleCostPerKm } from '../../utils/cost-calculator';

const prisma = new PrismaClient();

export class ExpenseService {
  static async getAll(filters: { tripId?: string; vehicleId?: string; category?: string }) {
    const where: Prisma.ExpenseWhereInput = {};
    if (filters.tripId) where.tripId = filters.tripId;
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.category) where.category = filters.category as any;
    
    return prisma.expense.findMany({ where, include: { trip: true, vehicle: true }, orderBy: { createdAt: 'desc' } });
  }

  static async create(data: Omit<Prisma.ExpenseUncheckedCreateInput, 'total'>) {
    // BR-7: Expense.total computed server-side
    const tollCost = Number(data.toll || 0);
    const otherCost = Number(data.other || 0);
    const total = tollCost + otherCost;

    const expense = await prisma.expense.create({
      data: {
        tripId: data.tripId,
        vehicleId: data.vehicleId,
        category: data.category,
        toll: tollCost,
        other: otherCost,
        total
      }
    });

    if (expense.vehicleId) {
      await recalculateVehicleCostPerKm(expense.vehicleId);
    }
    return expense;
  }

  static async update(id: string, data: Partial<Omit<Prisma.ExpenseUncheckedUpdateInput, 'total'>>) {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw { status: 404, message: 'Expense not found' };

    const tollCost = data.toll !== undefined ? Number(data.toll) : Number(existing.toll);
    const otherCost = data.other !== undefined ? Number(data.other) : Number(existing.other);
    const total = tollCost + otherCost;

    const expense = await prisma.expense.update({
      where: { id },
      data: { ...data, total }
    });

    if (expense.vehicleId) {
      await recalculateVehicleCostPerKm(expense.vehicleId);
    }
    return expense;
  }

  static async delete(id: string) {
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) throw { status: 404, message: 'Expense not found' };
    
    await prisma.expense.delete({ where: { id } });
    
    if (expense.vehicleId) {
      await recalculateVehicleCostPerKm(expense.vehicleId);
    }
    return expense;
  }
}
