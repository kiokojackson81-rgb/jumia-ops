import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const shops = await prisma.shop.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(shops);
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.apiKey || !b?.apiSecret) {
    return NextResponse.json({ error: "name, apiKey, apiSecret required" }, { status: 400 });
  }
  const shop = await prisma.shop.create({ data: { name: b.name, apiKey: b.apiKey, apiSecret: b.apiSecret } });
  return NextResponse.json(shop, { status: 201 });
}
