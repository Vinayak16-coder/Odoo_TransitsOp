import { Request, Response, NextFunction } from 'express';
import { ExpenseService } from './expense.service';

export class ExpenseController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        tripId: req.query.tripId as string,
        vehicleId: req.query.vehicleId as string,
        category: req.query.category as string,
      };
      const logs = await ExpenseService.getAll(filters);
      res.json({ success: true, data: logs });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await ExpenseService.create(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await ExpenseService.update(req.params.id as string, req.body);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await ExpenseService.delete(req.params.id as string);
      res.json({ success: true, data: log });
    } catch (err) { next(err); }
  }
}
