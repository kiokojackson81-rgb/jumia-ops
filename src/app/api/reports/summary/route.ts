import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mondayOfWeek(d: Date) {
  const x = new Date(d);
  const diff = (x.getDay() + 6) % 7; // make Monday start
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const shopId = u.searchParams.get("shopId")
    ? Number(u.searchParams.get("shopId"))
    : undefined;

  // fetch orders
  const orders = await prisma.order.findMany({
    where: shopId ? { shopId } : {},
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  // group by Monday–Sunday
  const grouped: Record<string, any> = {};
  for (const o of orders) {
    const weekStart = mondayOfWeek(o.createdAt);
    const key = weekStart.toISOString().split("T")[0];

    if (!grouped[key]) {
      grouped[key] = {
        weekStart,
        weekEnd: new Date(weekStart.getTime() + 6 * 86400000),
        orders: 0,
        units: 0,
        sales: 0,
        cost: 0,
        returns: 0,
        ofd: 0,
      };
    }

    grouped[key].orders += 1;
    grouped[key].units += o.quantity;
    grouped[key].sales += o.price * o.quantity;

    const cost = (o.product?.lastBuyingPrice || 0) * o.quantity;
    grouped[key].cost += cost;

    if (o.status === "Returned") grouped[key].returns += 1;
    if (o.status === "OFD") grouped[key].ofd += 1;
  }

  return NextResponse.json(
    Object.values(grouped).map((g: any) => ({
      weekStart: g.weekStart,
      weekEnd: g.weekEnd,
      orders: g.orders,
      units: g.units,
      sales: g.sales,
      cost: g.cost,
      profit: g.sales - g.cost,
      returns: g.returns,
      ofd: g.ofd,
    }))
  );
}
