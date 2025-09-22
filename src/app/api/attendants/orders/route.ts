import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const code = u.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const att = await prisma.attendant.findUnique({
    where: { code },
    include: { shops: true },
  });
  if (!att || !att.active) return NextResponse.json({ error: "invalid attendant" }, { status: 403 });

  const shopIds = att.shops.map((s: { shopId: number }) => s.shopId);
  if (shopIds.length === 0) return NextResponse.json([]);

  const rows = await prisma.order.findMany({
    where: { shopId: { in: shopIds }, buyingPricePerUnit: null },
    orderBy: { orderedAt: "desc" },
  });
  return NextResponse.json(rows);
}
