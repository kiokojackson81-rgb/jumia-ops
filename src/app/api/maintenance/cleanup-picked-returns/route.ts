import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

const DEFAULT_DAYS = 30;

function cutoffDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function safeUnlink(publicRelPath: string) {
  try {
    if (!publicRelPath.startsWith("/uploads/pickups/")) return;
    const abs = path.join(process.cwd(), "public", publicRelPath);
    await fs.unlink(abs).catch(() => {});
  } catch {}
}

export async function POST(req: NextRequest) {
  // Optional: add simple admin secret header if you want to protect this endpoint
  const daysParam = Number((await req.json().catch(()=>({})))?.days ?? NaN);
  const days = Number.isFinite(daysParam) && daysParam > 0 ? daysParam : (Number(process.env.RETURNS_CLEANUP_MAX_DAYS) || DEFAULT_DAYS);
  const threshold = cutoffDate(days);

  // Find pickups older than threshold
  const oldPickups = await prisma.pickup.findMany({
    where: { createdAt: { lt: threshold } },
    select: { id: true, photoUrl: true, orderId: true },
  });

  if (oldPickups.length === 0) {
    return NextResponse.json({ ok: true, deletedPickups: 0, deletedOrders: 0 });
  }

  const orderIds = [...new Set(oldPickups.map(p => p.orderId))];

  // For orders that are RETURNED + PICKED_UP, delete them
  const deletableOrders = await prisma.order.findMany({
    where: {
      id: { in: orderIds },
      status: "RETURNED",
      pickStatus: "PICKED_UP",
    },
    select: { id: true },
  });
  const deletableOrderIds = deletableOrders.map(o => o.id);

  // Delete photos first (best-effort)
  await Promise.all(oldPickups.map(p => p.photoUrl ? safeUnlink(p.photoUrl) : Promise.resolve()));

  // Delete pickups older than threshold
  const delPickups = await prisma.pickup.deleteMany({
    where: { id: { in: oldPickups.map(p => p.id) } },
  });

  // Then delete orders that qualify
  const delOrders = deletableOrderIds.length
    ? await prisma.order.deleteMany({ where: { id: { in: deletableOrderIds } } })
    : { count: 0 };

  return NextResponse.json({
    ok: true,
    deletedPickups: delPickups.count,
    deletedOrders: delOrders.count,
    days,
  });
}
