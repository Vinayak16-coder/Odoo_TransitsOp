import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authorize = (moduleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
    }

    try {
      const permission = await prisma.rolePermission.findUnique({
        where: {
          role_module: {
            role: req.user.role,
            module: moduleName
          }
        }
      });

      if (!permission || permission.access === 'NONE') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied: insufficient permissions' } });
      }

      if (req.method !== 'GET' && permission.access !== 'FULL') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied: FULL permission required for modification' } });
      }

      next();
    } catch (e) {
      next(e);
    }
  };
};
