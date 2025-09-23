// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // set to ['query','info','warn','error'] for verbose logs
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
