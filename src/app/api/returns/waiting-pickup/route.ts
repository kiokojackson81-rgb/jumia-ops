import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ count: 0 }); // replace with real DB count later
}
