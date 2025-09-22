// src/app/api/attendants/pending/route.ts
import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma"; // when your schema is final

export async function GET() {
  try {
    // 1) If you already have Prisma & a proper schema, do your real query here.
    //    Keep the returned shape as { rows: [...] } so the UI doesn't change.
    //
    // const orders = await prisma.order.findMany({
    //   where: { status: "PENDING_PRICE" },
    //   select: {
    //     id: true,
    //     quantity: true,
    //     product: { select: { name: true, slug: true } },
    //   },
    //   orderBy: { id: "desc" },
    // });
    // const rows = orders.map(o => ({
    //   orderId: o.id,
    //   product: o.product?.name ?? "—",
    //   qty: o.quantity ?? 0,
    // }));

    // 2) Temporary safe placeholder so the page never 500s:
    const rows: Array<{ orderId: number; product: string; qty: number }> = [];
    return NextResponse.json({ rows });
  } catch (err) {
    console.error("pending pricing error:", err);
    return NextResponse.json(
      { error: "Failed to load pending pricing", rows: [] },
      { status: 200 } // return 200 with empty rows so UI still renders
    );
  }
}
