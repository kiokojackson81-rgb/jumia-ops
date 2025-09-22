import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function mondayOfWeek(d: Date) {
  const x = new Date(d);
  const dow = x.getDay(); // 0=Sun .. 6=Sat
  const diff = (dow + 6) % 7; // Monday=0
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sundayOfWeek(monday: Date) {
  const s = new Date(monday);
  s.setDate(s.getDate() + 6);
  s.setHours(23, 59, 59, 999);
  return s;
}

const S_DELIVERED = "DELIVERED";
const S_RETURNED = "RETURNED";
const S_OFD = "OUT_FOR_DELIVERY";
const PIPELINE = new Set(["PLACED","CONFIRMED","PACKING","SHIPPED"]);

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const shopId = u.searchParams.get("shopId") ? Number(u.searchParams.get("shopId")) : undefined;
  const from = u.searchParams.get("from") ? new Date(u.searchParams.get("from")!) : undefined;
  const to = u.searchParams.get("to") ? new Date(u.searchParams.get("to")!) : undefined;

  const where: any = {};
  if (shopId) where.shopId = shopId;
  if (from || to) {
    where.orderedAt = {};
    if (from) where.orderedAt.gte = from;
    if (to) where.orderedAt.lte = to;
  }

  const rows = await prisma.order.findMany({
    where,
    select: {
      quantity: true,
      sellingPricePerUnit: true,
      buyingPricePerUnit: true,
      status: true,
      orderedAt: true,
      refundAmount: true,
    },
    orderBy: { orderedAt: "asc" },
  });

  type Row = {
    key: string;
    weekStart: string;
    weekEnd: string;
    lines: number;
    units: number;
    deliveredUnits: number;
    revenueDelivered: number;
    costDelivered: number;
    profitDelivered: number;
    returnsUnits: number;
    returnsValue: number;   // uses refundAmount if present, else selling*qty
    netRevenueDelivered: number; // revenueDelivered - returnsValue
    ofdUnits: number;
    pipelineUnits: number;
  };

  const map = new Map<string, Row>();

  for (const r of rows) {
    const dt = r.orderedAt ? new Date(r.orderedAt) : new Date();
    const mon = mondayOfWeek(dt);
    const sun = sundayOfWeek(mon);
    const key = mon.toISOString().slice(0, 10);

    if (!map.has(key)) {
      map.set(key, {
        key,
        weekStart: mon.toISOString(),
        weekEnd: sun.toISOString(),
        lines: 0,
        units: 0,
        deliveredUnits: 0,
        revenueDelivered: 0,
        costDelivered: 0,
        profitDelivered: 0,
        returnsUnits: 0,
        returnsValue: 0,
        netRevenueDelivered: 0,
        ofdUnits: 0,
        pipelineUnits: 0,
      });
    }

    const b = map.get(key)!;
    const qty = r.quantity ?? 1;
    const sell = r.sellingPricePerUnit ?? 0;
    const cost = r.buyingPricePerUnit ?? 0;

    b.lines += 1;
    b.units += qty;

    if (r.status === S_DELIVERED) {
      b.deliveredUnits += qty;
      b.revenueDelivered += sell * qty;
      b.costDelivered += cost * qty;
      if (r.sellingPricePerUnit != null && r.buyingPricePerUnit != null) {
        b.profitDelivered += (sell - cost) * qty;
      }
    } else if (r.status === S_RETURNED) {
      b.returnsUnits += qty;
      const refund = r.refundAmount != null ? r.refundAmount : sell * qty;
      b.returnsValue += refund;
    } else if (r.status === S_OFD) {
      b.ofdUnits += qty;
    } else if (PIPELINE.has(r.status as string)) {
      b.pipelineUnits += qty;
    }
  }

  // compute net
  for (const b of map.values()) {
    b.netRevenueDelivered = Math.max(0, b.revenueDelivered - b.returnsValue);
  }

  return NextResponse.json({
    shopId: shopId ?? null,
    rows: Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key)),
  });
}
