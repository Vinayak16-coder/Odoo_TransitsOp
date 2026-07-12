import { Request, Response, NextFunction } from 'express';
import { PermissionService } from './permission.service';

export class PermissionController {
  static async getMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const matrix = await PermissionService.getPermissionsMatrix();
      res.json({ success: true, data: { matrix } });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, module, access } = req.body;
      const updated = await PermissionService.updatePermission(role, module, access, req.user!.id);
      res.json({ success: true, data: updated });
    } catch (err: any) { 
      if (err.status) return res.status(err.status).json({ success: false, error: { message: err.message } });
      next(err); 
    }
  }

  static async updateBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;
      const updated = await PermissionService.updateBulkPermissions(updates, req.user!.id);
      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  }
}
