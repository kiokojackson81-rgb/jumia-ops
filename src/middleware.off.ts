// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let API routes pass through
  if (pathname.startsWith("/api")) return NextResponse.next();

  // Example: protect /admin, require cookie "admin_token"
  const isAdmin = req.cookies.get("admin_token")?.value;

  if (pathname.startsWith("/admin") && !isAdmin && pathname !== "/admin/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";            // <-- PAGE path
    url.searchParams.set("next", pathname);   // send users back after login
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
