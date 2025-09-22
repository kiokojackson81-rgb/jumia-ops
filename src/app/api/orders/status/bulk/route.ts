import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STATUSES = new Set([
  "PLACED",
  "CONFIRMED",
  "PACKING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
]);

export async function PATCH(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const ids: number[] = Array.isArray(b?.ids) ? b.ids.map(Number).filter(Number.isFinite) : [];
  const status = String(b?.status || "").toUpperCase();

  if (ids.length === 0) return NextResponse.json({ error: "ids[] required" }, { status: 400 });
  if (!STATUSES.has(status)) return NextResponse.json({ error: "invalid status" }, { status: 400 });

  await prisma.order.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return NextResponse.json({ ok: true, count: ids.length, status });
}
