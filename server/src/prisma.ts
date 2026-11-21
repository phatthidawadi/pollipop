import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient connected to PostgreSQL via DATABASE_URL
// (Supports both TCP URLs for local/CI and Unix domain sockets for Google Cloud SQL)
export const prisma = new PrismaClient();
