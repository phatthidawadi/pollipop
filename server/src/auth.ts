import { Request, Response, NextFunction } from 'express';
import { prisma } from './db';

export const SESSION_COOKIE_NAME = 'pollipop_sid';
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'RESPONDENT';
  department: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionId?: string;
    }
  }
}

export function setNoStoreHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  setNoStoreHeaders(res);

  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
      },
    });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session) {
      res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'เซสชันไม่ถูกต้องหรือสิ้นสุดแล้ว กรุณาเข้าสู่ระบบใหม่',
        },
      });
    }

    if (!session.user.isActive) {
      await prisma.session.deleteMany({ where: { userId: session.user.id } });
      res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_DISABLED',
          message: 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
        },
      });
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.deleteMany({ where: { id: sessionId } });
      res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' });
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่',
        },
      });
    }

    req.sessionId = session.id;
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as 'OWNER' | 'RESPONDENT',
      department: session.user.department,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

export function requireRole(allowedRole: 'OWNER' | 'RESPONDENT') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
        },
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์ดำเนินการในส่วนนี้',
        },
      });
    }

    return next();
  };
}

