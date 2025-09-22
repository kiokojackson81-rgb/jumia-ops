import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Accepted statuses — keep in sync with your schema enum
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json().catch(() => ({} as any));

  const data: any = {};
  // 1) buying price update (attendant/admin pricing)
  if (body.buyingPricePerUnit != null) {
    const price = Number(body.buyingPricePerUnit);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "buyingPricePerUnit must be a positive number" }, { status: 400 });
    }
    data.buyingPricePerUnit = price;
  }

  // 2) status update (admin ops)
  if (body.status != null) {
    const status = String(body.status).toUpperCase();
    if (!STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }

  // 3) optional orderedAt correction (rare but useful)
  if (body.orderedAt != null) {
    const when = new Date(body.orderedAt);
    if (isNaN(when.getTime())) {
      return NextResponse.json({ error: "orderedAt must be an ISO date" }, { status: 400 });
    }
    data.orderedAt = when;
  }

  // 4) optional refund amount (used when marking RETURNED)
  if (body.refundAmount != null) {
    const ra = Number(body.refundAmount);
    if (!Number.isFinite(ra) || ra < 0) {
      return NextResponse.json({ error: "refundAmount must be a positive number" }, { status: 400 });
    }
    data.refundAmount = ra;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Update order
  const order = await prisma.order.update({ where: { id }, data });

  // If buying price changed, learn it to Product.lastBuyingPrice
  if (data.buyingPricePerUnit != null) {
    await prisma.product.update({
      where: { slug: order.productSlug },
      data: { lastBuyingPrice: data.buyingPricePerUnit },
    }).catch(async () => {
      // Upsert safety in case product record was missing (shouldn’t happen)
      await prisma.product.upsert({
        where: { slug: order.productSlug },
        update: { lastBuyingPrice: data.buyingPricePerUnit, name: order.productName },
        create: { slug: order.productSlug, name: order.productName, lastBuyingPrice: data.buyingPricePerUnit },
      });
    });
  }

  return NextResponse.json(order);
}
