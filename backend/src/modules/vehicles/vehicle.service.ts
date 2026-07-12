import { PrismaClient, Prisma, VehicleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class VehicleService {
  static async getAllVehicles(filters: { type?: string; status?: string; region?: string; search?: string }) {
    const where: Prisma.VehicleWhereInput = {};

    if (filters.type) where.type = filters.type as any;
    if (filters.status) where.status = filters.status as any;
    if (filters.region) where.region = filters.region;
    if (filters.search) {
      where.OR = [
        { regNo: { contains: filters.search, mode: 'insensitive' } },
        { nameModel: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getVehicleById(id: string) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  static async createVehicle(data: Prisma.VehicleCreateInput) {
    // BR-4: regNo must be unique
    const existing = await prisma.vehicle.findUnique({ where: { regNo: data.regNo } });
    if (existing) {
      throw { status: 409, message: 'Registration No. must be unique. Retired/In Shop vehicles are hidden from Trip Dispatcher.' };
    }

    return prisma.vehicle.create({ data });
  }

  static async updateVehicle(id: string, data: Prisma.VehicleUpdateInput) {
    if (data.regNo) {
      const existing = await prisma.vehicle.findFirst({
        where: { regNo: data.regNo as string, NOT: { id } }
      });
      if (existing) {
        throw { status: 409, message: 'Registration No. must be unique. Retired/In Shop vehicles are hidden from Trip Dispatcher.' };
      }
    }

    return prisma.vehicle.update({ where: { id }, data });
  }

  static async updateVehicleStatus(id: string, status: VehicleStatus, reason?: string, userId?: string) {
    const vehicle = await prisma.vehicle.update({ where: { id }, data: { status } });
    
    // Log audit action
    await prisma.auditLog.create({
      data: {
        entityType: 'Vehicle',
        entityId: id,
        action: 'STATUS_CHANGE',
        toValue: status,
        reason,
        userId
      }
    });

    return vehicle;
  }

  static async deleteVehicle(id: string) {
    // BR-10: soft delete
    return prisma.vehicle.update({
      where: { id },
      data: { status: VehicleStatus.RETIRED }
    });
  }
}
