import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  const orders = await prisma.order.findMany({
    select: { id: true, status: true },
    orderBy: { id: 'desc' },
    take: 500,
  });

  const byStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return NextResponse.json({
    total: orders.length,
    byStatus,
  });
}
