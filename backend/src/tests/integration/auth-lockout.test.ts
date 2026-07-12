import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import bcrypt from 'bcrypt';

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
    Role: { ADMIN: 'ADMIN', DISPATCHER: 'DISPATCHER', DRIVER: 'DRIVER', FLEET_MANAGER: 'FLEET_MANAGER', FINANCIAL_ANALYST: 'FINANCIAL_ANALYST' },
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

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

describe('Auth Lockout Integration Test', () => {
  it('should lock the account after 5 failed login attempts', async () => {
    const user = {
      id: 'u1',
      email: 'test@example.com',
      passwordHash: 'hash',
      isActive: true,
      failedLogins: 4,
      lockedUntil: null
    };

    prismaMock.user.findUnique.mockResolvedValue(user as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    prismaMock.user.update.mockResolvedValue({ ...user, failedLogins: 5, lockedUntil: new Date(Date.now() + 30 * 60 * 1000) } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });

    console.log(res.body);
    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('LOCKED');
    expect(prismaMock.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'u1' },
      data: expect.objectContaining({
        failedLogins: 5,
        lockedUntil: expect.any(Date)
      })
    }));
  });
});
