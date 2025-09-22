// src/app/admin/shops/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/api";

type Shop = { id: number; name: string };

export default function ShopsPage() {
  const [list, setList] = useState<Shop[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await getJson<{ rows: Shop[] }>("/api/shops");
      setList(r?.rows ?? []);
    } catch {
      setMsg("Failed to load shops");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      await postJson("/api/shops", { name });
      setName("");
      await load();
    } catch {
      setMsg("Failed to create shop");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shops</h1>
        <button onClick={load} className="rounded-md bg-muted px-3 py-1.5 text-sm">Refresh</button>
      </header>

      <div className="rounded-xl bg-card p-5 ring-1 ring-border space-y-3">
        <p className="text-sm font-medium">Create Shop</p>
        <div className="flex gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shop name" className="w-full rounded-md bg-background px-3 py-2 ring-1 ring-border" />
          <button onClick={create} disabled={loading} className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60">Add</button>
        </div>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">No shops yet.</td>
              </tr>
            ) : list.map(s => (
              <tr key={s.id} className="border-t border-border/70">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3">{s.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
