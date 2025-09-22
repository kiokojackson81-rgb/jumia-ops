import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  const expected = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== expected) {
    return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin', '1', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 });
  return res;
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}
