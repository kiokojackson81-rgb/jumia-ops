// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Next.js hot-reload safe singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // uncomment if you want logs
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
