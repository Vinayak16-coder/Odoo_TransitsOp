import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import jwt from 'jsonwebtoken';

const mockPrisma = mockDeep<PrismaClient>();
mockPrisma.$transaction = jest.fn().mockImplementation(async (cb) => cb(mockPrisma)) as any;

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    TripStatus: { DRAFT: 'DRAFT', DISPATCHED: 'DISPATCHED', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' },
    VehicleStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', IN_SHOP: 'IN_SHOP', RETIRED: 'RETIRED' },
    DriverStatus: { AVAILABLE: 'AVAILABLE', ON_TRIP: 'ON_TRIP', SUSPENDED: 'SUSPENDED' },
    Role: { FLEET_MANAGER: 'FLEET_MANAGER', DRIVER: 'DRIVER', SAFETY_OFFICER: 'SAFETY_OFFICER', FINANCIAL_ANALYST: 'FINANCIAL_ANALYST' },
    VehicleType: { TRUCK: 'TRUCK', VAN: 'VAN' },
    LicenseCategory: { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E' },
    ExpenseCategory: { TOLL: 'TOLL', PARKING: 'PARKING', MISC: 'MISC' }
  };
});

import app from '../../app';

describe('Trip Lifecycle Integration Test (BR-6)', () => {
  let token: string;

  beforeAll(() => {
    token = jwt.sign({ userId: 'u1' }, process.env.JWT_ACCESS_SECRET || 'supersecret_access', { expiresIn: '1h' });
  });

  beforeEach(() => {
    mockReset(mockPrisma);
    mockPrisma.$transaction = jest.fn().mockImplementation(async (cb) => cb(mockPrisma)) as any;
    
    // Mock user lookup for authenticate middleware
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'u1', role: 'FLEET_MANAGER', isActive: true
    } as any);
  });

  const prismaMock = mockPrisma;

  it('should successfully complete a full trip lifecycle', async () => {
    // 1. Create Trip
    prismaMock.trip.create.mockResolvedValue({ id: 't1', status: 'DRAFT' } as any);
    const createRes = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({ source: 'A', destination: 'B', cargoWeightKg: 500, plannedDistanceKm: 100 });
      
    expect(createRes.status).toBe(201);
    
    // 2. Dispatch Trip
    prismaMock.trip.findUnique.mockResolvedValue({ 
      id: 't1', status: 'DRAFT', vehicleId: 'v1', driverId: 'd1', cargoWeightKg: 500,
      vehicle: { id: 'v1', capacityKg: 1000, status: 'AVAILABLE', odometerKm: 1000 },
      driver: { id: 'd1', status: 'AVAILABLE', licenseExpiry: new Date(Date.now() + 100000) }
    } as any);
    prismaMock.$transaction.mockResolvedValue([ { id: 't1', status: 'DISPATCHED' } ] as any);
    
    const dispatchRes = await request(app)
      .patch('/api/trips/t1/dispatch')
      .set('Authorization', `Bearer ${token}`)
      .send({});
      
    expect(dispatchRes.status).toBe(200);

    // 3. Complete Trip
    prismaMock.trip.findUnique.mockResolvedValue({ 
      id: 't1', status: 'DISPATCHED', vehicleId: 'v1', driverId: 'd1',
      vehicle: { id: 'v1', capacityKg: 1000, status: 'ON_TRIP', odometerKm: 1000 },
      driver: { id: 'd1', status: 'ON_TRIP', licenseExpiry: new Date(Date.now() + 100000) }
    } as any);
    prismaMock.$transaction.mockResolvedValue([ { id: 't1', status: 'COMPLETED' } ] as any);
    
    const completeRes = await request(app)
      .patch('/api/trips/t1/complete')
      .set('Authorization', `Bearer ${token}`)
      .send({ finalOdometerKm: 1500, fuelConsumedLiters: 50, fuelCost: 100 });
      
    expect(completeRes.status).toBe(200);
  });
});
