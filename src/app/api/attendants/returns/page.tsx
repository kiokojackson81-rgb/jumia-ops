"use client";

import { useEffect, useState } from "react";

type RetRow = {
  id: number;
  externalOrderId: string;
  productName: string;
  quantity: number;
  shop: { name: string };
  returnLocation?: string | null;
  updatedAt: string;
};

export default function AttendantReturns() {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [rows, setRows] = useState<RetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [qtyMap, setQtyMap] = useState<Record<number, string>>({});
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});
  const [photoMap, setPhotoMap] = useState<Record<number, File | null>>({});

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/attendant/returns?scope=${scope}`);
      const j = await r.json();
      setRows(j.items || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [scope]);

  async function confirmPick(orderId: number) {
    const qtyStr = qtyMap[orderId] || "";
    const qty = Number(qtyStr);
    if (!Number.isFinite(qty) || qty <= 0) return alert("Enter valid qty picked.");

    setSubmitting(orderId);
    try {
      const form = new FormData();
      form.set("qty", String(qty));
      form.set("notes", notesMap[orderId] || "");
      const ph = photoMap[orderId];
      if (ph) form.set("photo", ph);

      const r = await fetch(`/api/returns/${orderId}/pick`, {
        method: "POST",
        body: form,
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || "Failed to confirm pickup");
        return;
      }
      setQtyMap(s => ({ ...s, [orderId]: "" }));
      setNotesMap(s => ({ ...s, [orderId]: "" }));
      setPhotoMap(s => ({ ...s, [orderId]: null }));
      await load();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main style={wrap}>
      <header style={hdr}>
        <h1>Returns · Waiting to Pick</h1>
        <div style={{ display:"flex", gap:8 }}>
          <select value={scope} onChange={(e)=>setScope(e.target.value as any)} style={inputSmall}>
            <option value="mine">My Shops</option>
            <option value="all">All Shops</option>
          </select>
          <button onClick={load} disabled={loading} style={btn}>{loading ? "Refreshing…" : "Refresh"}</button>
        </div>
      </header>

      {loading ? <p>Loading…</p> : rows.length === 0 ? <p>No returns waiting.</p> : (
        <div style={{ display:"grid", gap:10 }}>
          {rows.map(r => (
            <div key={r.id} style={card}>
              <div style={{ fontWeight: 600 }}>{r.productName}</div>
              <small>Order #{r.externalOrderId} • Shop: {r.shop?.name ?? "-"} • Qty: {r.quantity}</small>
              <div style={{ color:"#374151", marginTop: 4 }}>Return location: {r.returnLocation ?? "—"}</div>

              <div style={{ display:"grid", gap:8, marginTop: 8 }}>
                <input
                  placeholder="Qty picked"
                  value={qtyMap[r.id] ?? ""}
                  onChange={(e)=>setQtyMap(s => ({ ...s, [r.id]: e.target.value }))}
                  style={input}
                  inputMode="numeric"
                />
                <input
                  placeholder="Notes (optional)"
                  value={notesMap[r.id] ?? ""}
                  onChange={(e)=>setNotesMap(s => ({ ...s, [r.id]: e.target.value }))}
                  style={input}
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e)=>setPhotoMap(s => ({ ...s, [r.id]: e.target.files?.[0] || null }))}
                  style={fileInput}
                />
                <button onClick={()=>confirmPick(r.id)} disabled={submitting === r.id} style={btn}>
                  {submitting === r.id ? "Saving…" : "Confirm Pickup"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const wrap: React.CSSProperties = { maxWidth: 720, margin: "16px auto", padding: "0 12px", fontFamily: "system-ui, sans-serif" };
const hdr: React.CSSProperties = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 };
const card: React.CSSProperties = { border:"1px solid #e5e7eb", borderRadius:8, padding:12, background:"#fff" };
const input: React.CSSProperties = { padding:10, border:"1px solid #d1d5db", borderRadius:8 };
const inputSmall: React.CSSProperties = { padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:8 };
const fileInput: React.CSSProperties = { padding: 6, border:"1px dashed #d1d5db", borderRadius:8, background:"#fafafa" };
const btn: React.CSSProperties = { padding:"10px 12px", borderRadius:8, border:"none", background:"#111827", color:"#fff" };
