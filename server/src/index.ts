import { app } from './app';
import { prisma } from './prisma';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const SHUTDOWN_TIMEOUT_MS = 8000;

const server = app.listen(PORT, HOST, () => {
  console.log(`Pollipop server listening on http://${HOST}:${PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // Safety timeout to prevent hanging HTTP Keep-Alive sockets from blocking
  // prisma.$disconnect() before Cloud Run sends SIGKILL (10s grace period).
  const forceExitTimer = setTimeout(async () => {
    console.warn(`Graceful shutdown timed out after ${SHUTDOWN_TIMEOUT_MS}ms; forcing disconnect.`);
    try {
      await prisma.$disconnect();
    } catch (err) {
      console.error('Error disconnecting Prisma during forced shutdown:', err);
    }
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close(async () => {
    clearTimeout(forceExitTimer);
    try {
      await prisma.$disconnect();
      console.log('Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
