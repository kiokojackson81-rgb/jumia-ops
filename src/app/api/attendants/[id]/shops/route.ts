import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const rows = await prisma.attendantShop.findMany({ where: { attendantId: id }, include: { shop: true } });
  return NextResponse.json(rows);
}

// PUT body: { shopIds: number[] }
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await req.json().catch(() => null);
  const shopIds: number[] = Array.isArray(b?.shopIds) ? b.shopIds.map(Number) : [];

  await prisma.attendantShop.deleteMany({ where: { attendantId: id } });
  await prisma.attendantShop.createMany({ data: shopIds.map(sid => ({ attendantId: id, shopId: sid })) });

  return NextResponse.json({ ok: true, shopIds });
}
