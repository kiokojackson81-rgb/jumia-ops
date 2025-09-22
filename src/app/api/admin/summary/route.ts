// src/app/api/admin/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [products, shops, attendants, orders] = await Promise.all([
      prisma.product.count(),
      prisma.shop.count(),
      prisma.attendant.count(),
      prisma.order.count(),
    ]);

    // group orders by status
    const byStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({
      ok: true,
      totals: {
        products,
        shops,
        attendants,
        orders,
      },
      ordersByStatus: byStatus.map((row) => ({
        status: row.status,
        count: row._count.status,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("summary error", err);
    return NextResponse.json({ ok: false, error: "Failed to load summary" }, { status: 500 });
  }
}
