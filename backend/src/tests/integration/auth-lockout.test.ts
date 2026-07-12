import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

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

beforeEach(() => {
  mockReset(mockPrisma);
  mockPrisma.$transaction = jest.fn().mockImplementation(async (cb) => cb(mockPrisma)) as any;
});

const prismaMock = mockPrisma;

describe('Auth Lockout Integration Test (BR-8)', () => {
  it('should lock the account after 5 failed attempts and return 423', async () => {
    let failedLogins = 0;
    // @ts-ignore
    prismaMock.user.findUnique.mockImplementation(async () => ({
      id: 'u1',
      email: 'test@transitops.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      failedLogins: failedLogins,
      lockedUntil: null,
    }));

    // @ts-ignore
    prismaMock.user.update.mockImplementation(async (args) => {
      failedLogins = args.data.failedLogins as number;
      return {};
    });

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@transitops.com', password: 'wrong' });
    }

    // @ts-ignore
    prismaMock.user.findUnique.mockImplementation(async () => ({
      id: 'u1',
      email: 'test@transitops.com',
      passwordHash: 'hashedpassword',
      isActive: true,
      failedLogins: 5,
      lockedUntil: new Date(Date.now() + 30 * 60000),
    }));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@transitops.com', password: 'wrong' });

    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('LOCKED');
  });
});
