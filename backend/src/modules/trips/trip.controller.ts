import { Request, Response, NextFunction } from 'express';
import { TripService } from './trip.service';

export class TripController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        vehicleId: req.query.vehicleId as string,
        driverId: req.query.driverId as string,
        search: req.query.search as string,
      };
      const trips = await TripService.getAllTrips(filters);
      res.json({ success: true, data: trips });
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.getTripById(req.params.id as string);
      if (!trip) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trip not found' } });
      res.json({ success: true, data: trip });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.createTrip(req.body);
      res.status(201).json({ success: true, data: trip });
    } catch (err) { next(err); }
  }

  static async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId, driverId } = req.body;
      const trip = await TripService.assignTrip(req.params.id as string, vehicleId, driverId);
      res.json({ success: true, data: trip });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: err.status === 409 ? 'CONFLICT' : 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async dispatchTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await TripService.dispatchTrip(req.params.id as string);
      res.json({ success: true, data: trip });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: err.status === 409 ? 'CONFLICT' : 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async completeTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { finalOdometerKm, fuelConsumedLiters, fuelCost, revenue } = req.body;
      const trip = await TripService.completeTrip(req.params.id as string, finalOdometerKm, fuelConsumedLiters, fuelCost, revenue);
      res.json({ success: true, data: trip });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: err.status === 409 ? 'CONFLICT' : 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }

  static async cancelTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { cancelReason } = req.body;
      const trip = await TripService.cancelTrip(req.params.id as string, cancelReason);
      res.json({ success: true, data: trip });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: err.status === 409 ? 'CONFLICT' : 'UNPROCESSABLE_ENTITY', message: err.message } });
      next(err);
    }
  }
}
