import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const q = (u.searchParams.get("q") || "").trim();

  // Basic search by name or slug
  const where: any = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  // Fetch products
  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
    take: 200, // keep UI snappy
  });

  // For each product, count unpriced orders
  const slugs = products.map((p) => p.slug);
  const unpricedBySlug = await prisma.order.groupBy({
    by: ["productSlug"],
    where: {
      productSlug: { in: slugs },
      OR: [{ buyingPricePerUnit: null }, { buyingPricePerUnit: { equals: 0 } }],
    },
    _count: { productSlug: true },
  });

  const map = new Map(unpricedBySlug.map((g) => [g.productSlug, g._count.productSlug]));

  const items = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    lastBuyingPrice: p.lastBuyingPrice,
    ordersUnpriced: map.get(p.slug) || 0,
  }));

  return NextResponse.json({ items });
}
