import { NextResponse } from "next/server";
export async function POST(req: Request) {
  // accept payload and return ok (wire to real logic later)
  await req.json();
  return NextResponse.json({ ok: true });
}
