import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  // Hook your real query here when ready.
  const rows: Array<{ id: number; productName: string }> = [];
  return json({ count: rows.length, rows });
}
