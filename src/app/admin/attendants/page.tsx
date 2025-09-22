// src/app/admin/attendants/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/api";

type Attendant = { id: number; name: string };
type Shop = { id: number; name: string };

export default function AttendantsPage() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [newName, setNewName] = useState("");
  const [selAtt, setSelAtt] = useState<number | "">("");
  const [selShop, setSelShop] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const [a, s] = await Promise.all([
        getJson<{ rows: Attendant[] }>("/api/attendants"),
        getJson<{ rows: Shop[] }>("/api/shops"),
      ]);
      setAttendants(a?.rows ?? []);
      setShops(s?.rows ?? []);
    } catch {
      setMsg("Failed to load data");
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createAttendant() {
    if (!newName.trim()) return;
    setLoading(true);
    setMsg(null);
    try {
      await postJson("/api/attendants", { name: newName.trim() });
      setNewName("");
      await load();
    } catch {
      setMsg("Failed to create attendant");
    }
    setLoading(false);
  }

  async function link() {
    if (!selAtt || !selShop) return;
    setLoading(true);
    setMsg(null);
    try {
      await postJson("/api/attendant-shops", { attendantId: selAtt, shopId: selShop });
      setSelAtt("");
      setSelShop("");
      await load();
    } catch {
      setMsg("Failed to link attendant to shop");
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Attendants</h1>
        <button onClick={load} className="rounded-md bg-muted px-3 py-1.5 text-sm">Refresh</button>
      </header>

      <div className="rounded-xl bg-card p-5 ring-1 ring-border space-y-3">
        <p className="text-sm font-medium">Create Attendant</p>
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Attendant name" className="w-full rounded-md bg-background px-3 py-2 ring-1 ring-border" />
          <button onClick={createAttendant} disabled={loading} className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60">Add</button>
        </div>
        {msg && <p className="text-sm text-red-400">{msg}</p>}
      </div>

      <div className="rounded-xl bg-card p-5 ring-1 ring-border space-y-3">
        <p className="text-sm font-medium">Link Attendant ↔ Shop</p>
        <div className="flex gap-2">
          <select value={selAtt} onChange={(e) => setSelAtt(Number(e.target.value) || "")} className="w-full rounded-md bg-background px-3 py-2 ring-1 ring-border">
            <option value="">Select attendant…</option>
            {attendants.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={selShop} onChange={(e) => setSelShop(Number(e.target.value) || "")} className="w-full rounded-md bg-background px-3 py-2 ring-1 ring-border">
            <option value="">Select shop…</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={link} disabled={loading || !selAtt || !selShop} className="rounded-md bg-foreground px-4 py-2 text-background disabled:opacity-60">Link</button>
        </div>
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
            {attendants.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">No attendants yet.</td>
              </tr>
            ) : attendants.map(a => (
              <tr key={a.id} className="border-t border-border/70">
                <td className="px-4 py-3">{a.id}</td>
                <td className="px-4 py-3">{a.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
