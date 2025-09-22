import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isInCurrentWeekEAT } from "@/lib/week";

// TODO: replace with real session lookup; must return attendantId
async function getAttendantId(): Promise<number | null> {
  return 1; // mock for now
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const attendantId = await getAttendantId();
  if (!attendantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const nextPrice = Number(body.buyingPricePerUnit);
  const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;
  if (!Number.isFinite(nextPrice) || nextPrice < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { product: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // (optional) verify attendant is assigned to order.shopId

  const lastChange = await prisma.priceChange.findFirst({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
  });

  const canEditThisWeek = !lastChange ? true : isInCurrentWeekEAT(lastChange.createdAt);
  if (!canEditThisWeek) {
    return NextResponse.json(
      { error: "Edit window closed. Buying price can only be modified within the current week (Mon–Sun, EAT)." },
      { status: 403 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { buyingPricePerUnit: nextPrice, attendantId },
  });

  await prisma.priceChange.create({
    data: {
      orderId: order.id,
      productSlug: order.productSlug,
      oldPrice: order.buyingPricePerUnit ?? null,
      newPrice: nextPrice,
      attendantId,
      reason,
    },
  });

  await prisma.product.upsert({
    where: { slug: order.productSlug },
    update: { lastBuyingPrice: nextPrice, name: order.productName },
    create: { slug: order.productSlug, name: order.productName, lastBuyingPrice: nextPrice },
  });

  return NextResponse.json(updated);
}
