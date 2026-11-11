import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { prisma } from './prisma';

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
