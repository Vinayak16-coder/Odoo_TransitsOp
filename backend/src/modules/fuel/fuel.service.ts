import { PrismaClient, Prisma, TripStatus } from '@prisma/client';
import { recalculateVehicleCostPerKm } from '../../utils/cost-calculator';

const prisma = new PrismaClient();

export class FuelService {
  static async getAll(filters: { vehicleId?: string; tripId?: string; dateFrom?: string; dateTo?: string }) {
    const where: Prisma.FuelLogWhereInput = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.tripId) where.tripId = filters.tripId;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }
    return prisma.fuelLog.findMany({ where, include: { vehicle: true, trip: true }, orderBy: { date: 'desc' } });
  }

  static async create(data: Omit<Prisma.FuelLogUncheckedCreateInput, 'vehicle'|'date'> & { vehicleId: string, tripId?: string, date: string }) {
    if (data.tripId) {
      const trip = await prisma.trip.findUnique({ where: { id: data.tripId } });
      if (trip && trip.status !== TripStatus.COMPLETED) {
        throw { status: 422, message: 'Fuel logs can only be explicitly linked to COMPLETED trips' };
      }
    }

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        tripId: data.tripId,
        date: new Date(data.date),
        liters: data.liters,
        cost: data.cost
      }
    });

    await recalculateVehicleCostPerKm(log.vehicleId);
    return log;
  }

  static async update(id: string, data: Omit<Prisma.FuelLogUncheckedUpdateInput, 'date'> & { date?: string }) {
    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    const log = await prisma.fuelLog.update({ where: { id }, data: updateData });
    await recalculateVehicleCostPerKm(log.vehicleId);
    return log;
  }

  static async delete(id: string) {
    const log = await prisma.fuelLog.findUnique({ where: { id } });
    if (!log) throw { status: 404, message: 'Fuel log not found' };
    
    await prisma.fuelLog.delete({ where: { id } });
    await recalculateVehicleCostPerKm(log.vehicleId);
    return log;
  }
}
