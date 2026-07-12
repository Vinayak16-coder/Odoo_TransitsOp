import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getDashboard();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getKPIs();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getMonthlyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getMonthlyRevenue();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getTopCostliestVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AnalyticsService.getTopCostliestVehicles();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const type = String(req.params.type);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${Date.now()}.csv"`);
      
      const stream = AnalyticsService.generateCsvStream(type);
      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (err: any) {
      if (err.status === 400) {
        // If error thrown during initialization before headers sent, we could return JSON
        if (!res.headersSent) {
          return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: err.message } });
        }
      }
      next(err);
    }
  }
}
