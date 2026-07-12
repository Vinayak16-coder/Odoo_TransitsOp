import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';

export class VehicleController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        type: req.query.type as string,
        status: req.query.status as string,
        region: req.query.region as string,
        search: req.query.search as string,
      };
      const vehicles = await VehicleService.getAllVehicles(filters);
      res.json({ success: true, data: vehicles });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.getVehicleById((req.params.id as string));
      if (!vehicle) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vehicle not found' } });
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (err: any) {
      if (err.status === 409) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: err.message } });
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.updateVehicle((req.params.id as string), req.body);
      res.json({ success: true, data: vehicle });
    } catch (err: any) {
      if (err.status === 409) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: err.message } });
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const userId = (req as any).user?.id;
      const vehicle = await VehicleService.updateVehicleStatus((req.params.id as string), status, reason, userId);
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await VehicleService.deleteVehicle((req.params.id as string));
      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }
}
