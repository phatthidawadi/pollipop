import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { requireAuth, setNoStoreHeaders, SESSION_COOKIE_NAME, SESSION_TTL_MS } from './auth';
import { loginSchema, formatZodError } from './validation';

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// S-01 Health Check (Liveness Probe - AC-07 / TEST-07)
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Pollipop API',
    timestamp: new Date().toISOString(),
  });
});

// S-01 Database Readiness Probe (AC-08 / TEST-08)
app.get('/api/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'ready',
      db: 'connected',
    });
  } catch (err) {
    return res.status(503).json({
      status: 'not_ready',
      db: 'disconnected',
    });
  }
});

// F-01: POST /api/auth/login (AC-01, AC-02, AC-38)
app.post('/api/auth/login', async (req, res) => {
  setNoStoreHeaders(res);

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง',
        details: formatZodError(parsed.error),
      },
    });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      },
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      },
    });
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
    },
  });

  res.cookie(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  });

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
    expiresAt: expiresAt.toISOString(),
  });
});

// F-01: GET /api/auth/me (AC-03, AC-04, AC-38 / TEST-04, TEST-39)
app.get('/api/auth/me', requireAuth, (req, res) => {
  return res.status(200).json({
    user: req.user,
    sessionId: req.sessionId,
  });
});

// F-01: POST /api/auth/logout (AC-06 / TEST-06)
app.post('/api/auth/logout', async (req, res) => {
  setNoStoreHeaders(res);
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  return res.status(200).json({
    message: 'ออกจากระบบสำเร็จ',
  });
});
