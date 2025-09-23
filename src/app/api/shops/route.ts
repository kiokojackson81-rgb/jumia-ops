import { prisma } from "@/lib/prisma";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const shops = await prisma.shop.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return json({ shops });
}
