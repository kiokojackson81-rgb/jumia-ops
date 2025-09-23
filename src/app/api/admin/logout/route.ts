import { NextResponse } from "next/server";

// Clear auth cookies / tokens (adapt names to your auth)
export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Example cookie clear:
  res.cookies.set("admin_token", "", { path: "/", httpOnly: true, maxAge: 0 });
  res.cookies.set("attendant_token", "", { path: "/", httpOnly: true, maxAge: 0 });
  return res;
}
