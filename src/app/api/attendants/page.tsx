import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.attendant.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ ok: false }, { status: 400 });
  const created = await prisma.attendant.create({ data: { name: String(name).trim() } });
  return NextResponse.json({ ok: true, id: created.id });
}
