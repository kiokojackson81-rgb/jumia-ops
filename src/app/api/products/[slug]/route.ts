import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const { name, lastBuyingPrice } = await req.json().catch(() => ({}));

  const data: any = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (lastBuyingPrice != null) {
    const v = Number(lastBuyingPrice);
    if (!Number.isFinite(v) || v < 0) {
      return NextResponse.json({ error: "lastBuyingPrice must be a positive number" }, { status: 400 });
    }
    data.lastBuyingPrice = v;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const p = await prisma.product.update({
    where: { slug },
    data,
  });

  return NextResponse.json(p);
}
