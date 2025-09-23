import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  // Hook your real count here.
  const count = 0;
  return json({ count });
}
