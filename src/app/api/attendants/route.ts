import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.attendant.findMany({
    include: { shops: { include: { shop: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !b?.code) return NextResponse.json({ error: "name, code required" }, { status: 400 });
  const att = await prisma.attendant.create({ data: { name: b.name, code: b.code } });
  return NextResponse.json(att, { status: 201 });
}
