import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAll();
      res.json({ success: true, data: users });
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Map password to passwordHash for the service layer
      const { password, ...rest } = req.body;
      const user = await UserService.create({ ...rest, passwordHash: password });
      res.status(201).json({ success: true, data: user });
    } catch (err: any) {
      if (err.status) return res.status(err.status).json({ success: false, error: { code: 'CONFLICT', message: err.message } });
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.update(String(req.params.id), req.body);
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.delete(String(req.params.id));
      res.json({ success: true, data: user });
    } catch (err) { next(err); }
  }

  static getPermissionsMatrix(req: Request, res: Response) {
    const matrix = UserService.getPermissionsMatrix();
    res.json({ success: true, data: matrix });
  }
}
