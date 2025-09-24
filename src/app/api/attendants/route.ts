// src/app/api/attendants/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

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

export async function DELETE(req: Request) {
  try {
    const { id } = (await req.json().catch(() => ({} as any))).params;
    if (!id || (typeof id !== "string" && typeof id !== "number")) {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
    }
    const numericId = typeof id === "string" ? Number(id) : id;
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ error: "ID must be a number" }, { status: 400 });
    }
    await prisma.attendant.delete({ where: { id: numericId } });
    return NextResponse.json({ message: "Attendant deleted" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete attendant" }, { status: 500 });
  }
}
