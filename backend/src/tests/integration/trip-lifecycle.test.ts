import request from 'supertest';
import { PrismaClient, TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
    TripStatus: { DRAFT: 'DRAFT', DISPATCHED: 'DISPATCHED', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' },
    VehicleStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', IN_SHOP: 'IN_SHOP', RETIRED: 'RETIRED' },
    DriverStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', SUSPENDED: 'SUSPENDED', RETIRED: 'RETIRED' },
    Role: { ADMIN: 'ADMIN', DISPATCHER: 'DISPATCHER', DRIVER: 'DRIVER', FLEET_MANAGER: 'FLEET_MANAGER', FINANCIAL_ANALYST: 'FINANCIAL_ANALYST' },
  };
});

let app: any;
let prismaMock: DeepMockProxy<PrismaClient>;

beforeAll(async () => {
  prismaMock = mockDeep<PrismaClient>();
  (PrismaClient as unknown as jest.Mock).mockImplementation(() => prismaMock);
  app = (await import('../../app')).default;
});

beforeEach(() => {
  jest.clearAllMocks();
});

const generateToken = (role = 'DISPATCHER') => {
  return jwt.sign({ userId: 'u1' }, process.env.JWT_ACCESS_SECRET || 'supersecret_access');
};

describe('Trip Lifecycle Integration Tests', () => {
  it('should create, assign, dispatch, and complete a trip', async () => {
    const token = generateToken();
    const user = { id: 'u1', role: 'DISPATCHER', isActive: true };

    prismaMock.user.findUnique.mockResolvedValue(user as any);

    // 1. Create Trip
    const draftTrip = { id: 't1', status: 'DRAFT', tripCode: 'TRP-1' };
    prismaMock.trip.create.mockResolvedValue(draftTrip as any);

    const createRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        source: 'A',
        destination: 'B',
        plannedDistanceKm: 100,
        cargoWeightKg: 500,
        plannedStartTime: new Date().toISOString()
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.id).toBe('t1');

    // 2. Assign Trip
    prismaMock.vehicle.findUnique.mockResolvedValue({ id: 'v1', capacityKg: 1000, status: 'AVAILABLE' } as any);
    prismaMock.driver.findUnique.mockResolvedValue({ id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) } as any);
    prismaMock.trip.findUnique.mockResolvedValue(draftTrip as any);
    prismaMock.trip.update.mockResolvedValue({ ...draftTrip, vehicleId: 'v1', driverId: 'd1' } as any);

    const assignRes = await request(app)
      .patch('/api/trips/t1/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ vehicleId: 'v1', driverId: 'd1' });

    expect(assignRes.status).toBe(200);

    // 3. Dispatch Trip
    prismaMock.$transaction.mockImplementation(async (cb) => cb(prismaMock));
    const assignedTrip = { id: 't1', status: 'DRAFT', vehicleId: 'v1', driverId: 'd1', cargoWeightKg: 500, vehicle: { capacityKg: 1000, status: 'AVAILABLE' }, driver: { status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) } };
    prismaMock.trip.findUnique.mockResolvedValue(assignedTrip as any);
    prismaMock.vehicle.update.mockResolvedValue({} as any);
    prismaMock.driver.update.mockResolvedValue({} as any);
    const dispatchedTrip = { id: 't1', status: 'DISPATCHED' };
    prismaMock.trip.update.mockResolvedValue(dispatchedTrip as any);

    const dispatchRes = await request(app)
      .patch('/api/trips/t1/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(dispatchRes.status).toBe(200);

    // 4. Complete Trip
    prismaMock.trip.findUnique.mockResolvedValue({ ...dispatchedTrip, vehicle: { id: 'v1', odometerKm: 1000 }, driver: { id: 'd1' } } as any);
    prismaMock.fuelLog.create.mockResolvedValue({} as any);
    prismaMock.vehicle.update.mockResolvedValue({} as any);
    prismaMock.driver.update.mockResolvedValue({} as any);
    const completedTrip = { id: 't1', status: 'COMPLETED', vehicleId: 'v1' };
    prismaMock.trip.update.mockResolvedValue(completedTrip as any);
    prismaMock.fuelLog.aggregate.mockResolvedValue({ _sum: { cost: 500 } } as any);
    prismaMock.maintenanceLog.aggregate.mockResolvedValue({ _sum: { cost: 300 } } as any);
    prismaMock.expense.aggregate.mockResolvedValue({ _sum: { total: 200 } } as any);

    const completeRes = await request(app)
      .patch('/api/trips/t1/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ finalOdometerKm: 1100, fuelConsumedLiters: 10, fuelCost: 50, revenue: 1000 });

    expect(completeRes.status).toBe(200);
  });
});
