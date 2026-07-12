import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecret_access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh';

// 15 minutes in ms
const ACCESS_TOKEN_EXPIRES_IN = 15 * 60 * 1000;
// 7 days in ms
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(423).json({ success: false, error: { code: 'LOCKED', message: 'Account locked after 5 failed attempts' } });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      const failedLogins = user.failedLogins + 1;
      let lockedUntil = user.lockedUntil;
      
      if (failedLogins >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
      }
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins, lockedUntil },
      });

      if (failedLogins >= 5) {
        return res.status(423).json({ success: false, error: { code: 'LOCKED', message: 'Account locked after 5 failed attempts' } });
      }

      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    // Reset failed logins
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null },
    });

    // Issue tokens
    const accessToken = jwt.sign({ userId: user.id }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const isDev = process.env.NODE_ENV !== 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: 'lax',
      expires: expiresAt,
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
    }

    // Verify token cryptographically
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch (e) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }

    // Check DB for revocation / existence
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Refresh token invalid or revoked' } });
    }

    if (!tokenRecord.user.isActive) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User inactive' } });
    }

    // Rotate refresh token
    const newAccessToken = jwt.sign({ userId: decoded.userId }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: decoded.userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

    // Transaction to delete old and insert new
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: decoded.userId,
          expiresAt: newExpiresAt,
        },
      }),
    ]);

    const isDev = process.env.NODE_ENV !== 'production';

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: !isDev,
      sameSite: 'lax',
      expires: newExpiresAt,
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is populated by authenticate middleware
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already in use' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
