import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalize } from '@/lib/normalize';

// POST body: array of { name: string, slug?: string, price?: number, lastBuyingPrice?: number }
export async function POST(req: Request) {
  const rows: any[] = await req.json();

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: 'Expected an array of rows' }, { status: 400 });
  }

  for (const r of rows) {
    const name = normalize(String(r.name ?? ''));
    const slug =
      String(r.slug ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') || name.toLowerCase().replace(/\s+/g, '-');

    const price = Number(r.price ?? 0);
    const lastBuyingPrice = r.lastBuyingPrice == null ? undefined : Number(r.lastBuyingPrice);

    if (!name) continue;

    await prisma.product.upsert({
      where: { slug },
      update: { name, price, lastBuyingPrice },
      create: { name, slug, price, lastBuyingPrice },
    });
  }

  return NextResponse.json({ ok: true });
}
