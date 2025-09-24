// src/app/api/attendants/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// If attendant IDs are numeric in your DB, set this to true
const NUMERIC_IDS = false;

function parseId(raw: string) {
  if (!raw) throw new Error("Invalid id");
  if (NUMERIC_IDS) {
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error("Invalid id");
    return n;
  }
  return raw; // string ids (uuid/cuid)
}

// GET /api/attendants/[id]
export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = parseId(context.params.id);
  const attendant = await prisma.attendant.findUnique({ where: { id: id as number } });
    if (!attendant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(attendant);
  } catch (err) {
    console.error("GET attendant failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/attendants/[id]
export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = parseId(context.params.id);
    const data = await req.json(); // validate to taste
  const updated = await prisma.attendant.update({ where: { id: id as number }, data });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("PATCH attendant failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/attendants/[id]
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseId(params.id);
    if (NUMERIC_IDS && typeof id !== "number") {
      throw new Error("Attendant ID must be a number");
    }
    await prisma.attendant.delete({ where: { id: id as number } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("DELETE attendant failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
