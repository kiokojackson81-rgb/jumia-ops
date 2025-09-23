// src/lib/api.ts
import { NextResponse } from "next/server";

/** Return a JSON response with status (defaults to 200). */
export function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

/** Optional: allow overriding API base for admin via localStorage string. */
export function apiBase(): string {
  // On server we don’t have window; same-origin by default
  if (typeof window === "undefined") return "";
  const v = localStorage.getItem("adminApiBase") || "";
  return v.endsWith("/") ? v.slice(0, -1) : v;
}

/** Client-side GET helper (no SSR). */
export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json() as Promise<T>;
}

/** Client-side POST helper (no SSR). */
export async function postJson<T>(path: string, body: any, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) throw new Error(`POST ${path} ${res.status}`);
  return res.json() as Promise<T>;
}
