// src/app/api/attendants/[id]/route.ts
import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await req.json().catch(() => null);

  const att = await prisma.attendant.update({
    where: { id },
    data: { 
      name: b?.name, 
      code: b?.code, 
      active: b?.active 
    },
  });

  return NextResponse.json(att);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  try {
    await prisma.attendant.delete({ where: { id } });
    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/attendants/[id] failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to delete" }, { status: 500 });
  }
}
