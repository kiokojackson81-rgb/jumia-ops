"use client";

import { useEffect, useState } from "react";

type PriceChange = {
  id: number;
  orderId: number;
  productSlug: string;
  oldPrice: number | null;
  newPrice: number;
  reason?: string | null;
  createdAt: string;
};
type Pickup = {
  id: number;
  orderId: number;
  qtyPicked: number;
  notes?: string | null;
  createdAt: string;
  order?: { externalOrderId: string; productName: string } | null;
};

export default function AttendantHistory() {
  const [pricing, setPricing] = useState<PriceChange[]>([]);
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/attendant/history");
      const j = await r.json();
      setPricing(j.pricing || []);
      setPickups(j.pickups || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <main style={wrap}>
      <header style={hdr}>
        <h1>My History (This Week)</h1>
        <button onClick={load} disabled={loading} style={btn}>{loading ? "Refreshing…" : "Refresh"}</button>
      </header>

      <section style={{ display:"grid", gap:12 }}>
        <div>
          <h3>Price Changes</h3>
          {pricing.length === 0 ? <p style={{ color:"#6b7280" }}>None</p> : (
            <div style={{ display:"grid", gap:8 }}>
              {pricing.map(p => (
                <div key={p.id} style={card}>
                  <div><b>Order:</b> #{p.orderId} • <b>Product:</b> {p.productSlug}</div>
                  <div><b>New:</b> {p.newPrice} {p.oldPrice != null && <span> • <b>Old:</b> {p.oldPrice}</span>}</div>
                  {!!p.reason && <div><b>Reason:</b> {p.reason}</div>}
                  <small>{new Date(p.createdAt).toISOString().replace("T"," ").slice(0,16)}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>Pickups</h3>
          {pickups.length === 0 ? <p style={{ color:"#6b7280" }}>None</p> : (
            <div style={{ display:"grid", gap:8 }}>
              {pickups.map(k => (
                <div key={k.id} style={card}>
                  <div><b>Order:</b> #{k.order?.externalOrderId ?? k.orderId} • <b>Product:</b> {k.order?.productName ?? "-"}</div>
                  <div><b>Qty Picked:</b> {k.qtyPicked}</div>
                  {!!k.notes && <div><b>Notes:</b> {k.notes}</div>}
                  <small>{new Date(k.createdAt).toISOString().replace("T"," ").slice(0,16)}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const wrap: React.CSSProperties = { maxWidth: 720, margin: "16px auto", padding: "0 12px", fontFamily: "system-ui, sans-serif" };
const hdr: React.CSSProperties = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 };
const card: React.CSSProperties = { border:"1px solid #e5e7eb", borderRadius:8, padding:12, background:"#fff" };
const btn: React.CSSProperties = { padding:"10px 12px", borderRadius:8, border:"none", background:"#111827", color:"#fff" };
