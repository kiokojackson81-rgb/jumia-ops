import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalize";

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const shopId = u.searchParams.get("shopId") ? Number(u.searchParams.get("shopId")) : undefined;
  const pendingPrice = u.searchParams.get("pendingPrice") === "1";
  const status = u.searchParams.get("status") as any | null;

  const where: any = {};
  if (shopId) where.shopId = shopId;
  if (pendingPrice) where.buyingPricePerUnit = null;
  if (status) where.status = status;

  const rows = await prisma.order.findMany({ where, orderBy: { orderedAt: "desc" } });
  return NextResponse.json(rows);
}

// manual ingest (useful for testing)
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const shop = await prisma.shop.findUnique({ where: { id: b?.shopId } });
  if (!shop) return NextResponse.json({ error: "shopId invalid" }, { status: 400 });

  const slug = normalizeName(b.productName);
  const prod = await prisma.product.upsert({
    where: { slug },
    update: { name: b.productName },
    create: { slug, name: b.productName },
  });

  const autoPrice = prod.lastBuyingPrice ?? null;
  const order = await prisma.order.create({
    data: {
      externalOrderId: b.externalOrderId,
      shopId: shop.id,
      shopName: shop.name,
      productName: b.productName,
      productSlug: slug,
      quantity: b.quantity ?? 1,
      sellingPricePerUnit: b.sellingPricePerUnit ?? null,
      buyingPricePerUnit: autoPrice,
      orderedAt: b.orderedAt ? new Date(b.orderedAt) : null,
      status: (b.status ?? "PLACED") as any,
      jumiaProductUrl: b.jumiaProductUrl ?? "",
      attendantCode: b.attendantCode ?? null,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
