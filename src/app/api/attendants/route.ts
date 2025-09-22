// src/app/api/attendants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attendants = await prisma.attendant.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(attendants);
  } catch {
    return NextResponse.json({ error: "Failed to load attendants" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json().catch(() => ({} as any));
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const created = await prisma.attendant.create({ data: { name } });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create attendant" }, { status: 500 });
  }
}
