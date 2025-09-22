// src/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = NextResponse.redirect(new URL('/login', base));
  // Clear your auth cookie/session here — example cookie name 'auth'
  res.cookies.set('auth', '', { path: '/', httpOnly: true, maxAge: 0 });
  return res;
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
