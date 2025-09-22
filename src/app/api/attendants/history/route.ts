import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { weekBoundsEAT } from "@/lib/week";

// TODO: real session
async function getAttendantId(): Promise<number | null> {
  return 1;
}

export async function GET() {
  const attendantId = await getAttendantId();
  if (!attendantId) return NextResponse.json({ pricing: [], pickups: [] });

  const { weekStartUtc, weekEndUtc } = weekBoundsEAT();

  const pricing = await prisma.priceChange.findMany({
    where: {
      attendantId,
      createdAt: { gte: weekStartUtc, lte: weekEndUtc },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const pickups = await prisma.pickup.findMany({
    where: {
      attendantId,
      createdAt: { gte: weekStartUtc, lte: weekEndUtc },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { order: { select: { externalOrderId: true, productName: true, shopId: true } } },
  });

  return NextResponse.json({ pricing, pickups });
}
