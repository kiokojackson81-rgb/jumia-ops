// src/app/api/reports/summary/route.ts
import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET() {
  try {
    const [products, shops, attendants, orders] = await Promise.all([
      prisma.product.count(),
      prisma.shop.count(),
      prisma.attendant.count(),
      prisma.order.count(),
    ]);

    return json({
      products,
      shops,
      attendants,
      orders,
      revenueThisWeek: 0,
      buyingThisWeek: 0,
      profitThisWeek: 0,
      returnsWaitingPickup: 0,
    });
  } catch (err) {
    console.error("GET /api/reports/summary failed:", err);
    return json({ error: "Internal error" }, 500);
  }
}
