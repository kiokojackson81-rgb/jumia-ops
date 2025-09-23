// If you want to use Next.js's built-in Response for JSON:
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Hook your real query here when ready.
export async function GET() {
  const rows: Array<{ id: number; productName: string }> = [];
  return NextResponse.json({ count: rows.length, rows });
}
