"use client";

import { useEffect, useMemo, useState } from "react";

type Shop = { id: number; name: string };
type Order = {
  id: number;
  externalOrderId: string;
  shopId: number;
  shopName: string;
  productName: string;
  quantity: number;
  sellingPricePerUnit: number | null;
  buyingPricePerUnit: number | null;
  status: string;
  orderedAt: string | null;
  jumiaProductUrl: string;
};

const STATUS_OPTIONS = [
  "PLACED","CONFIRMED","PACKING","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"
];

export default function AdminOrders() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopId, setShopId] = useState<"all" | number>("all");
  const [status, setStatus] = useState<"all" | string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [checked, setChecked] = useState<Set<number>>(new Set());

  useEffect(() => { fetch("/api/shops").then(r=>r.json()).then(setShops); }, []);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams();
    if (shopId !== "all") q.set("shopId", String(shopId));
    if (status !== "all") q.set("status", status);
    // Note: our /api/orders supports shopId & status; for date range, extend if you want later
    const res = await fetch(`/api/orders?${q.toString()}`);
    setRows(await res.json());
    setChecked(new Set());
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [shopId, status]);

  const allChecked = useMemo(
    () => rows.length > 0 && rows.every(r => checked.has(r.id)),
    [rows, checked]
  );

  function toggleAll() {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(rows.map(r => r.id)));
  }
  function toggle(id: number) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  }

  async function setStatusForSelection(nextStatus: string) {
    if (checked.size === 0) return alert("Select at least one row.");
    const ids = Array.from(checked.values());
    const r = await fetch("/api/orders/status/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: nextStatus }),
    });
    if (!r.ok) return alert("Failed to update");
    await load();
  }

  return (
    <main style={{ maxWidth: 1200, margin: "32px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Admin · Orders</h1>
      <p style={{ marginTop: 0, color: "#6b7280" }}>
        Filter by shop/status. Select rows to bulk update statuses (e.g., mark OFD / Delivered / Returned).
      </p>

      <section style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap: 10, marginBottom: 12 }}>
        <select value={shopId} onChange={e=>setShopId(e.target.value==="all"?"all":Number(e.target.value))} style={input}>
          <option value="all">All shops</option>
          {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={input}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* reserved for future date filters */}
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={input} disabled />
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={input} disabled />
        <button onClick={load} disabled={loading} style={btnPrimary}>{loading?"Loading…":"Refresh"}</button>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={()=>setStatusForSelection("OUT_FOR_DELIVERY")} style={btnTiny}>Mark OFD</button>
          <button onClick={()=>setStatusForSelection("DELIVERED")} style={btnTiny}>Mark Delivered</button>
          <button onClick={()=>setStatusForSelection("RETURNED")} style={btnTinyBorder}>Mark Returned</button>
        </div>
      </section>

      <div style={{ border:"1px solid #e5e7eb", borderRadius:10, overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead style={{ background:"#f9fafb" }}>
            <tr>
              <Th><input type="checkbox" checked={allChecked} onChange={toggleAll}/></Th>
              <Th>Date</Th>
              <Th>Shop</Th>
              <Th>Order #</Th>
              <Th>Product</Th>
              <Th>Qty</Th>
              <Th>Status</Th>
              <Th>Selling (u)</Th>
              <Th>Buying (u)</Th>
              <Th>Link</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ padding: 16, textAlign: "center" }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={10} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No orders</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} style={{ borderTop:"1px solid #e5e7eb" }}>
                <Td><input type="checkbox" checked={checked.has(r.id)} onChange={()=>toggle(r.id)}/></Td>
                <Td>{r.orderedAt ? new Date(r.orderedAt).toISOString().slice(0,10) : "—"}</Td>
                <Td>{r.shopName}</Td>
                <Td>{r.externalOrderId}</Td>
                <Td>{r.productName}</Td>
                <Td>{r.quantity}</Td>
                <Td><span style={badge(r.status)}>{r.status}</span></Td>
                <Td>{r.sellingPricePerUnit ?? "-"}</Td>
                <Td>{r.buyingPricePerUnit ?? "-"}</Td>
                <Td><a href={r.jumiaProductUrl} target="_blank" rel="noreferrer">Open</a></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign:"left", padding:12, fontSize:14, fontWeight:600 }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={{ padding:10 }}>{children}</td>; }

const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:8 };

const btnPrimary: React.CSSProperties = { padding:"10px 12px", borderRadius:8, background:"#111827", color:"#fff", border:"none", cursor:"pointer" };
const btnTiny: React.CSSProperties = { padding:"8px 10px", borderRadius:6, background:"#111827", color:"#fff", border:"none", cursor:"pointer" };
const btnTinyBorder: React.CSSProperties = { padding:"8px 10px", borderRadius:6, border:"1px solid #ef4444", color:"#ef4444", background:"#fff", cursor:"pointer" };

function badge(status: string): React.CSSProperties {
  const base: React.CSSProperties = { padding:"2px 8px", borderRadius:999, fontSize:12, border:"1px solid #e5e7eb", background:"#fff" };
  if (status === "DELIVERED") return { ...base, borderColor:"#10b981", color:"#065f46" };
  if (status === "OUT_FOR_DELIVERY") return { ...base, borderColor:"#3b82f6", color:"#1e3a8a" };
  if (status === "RETURNED") return { ...base, borderColor:"#ef4444", color:"#7f1d1d" };
  return base;
}
