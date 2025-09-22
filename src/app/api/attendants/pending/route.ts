import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInCurrentWeekEAT } from "@/lib/week";

// TODO: replace with real session scoping
async function getAttendantShopIds(): Promise<number[]> {
  return [1]; // mock; list of shopIds assigned to this attendant
}

export async function GET() {
  const shopIds = await getAttendantShopIds();
  if (shopIds.length === 0) return NextResponse.json({ pending: [], editable: [] });

  const orders = await prisma.order.findMany({
    where: { shopId: { in: shopIds } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const pending = orders.filter((o) => !o.buyingPricePerUnit);
  const editable = orders
    .filter((o) => o.buyingPricePerUnit != null)
    .map((o) => ({
      ...o,
      editableThisWeek: isInCurrentWeekEAT(o.updatedAt ?? o.createdAt),
    }));

  return NextResponse.json({ pending, editable });
}
