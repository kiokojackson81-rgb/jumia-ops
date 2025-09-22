import { NextResponse } from "next/server";
export async function GET() {
  // Replace with prisma.return.count({ where: { status: "WAITING_PICKUP" } })
  return NextResponse.json({ count: 0 });
}
