import { PrismaClient, Role, AccessLevel } from '@prisma/client';

const prisma = new PrismaClient();

export class PermissionService {
  static async getPermissionsMatrix() {
    const permissions = await prisma.rolePermission.findMany();
    
    // Group into matrix: { [role]: { [module]: access } }
    const matrix: any = {};
    for (const p of permissions) {
      if (!matrix[p.role]) {
        matrix[p.role] = {};
      }
      matrix[p.role][p.module] = p.access.toLowerCase();
    }
    return matrix;
  }

  static async updatePermission(role: string, module: string, access: AccessLevel, userId: string) {
    if (role === 'FLEET_MANAGER') {
      throw { status: 403, message: 'Cannot modify FLEET_MANAGER permissions' };
    }

    const permission = await prisma.rolePermission.update({
      where: {
        role_module: {
          role: role as Role,
          module: module
        }
      },
      data: { access }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        entityType: 'RolePermission',
        entityId: permission.id,
        action: 'UPDATE',
        toValue: `${role}:${module}=${access}`
      }
    });

    return permission;
  }

  static async updateBulkPermissions(updates: { role: string; module: string; access: AccessLevel }[], userId: string) {
    const results = [];
    for (const update of updates) {
      if (update.role === 'FLEET_MANAGER') continue; // Skip if somehow sent
      const res = await prisma.rolePermission.upsert({
        where: {
          role_module: {
            role: update.role as Role,
            module: update.module
          }
        },
        update: { access: update.access },
        create: {
          role: update.role as Role,
          module: update.module,
          access: update.access
        }
      });
      
      await prisma.auditLog.create({
        data: {
          userId,
          entityType: 'RolePermission',
          entityId: res.id,
          action: 'UPDATE',
          toValue: `${update.role}:${update.module}=${update.access}`
        }
      });

      results.push(res);
    }
    return results;
  }
}
