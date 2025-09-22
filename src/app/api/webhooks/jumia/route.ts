import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SHARED = process.env.JUMIA_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  if (!SHARED) return NextResponse.json({ error: "JUMIA_WEBHOOK_SECRET not set" }, { status: 500 });

  const auth = req.headers.get("x-webhook-secret") || "";
  if (auth !== SHARED) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Expected payload example:
  // {
  //   "externalOrderId": "ORD-12345",
  //   "productSlug": "12v 200ah deep cycle battery",
  //   "status": "DELIVERED",  // or RETURNED, OFD, ...
  //   "refundAmount": 13200   // optional when RETURNED
  // }
  const body = await req.json().catch(() => null);
  if (!body?.externalOrderId || !body?.productSlug || !body?.status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const data: any = { status: String(body.status).toUpperCase() };
  if (body.refundAmount != null) data.refundAmount = Number(body.refundAmount);

  // Update all matching lines for that order+product (shop is already unique in your model key)
  await prisma.order.updateMany({
    where: { externalOrderId: body.externalOrderId, productSlug: body.productSlug },
    data,
  });

  return NextResponse.json({ ok: true });
}
