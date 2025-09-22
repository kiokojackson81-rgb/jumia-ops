import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { attendantId, shopId } = await req.json();
  if (!attendantId || !shopId) return NextResponse.json({ ok: false }, { status: 400 });
  await prisma.attendantShop.upsert({
    where: { attendantId_shopId: { attendantId, shopId } },
    update: {},
    create: { attendantId, shopId },
  });
  return NextResponse.json({ ok: true });
}
