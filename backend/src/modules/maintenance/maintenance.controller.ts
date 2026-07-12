import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from './maintenance.service';

export class MaintenanceController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        vehicleId: req.query.vehicleId as string,
        status: req.query.status as string,
      };
      const logs = await MaintenanceService.getAll(filters);
      res.json({ success: true, data: logs });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await MaintenanceService.create(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await MaintenanceService.complete(req.params.id as string);
      res.json({ success: true, data: log });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await MaintenanceService.update(req.params.id as string, req.body);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await MaintenanceService.delete(req.params.id as string);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }
}
