import { PrismaClient, TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import bcrypt from 'bcrypt';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
    TripStatus: { DRAFT: 'DRAFT', DISPATCHED: 'DISPATCHED', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' },
    VehicleStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', IN_SHOP: 'IN_SHOP', RETIRED: 'RETIRED' },
    DriverStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', SUSPENDED: 'SUSPENDED', RETIRED: 'RETIRED' },
    MaintenanceStatus: { IN_SHOP: 'IN_SHOP', COMPLETED: 'COMPLETED' },
    Role: { ADMIN: 'ADMIN', DISPATCHER: 'DISPATCHER', DRIVER: 'DRIVER', FLEET_MANAGER: 'FLEET_MANAGER', FINANCIAL_ANALYST: 'FINANCIAL_ANALYST' },
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

let prismaMock: DeepMockProxy<PrismaClient>;
let TripService: any;
let MaintenanceService: any;
let VehicleService: any;
let login: any;
let recalculateVehicleCostPerKm: any;

beforeAll(async () => {
  prismaMock = mockDeep<PrismaClient>();
  (PrismaClient as unknown as jest.Mock).mockImplementation(() => prismaMock);
  
  TripService = (await import('../../modules/trips/trip.service')).TripService;
  MaintenanceService = (await import('../../modules/maintenance/maintenance.service')).MaintenanceService;
  VehicleService = (await import('../../modules/vehicles/vehicle.service')).VehicleService;
  login = (await import('../../modules/auth/auth.controller')).login;
  recalculateVehicleCostPerKm = (await import('../../utils/cost-calculator')).recalculateVehicleCostPerKm;
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Business Rules Validation', () => {
  describe('BR-1: Vehicle Capacity Validation', () => {
    it('should reject trip assignment if cargo weight exceeds capacity', async () => {
      const mockVehicle = { id: 'v1', capacityKg: 1000, status: 'AVAILABLE' };
      const mockDriver = { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) };
      const mockTrip = { id: 't1', status: 'DRAFT', cargoWeightKg: 1200 };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver as any);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip as any);

      await expect(TripService.assignTrip('t1', 'v1', 'd1')).rejects.toMatchObject({
        status: 422,
        message: 'Vehicle Capacity 1000 kg, Cargo Weight 1200 kg — Capacity exceeded by 200 kg — dispatch blocked.'
      });
    });
  });

  describe('BR-2: License Expiry Check', () => {
    it('should reject dispatch if driver license is expired', async () => {
      const mockVehicle = { id: 'v1', capacityKg: 1000, status: 'AVAILABLE' };
      const mockDriver = { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() - 100000) };
      const mockTrip = { id: 't1', status: 'DRAFT', cargoWeightKg: 800 };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver as any);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip as any);

      await expect(TripService.assignTrip('t1', 'v1', 'd1')).rejects.toMatchObject({
        status: 422,
        message: 'Driver license is expired'
      });
    });
  });

  describe('BR-3: Automatic Status Transitions', () => {
    it('should update vehicle and driver status on dispatch', async () => {
      const mockTrip = { id: 't1', status: 'DRAFT', vehicleId: 'v1', driverId: 'd1', cargoWeightKg: 800, vehicle: { id: 'v1', capacityKg: 1000, status: 'AVAILABLE' }, driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) } };
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip as any);
      prismaMock.vehicle.update.mockResolvedValue({} as any);
      prismaMock.driver.update.mockResolvedValue({} as any);
      prismaMock.trip.update.mockResolvedValue({} as any);

      await TripService.dispatchTrip('t1');

      expect(prismaMock.vehicle.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data: { status: 'ON_TRIP' } });
      expect(prismaMock.driver.update).toHaveBeenCalledWith({ where: { id: 'd1' }, data: { status: 'ON_TRIP' } });
    });
  });

  describe('BR-4: Duplicate Assignments', () => {
    it('should reject assignment if vehicle is not available', async () => {
      const mockVehicle = { id: 'v1', capacityKg: 1000, status: 'ON_TRIP' };
      const mockDriver = { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) };
      const mockTrip = { id: 't1', status: 'DRAFT', cargoWeightKg: 800 };

      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle as any);
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver as any);
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip as any);

      await expect(TripService.assignTrip('t1', 'v1', 'd1')).rejects.toMatchObject({
        status: 409,
        message: 'Vehicle is not available'
      });
    });
  });

  describe('BR-5: Maintenance Restrictions', () => {
    it('should prevent opening maintenance log on ON_TRIP vehicle', async () => {
      const mockVehicle = { id: 'v1', status: 'ON_TRIP' };
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.vehicle.findUnique.mockResolvedValue(mockVehicle as any);

      await expect(MaintenanceService.create({ vehicleId: 'v1', serviceType: 'REPAIR', cost: 100, serviceDate: '2026-01-01', notes: '' })).rejects.toMatchObject({
        status: 422,
        message: 'Cannot perform maintenance on a vehicle that is currently ON_TRIP'
      });
    });
  });

  describe('BR-6: Trip Lifecycle Integrity', () => {
    it('should reject completing trip if missing odometer reading or not DISPATCHED', async () => {
      const mockTrip = { id: 't1', status: 'DRAFT' };
      prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
      prismaMock.trip.findUnique.mockResolvedValue(mockTrip as any);

      await expect(TripService.completeTrip('t1', 5000, 50, 100)).rejects.toMatchObject({
        status: 422,
        message: 'Only DISPATCHED trips can be completed'
      });
    });
  });

  describe('BR-7: Financial Calculations', () => {
    it('should recalculate avgCostPerKm based on fuel, maintenance, and expenses', async () => {
      prismaMock.vehicle.findUnique.mockResolvedValue({ odometerKm: 1000 } as any);
      prismaMock.fuelLog.aggregate.mockResolvedValue({ _sum: { cost: 500 } } as any);
      prismaMock.maintenanceLog.aggregate.mockResolvedValue({ _sum: { cost: 300 } } as any);
      prismaMock.expense.aggregate.mockResolvedValue({ _sum: { total: 200 } } as any);

      await recalculateVehicleCostPerKm('v1');

      expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { avgCostPerKm: 1 } // (500 + 300 + 200) / 1000
      });
    });
  });

  describe('BR-8: Auth & Account Security', () => {
    it('should lock account after 5 failed logins', async () => {
      const req = { body: { email: 'test@test.com', password: 'wrong' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      const user = { id: 'u1', isActive: true, failedLogins: 4, lockedUntil: null, passwordHash: 'hash' };
      prismaMock.user.findUnique.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(req, res, next);

      expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          failedLogins: 5,
          lockedUntil: expect.any(Date)
        })
      }));
      expect(res.status).toHaveBeenCalledWith(423);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'LOCKED', message: 'Account locked after 5 failed attempts' } });
    });
  });

  describe('BR-9: RBAC Enforcement', () => {
    it('should deny access if user role is not authorized', () => {
      const { authorize } = require('../../middleware/authorize');
      const req = { user: { role: 'DRIVER' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      const middleware = authorize(['DISPATCHER']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied: insufficient permissions' } });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('BR-10: Data Integrity', () => {
    it('should soft delete a vehicle', async () => {
      prismaMock.vehicle.update.mockResolvedValue({} as any);

      await VehicleService.deleteVehicle('v1');

      expect(prismaMock.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { status: 'RETIRED' }
      });
    });
  });
});
