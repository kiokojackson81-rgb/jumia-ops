import { NextResponse } from "next/server";
export async function GET() {
  // Return empty summary to keep UI stable
  return NextResponse.json({ rows: [] });
}
