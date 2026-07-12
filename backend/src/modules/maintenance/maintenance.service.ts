import { PrismaClient, Prisma, MaintenanceStatus, VehicleStatus } from '@prisma/client';
import { recalculateVehicleCostPerKm } from '../../utils/cost-calculator';

const prisma = new PrismaClient();

export class MaintenanceService {
  static async getAll(filters: { vehicleId?: string; status?: string }) {
    const where: Prisma.MaintenanceLogWhereInput = {};
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.status) where.status = filters.status as MaintenanceStatus;
    
    return prisma.maintenanceLog.findMany({ where, include: { vehicle: true }, orderBy: { createdAt: 'desc' } });
  }

  static async create(data: Omit<Prisma.MaintenanceLogUncheckedCreateInput, 'vehicle'|'serviceDate'> & { vehicleId: string, serviceDate: string }) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle) throw { status: 404, message: 'Vehicle not found' };

      // BR-5: Cannot open maintenance if ON_TRIP or RETIRED
      if (vehicle.status === VehicleStatus.ON_TRIP) {
        throw { status: 422, message: 'Cannot perform maintenance on a vehicle that is currently ON_TRIP' };
      }
      if (vehicle.status === VehicleStatus.RETIRED) {
        throw { status: 422, message: 'Cannot perform maintenance on a RETIRED vehicle' };
      }

      // BR-3: Flip vehicle to IN_SHOP
      await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: VehicleStatus.IN_SHOP } });

      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: data.vehicleId,
          serviceType: data.serviceType,
          cost: data.cost,
          serviceDate: new Date(data.serviceDate),
          notes: data.notes,
          status: MaintenanceStatus.IN_SHOP
        }
      });

      return log;
    }).then(async (log) => {
      await recalculateVehicleCostPerKm(log.vehicleId);
      return log;
    });
  }

  static async complete(id: string) {
    return prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({ where: { id } });
      if (!log) throw { status: 404, message: 'Maintenance log not found' };
      if (log.status === MaintenanceStatus.COMPLETED) throw { status: 422, message: 'Already completed' };

      const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
      
      // BR-3: Flip vehicle back to AVAILABLE, unless RETIRED
      if (vehicle && vehicle.status !== VehicleStatus.RETIRED) {
        await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: VehicleStatus.AVAILABLE } });
      }

      return tx.maintenanceLog.update({
        where: { id },
        data: { status: MaintenanceStatus.COMPLETED }
      });
    });
  }

  static async update(id: string, data: Omit<Prisma.MaintenanceLogUncheckedUpdateInput, 'serviceDate'> & { serviceDate?: string }) {
    const updateData: any = { ...data };
    if (data.serviceDate) updateData.serviceDate = new Date(data.serviceDate);
    
    const log = await prisma.maintenanceLog.update({ where: { id }, data: updateData });
    await recalculateVehicleCostPerKm(log.vehicleId);
    return log;
  }

  static async delete(id: string) {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) throw { status: 404, message: 'Maintenance log not found' };
    
    await prisma.maintenanceLog.delete({ where: { id } });
    await recalculateVehicleCostPerKm(log.vehicleId);
    return log;
  }
}
