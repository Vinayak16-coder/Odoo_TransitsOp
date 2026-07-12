import { Request, Response, NextFunction } from 'express';
import { FuelService } from './fuel.service';

export class FuelController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        vehicleId: req.query.vehicleId as string,
        tripId: req.query.tripId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };
      const logs = await FuelService.getAll(filters);
      res.json({ success: true, data: logs });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await FuelService.create(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await FuelService.update(req.params.id as string, req.body);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await FuelService.delete(req.params.id as string);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }
}
