// src/app/api/reports/weekly/route.ts
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json } from "@/lib/api";

export async function GET(_req: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      select: { id: true, status: true },
      orderBy: { id: "desc" },
    });

    const rows = orders.map((o) => ({
      id: o.id,
      status: o.status,
      // createdAt removed intentionally (not in schema yet)
    }));

    return json({ rows, total: rows.length });
  } catch (err) {
    console.error("GET /api/reports/weekly failed:", err);
    return json({ error: "Internal error" }, 500);
  }
}
