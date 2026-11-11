import path from 'path';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  const dbPath = path.resolve(__dirname, '../prisma/dev.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
} else if (process.env.DATABASE_URL.startsWith('file:./')) {
  const relativePath = process.env.DATABASE_URL.replace('file:', '');
  const dbPath = path.resolve(__dirname, '../prisma', relativePath);
  process.env.DATABASE_URL = `file:${dbPath}`;
}

export const prisma = new PrismaClient();
