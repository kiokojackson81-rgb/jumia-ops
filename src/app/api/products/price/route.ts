import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/normalize";

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const name = u.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const slug = normalizeName(name);
  const p = await prisma.product.findUnique({ where: { slug } });
  if (!p || p.lastBuyingPrice == null) return NextResponse.json({ found: false });
  return NextResponse.json({ found: true, lastPrice: p.lastBuyingPrice });
}
