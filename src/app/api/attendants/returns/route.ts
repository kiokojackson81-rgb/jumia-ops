import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: replace with real session scoping & permission (allShops optional)
async function getAttendantShopIds(): Promise<number[]> {
  return [1];
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const scope = u.searchParams.get("scope") || "mine"; // "mine" | "all"
  const shopIds = await getAttendantShopIds();

  const where: any = { status: "RETURNED", pickStatus: "WAITING" };
  if (scope !== "all") where.shopId = { in: shopIds };

  const items = await prisma.order.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      externalOrderId: true,
      productName: true,
      quantity: true,
      shopId: true,
      shop: { select: { name: true } },
      returnLocation: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
