
"use client";
import { useEffect, useState } from "react";

type Item = { id: number; name: string };

async function safeJson(r: Response) {
  const txt = await r.text();
  try { return txt ? JSON.parse(txt) : []; } catch { return []; }
}

// This file contains React component code but is located in an API route directory.
// Move this code to a file under your `src/app/attendants/link/page.tsx` (or similar) path to use as a React page component.
// API route files should export handler functions (e.g., GET, POST) and not React components.

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}