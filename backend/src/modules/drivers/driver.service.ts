import { PrismaClient, Prisma, DriverStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class DriverService {
  static async getAllDrivers(filters: { status?: string; category?: string; search?: string }) {
    const where: Prisma.DriverWhereInput = {};

    if (filters.status) {
      where.status = filters.status as any;
      
      // BR-2: License Expiry Check for AVAILABLE drivers
      if (filters.status === DriverStatus.AVAILABLE) {
        where.licenseExpiry = { gte: new Date() };
      }
    }
    
    if (filters.category) where.licenseCategory = filters.category as any;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { licenseNo: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.driver.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  static async getDriverById(id: string) {
    return prisma.driver.findUnique({ where: { id } });
  }

  static async createDriver(data: Omit<Prisma.DriverCreateInput, 'licenseExpiry'> & { licenseExpiry: string }) {
    // BR-4: licenseNo must be unique
    const existing = await prisma.driver.findUnique({ where: { licenseNo: data.licenseNo } });
    if (existing) {
      throw { status: 409, message: 'License No. must be unique.' };
    }

    return prisma.driver.create({ 
      data: {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry)
      } 
    });
  }

  static async updateDriver(id: string, data: Omit<Prisma.DriverUpdateInput, 'licenseExpiry'> & { licenseExpiry?: string }) {
    if (data.licenseNo) {
      const existing = await prisma.driver.findFirst({
        where: { licenseNo: data.licenseNo as string, NOT: { id } }
      });
      if (existing) {
        throw { status: 409, message: 'License No. must be unique.' };
      }
    }

    const updateData: any = { ...data };
    if (data.licenseExpiry) updateData.licenseExpiry = new Date(data.licenseExpiry);

    return prisma.driver.update({ where: { id }, data: updateData });
  }

  static async updateDriverStatus(id: string, status: DriverStatus, reason?: string, userId?: string) {
    const driver = await prisma.driver.update({ where: { id }, data: { status } });
    
    await prisma.auditLog.create({
      data: {
        entityType: 'Driver',
        entityId: id,
        action: 'STATUS_CHANGE',
        toValue: status,
        reason,
        userId
      }
    });

    return driver;
  }

  static async deleteDriver(id: string) {
    // BR-10: soft delete
    return prisma.driver.update({
      where: { id },
      data: { status: DriverStatus.SUSPENDED }
    });
  }
}
