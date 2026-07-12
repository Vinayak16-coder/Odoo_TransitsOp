import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UserService {
  static async getAll() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw { status: 409, message: 'Email already exists' };

    const passwordHash = await bcrypt.hash(data.passwordHash, 12);
    
    return prisma.user.create({
      data: { ...data, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  }

  static async update(id: string, data: Partial<Prisma.UserCreateInput>) {
    return prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  static getPermissionsMatrix() {
    return {
      FLEET_MANAGER: {
        Dashboard: 'view',
        Fleet: 'full',
        Drivers: 'full',
        Trips: 'full',
        Maintenance: 'full',
        FuelAndExpenses: 'full',
        Analytics: 'view',
        Settings: 'full'
      },
      DRIVER: {
        Dashboard: 'view',
        Fleet: 'view',
        Drivers: 'view',
        Trips: 'full',
        Maintenance: 'none',
        FuelAndExpenses: 'none',
        Analytics: 'none',
        Settings: 'none'
      },
      SAFETY_OFFICER: {
        Dashboard: 'none',
        Fleet: 'none',
        Drivers: 'full',
        Trips: 'none',
        Maintenance: 'full',
        FuelAndExpenses: 'none',
        Analytics: 'view',
        Settings: 'none'
      },
      FINANCIAL_ANALYST: {
        Dashboard: 'none',
        Fleet: 'none',
        Drivers: 'none',
        Trips: 'none',
        Maintenance: 'none',
        FuelAndExpenses: 'full',
        Analytics: 'full',
        Settings: 'none'
      }
    };
  }
}
