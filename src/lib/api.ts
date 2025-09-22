// src/lib/api.ts
export function apiBase(): string {
  if (typeof window !== "undefined") {
    return (localStorage.getItem("adminApiBase") || "").replace(/\/$/, "");
  }
  return "";
}

export async function getJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, { ...init, headers: { ...(init?.headers || {}) } });
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function postJson<T = any>(path: string, body: any, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    ...init,
  });
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}
