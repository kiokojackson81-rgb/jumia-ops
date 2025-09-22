import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET() {
  const orders = await prisma.order.findMany({
    select: { id: true, status: true },
    orderBy: { id: 'desc' },
    take: 50,
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  // allow a few common forms of status text
  const raw = String(body.status ?? '').toUpperCase();
  const allowed = new Set(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']);
  const status = (allowed.has(raw) ? raw : 'PENDING') as OrderStatus;

  const order = await prisma.order.create({
    data: { status },
  });

  return NextResponse.json(order, { status: 201 });
}
