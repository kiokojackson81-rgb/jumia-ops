import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalize";

// TODO: replace with real Jumia API pull
async function fetchShopOrdersMock() {
  return [
    {
      externalOrderId: "ORD-" + Math.floor(Math.random() * 100000),
      productName: "Premier 3.2kW Inverter",
      quantity: 1,
      sellingPricePerUnit: 24999,
      orderedAt: new Date().toISOString(),
      jumiaProductUrl: "https://www.jumia.co.ke/some-product",
      status: "PLACED",
    },
  ];
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = Number(params.id);
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

  const pull = await fetchShopOrdersMock();
  const imported: any[] = [];

  for (const x of pull) {
    const slug = normalizeName(x.productName);
    const prod = await prisma.product.upsert({
      where: { slug },
      update: { name: x.productName },
      create: { slug, name: x.productName },
    });
    const autoPrice = prod.lastBuyingPrice ?? null;

    const order = await prisma.order.upsert({
      where: { externalOrderId_productSlug_shopId: { externalOrderId: x.externalOrderId, productSlug: slug, shopId } },
      update: {
        sellingPricePerUnit: x.sellingPricePerUnit,
        orderedAt: x.orderedAt ? new Date(x.orderedAt) : null,
        status: x.status,
      },
      create: {
        externalOrderId: x.externalOrderId,
        shopId,
        shopName: shop.name,
        productName: x.productName,
        productSlug: slug,
        quantity: x.quantity ?? 1,
        sellingPricePerUnit: x.sellingPricePerUnit,
        buyingPricePerUnit: autoPrice,
        orderedAt: x.orderedAt ? new Date(x.orderedAt) : null,
        status: x.status as any,
        jumiaProductUrl: x.jumiaProductUrl,
      },
    });

    imported.push(order);
  }

  return NextResponse.json({ imported: imported.length, orders: imported });
}
