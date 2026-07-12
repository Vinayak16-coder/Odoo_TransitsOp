import { Request, Response, NextFunction } from 'express';
import { DriverService } from './driver.service';

export class DriverController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string,
      };
      const drivers = await DriverService.getAllDrivers(filters);
      res.json({ success: true, data: drivers });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.getDriverById((req.params.id as string));
      if (!driver) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Driver not found' } });
      res.json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.createDriver(req.body);
      res.status(201).json({ success: true, data: driver });
    } catch (err: any) {
      if (err.status === 409) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: err.message } });
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.updateDriver((req.params.id as string), req.body);
      res.json({ success: true, data: driver });
    } catch (err: any) {
      if (err.status === 409) return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: err.message } });
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reason } = req.body;
      const userId = (req as any).user?.id;
      const driver = await DriverService.updateDriverStatus((req.params.id as string), status, reason, userId);
      res.json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await DriverService.deleteDriver((req.params.id as string));
      res.json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }
}
