// src/app/api/logout/route.ts
import { NextResponse } from "next/server";

/**
 * Add every cookie name your app uses for authentication/session here.
 * If a cookie is not set, clearing it is harmless.
 */
const AUTH_COOKIE_NAMES = [
  "admin_auth",      // your admin auth flag/token (from your notes)
  "admin_session",   // optional alt name if you use one
  "auth_token",      // optional bearer/jwt cookie if used
  // add others if needed, e.g. "next-auth.session-token"
];

function buildLogoutResponse(request: Request) {
  // If a browser is calling (Accept: text/html), redirect to a page.
  const wantsHTML = request.headers.get("accept")?.includes("text/html");
  const url = new URL(request.url);
  const redirectTarget = url.searchParams.get("redirect") || "/admin/login";

  const res = wantsHTML
    ? NextResponse.redirect(new URL(redirectTarget, request.url))
    : NextResponse.json({ ok: true, message: "Logged out" });

  // Expire all known auth cookies
  for (const name of AUTH_COOKIE_NAMES) {
    res.cookies.set({
      name,
      value: "",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0, // expire immediately
    });
  }

  return res;
}

export async function POST(request: Request) {
  return buildLogoutResponse(request);
}

// Optional: allow simple GET /api/logout (e.g., from an <a> link)
export const GET = POST;
