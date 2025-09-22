import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await req.json().catch(() => null);
  const shop = await prisma.shop.update({
    where: { id },
    data: { name: b?.name, apiKey: b?.apiKey, apiSecret: b?.apiSecret },
  });
  return NextResponse.json(shop);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.shop.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
