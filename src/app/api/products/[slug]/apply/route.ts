import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || product.lastBuyingPrice == null) {
    return NextResponse.json({ error: "Product not found or lastBuyingPrice missing" }, { status: 400 });
  }

  const price = product.lastBuyingPrice;

  // Update any orders for this product that do not have buyingPricePerUnit
  const res = await prisma.order.updateMany({
    where: {
      productSlug: slug,
      OR: [{ buyingPricePerUnit: null }, { buyingPricePerUnit: { equals: 0 } }],
    },
    data: { buyingPricePerUnit: price },
  });

  return NextResponse.json({ ok: true, updated: res.count, appliedPrice: price });
}
