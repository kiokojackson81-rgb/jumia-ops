import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

// TODO: replace with real session lookup
async function getAttendantId(): Promise<number | null> {
  return 1;
}

async function ensureDir(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function savePhotoIfAny(req: NextRequest, orderId: number): Promise<string | undefined> {
  // Supports multipart/form-data (recommended) and JSON (no photo).
  const ctype = req.headers.get("content-type") || "";
  if (!ctype.includes("multipart/form-data")) return undefined;

  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) return undefined;

  // Only allow small-ish images (<= 8MB) — tweak as needed
  if (file.size > 8 * 1024 * 1024) throw new Error("Photo too large (max 8MB)");

  const ext = (file.type?.split("/")[1] || "jpg").toLowerCase();
  const ts = Date.now();
  const rel = `/uploads/pickups/${orderId}-${ts}.${ext}`;
  const abs = path.join(process.cwd(), "public", rel);

  await ensureDir(path.dirname(abs));

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(abs, buf);

  return rel; // public-relative URL
}

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  const attendantId = await getAttendantId();
  if (!attendantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orderId = Number(params.orderId);
  if (!Number.isFinite(orderId)) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });

  const ctype = req.headers.get("content-type") || "";
  let qtyPicked = 0;
  let notes: string | undefined;
  let photoUrl: string | undefined;

  try {
    if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      qtyPicked = Number(form.get("qty"));
      notes = (() => {
        const n = form.get("notes");
        return typeof n === "string" && n.trim() ? n.trim().slice(0, 500) : undefined;
      })();
      photoUrl = await savePhotoIfAny(req, orderId);
    } else {
      const body = await req.json().catch(() => ({}));
      qtyPicked = Number(body.qty);
      notes = typeof body.notes === "string" ? body.notes.slice(0, 500) : undefined;
      // no photo in JSON mode
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid upload" }, { status: 400 });
  }

  if (!Number.isFinite(qtyPicked) || qtyPicked <= 0) {
    return NextResponse.json({ error: "qty must be a positive number" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "RETURNED" || order.pickStatus !== "WAITING") {
    return NextResponse.json({ error: "Order is not awaiting pickup" }, { status: 400 });
  }
  if (qtyPicked > order.quantity) {
    return NextResponse.json({ error: "Picked qty cannot exceed order qty" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.pickup.create({
      data: {
        orderId,
        attendantId,
        qtyPicked,
        notes,
        photoUrl, // may be undefined
      },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { pickStatus: "PICKED_UP" }, // or "RESTOCKED"
    }),
  ]);

  return NextResponse.json({ ok: true, photo: photoUrl ?? null });
}
